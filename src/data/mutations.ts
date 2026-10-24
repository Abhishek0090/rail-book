// Write operations on the dummy data, used by the admin server actions.
// Each one validates input and throws MutationError with a readable message.
// When PostgreSQL is wired in, replace the array updates with Drizzle inserts.
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { STATIONS, getStation, type Station } from "@/constants/stations";
import { generatePnr } from "@/lib/pnr";
import { COACHES, defaultCoaches, type Coach } from "./admin";
import {
  BOOKINGS,
  type BookedPassenger,
  type Booking,
  type BookingStatus,
} from "./bookings";
import {
  CLASS_NAMES,
  TRAINS,
  getSeatStatus,
  getSegment,
  getTrain,
  type ClassCode,
  type RouteStop,
  type Train,
} from "./trains";

export class MutationError extends Error {}

const fail = (message: string): never => {
  throw new MutationError(message);
};

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BOOKING_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "RAC",
  "WAITLIST",
  "CANCELLED",
];

const removeWhere = <T>(list: T[], match: (item: T) => boolean) => {
  for (let i = list.length - 1; i >= 0; i--) {
    if (match(list[i])) list.splice(i, 1);
  }
};

// ---------- stations ----------

export function addStation(input: Station) {
  const station = {
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
  };
  if (!/^[A-Z]{2,5}$/.test(station.code)) {
    fail("Station code must be 2 to 5 letters, e.g. PUNE");
  }
  if (getStation(station.code)) fail(`Station ${station.code} already exists`);
  if (!station.name || !station.city || !station.state) {
    fail("Name, city and state are required");
  }
  STATIONS.push(station);
  return station;
}

export function deleteStation(code: string) {
  const usedBy = TRAINS.find((t) => t.route.some((s) => s.code === code));
  if (usedBy) {
    fail(`${code} is on the route of ${usedBy.number}. Remove the train first.`);
  }
  removeWhere(STATIONS, (s) => s.code === code);
}

// ---------- trains ----------

export type TrainInput = {
  number: string;
  name: string;
  type: string;
  runningDays: string[];
  pantry: boolean;
  classes: string[];
  route: {
    code: string;
    arrive: string;
    depart: string;
    day: number;
    distanceKm: number;
    platform: number;
  }[];
};

export function addTrain(input: TrainInput) {
  const number = input.number.trim();
  if (!/^\d{5}$/.test(number)) fail("Train number must be 5 digits");
  if (getTrain(number)) fail(`Train ${number} already exists`);
  if (input.name.trim().length < 3) fail("Enter the train name");

  const runningDays = DAYS.filter((d) => input.runningDays.includes(d));
  if (runningDays.length === 0) fail("Pick at least one running day");

  const classes = input.classes.filter(
    (c): c is ClassCode => c in CLASS_NAMES,
  );
  if (classes.length === 0) fail("Pick at least one class");

  if (input.route.length < 2) fail("A route needs at least 2 stops");
  const codes = new Set<string>();
  const route: RouteStop[] = input.route.map((s, i) => {
    const first = i === 0;
    const last = i === input.route.length - 1;
    const label = `Stop ${i + 1}`;

    if (!getStation(s.code)) fail(`${label}: pick a station`);
    if (codes.has(s.code)) fail(`${label}: ${s.code} is already on the route`);
    codes.add(s.code);
    if (!first && !TIME.test(s.arrive)) fail(`${label}: arrival must be HH:MM`);
    if (!last && !TIME.test(s.depart)) fail(`${label}: departure must be HH:MM`);
    if (!Number.isInteger(s.day) || s.day < 1 || s.day > 4) {
      fail(`${label}: day must be 1 to 4`);
    }
    if (first && s.distanceKm !== 0) fail("The first stop must be at 0 km");
    if (!first && !(s.distanceKm > input.route[i - 1].distanceKm)) {
      fail(`${label}: distance must be more than the previous stop`);
    }
    if (i > 0 && s.day < input.route[i - 1].day) {
      fail(`${label}: day cannot be before the previous stop`);
    }

    return {
      code: s.code,
      arrive: first ? null : s.arrive,
      depart: last ? null : s.depart,
      day: s.day,
      distanceKm: s.distanceKm,
      avgDelayMin: 0,
      platform: s.platform > 0 ? s.platform : 1,
    };
  });

  const train: Train = {
    number,
    name: input.name.trim(),
    type: input.type.trim() || "Express",
    rating: 4.0,
    runningDays,
    pantry: input.pantry,
    classes,
    route,
  };
  TRAINS.push(train);
  COACHES.push(...defaultCoaches(train));
  return train;
}

export function deleteTrain(number: string) {
  if (BOOKINGS.some((b) => b.trainNo === number)) {
    fail(`Train ${number} has bookings and cannot be deleted`);
  }
  removeWhere(TRAINS, (t) => t.number === number);
  removeWhere(COACHES, (c) => c.trainNo === number);
}

// ---------- coaches ----------

export function addCoach(input: Coach) {
  const train = getTrain(input.trainNo) ?? fail("Pick a train");
  const code = input.code.trim().toUpperCase();
  if (!/^[A-Z]{1,2}\d{1,2}$/.test(code)) fail("Coach code looks like B4 or S10");
  if (!train.classes.includes(input.classCode)) {
    fail(`${train.number} has no ${input.classCode} class`);
  }
  if (COACHES.some((c) => c.trainNo === train.number && c.code === code)) {
    fail(`${train.number} already has coach ${code}`);
  }
  if (!Number.isInteger(input.totalSeats) || input.totalSeats < 1 || input.totalSeats > 120) {
    fail("Seats must be between 1 and 120");
  }
  const coach = { ...input, trainNo: train.number, code };
  COACHES.push(coach);
  return coach;
}

export function deleteCoach(trainNo: string, code: string) {
  const remaining = COACHES.filter((c) => c.trainNo === trainNo);
  const coach = remaining.find((c) => c.code === code) ?? fail("Coach not found");
  if (remaining.filter((c) => c.classCode === coach.classCode).length === 1) {
    fail(`This is the last ${coach.classCode} coach on ${trainNo}`);
  }
  removeWhere(COACHES, (c) => c.trainNo === trainNo && c.code === code);
}

// ---------- bookings ----------

export type NewBooking = {
  userId: number;
  trainNo: string;
  classCode: string;
  from: string;
  to: string;
  date: string; // yyyy-MM-dd
  passengers: { name: string; age: number; gender: BookedPassenger["gender"]; berth: string }[];
};

// Creates a booking owned by input.userId (the signed-in passenger). Status follows the dummy
// availability: AVL -> confirmed seats, RAC -> RAC, WL -> waitlist.
export function createBooking(input: NewBooking) {
  const train = getTrain(input.trainNo) ?? fail("Train not found");
  const classCode = input.classCode as ClassCode;
  if (!train.classes.includes(classCode)) fail("Class not available on this train");
  if (!getSegment(train, input.from, input.to)) fail("Train does not run on this route");
  const date = parseISO(input.date);
  if (!isValid(date) || date < startOfDay(new Date())) fail("Pick a journey date from today");
  if (!Array.isArray(input.passengers) || input.passengers.length < 1 || input.passengers.length > 6) {
    fail("Add 1 to 6 passengers");
  }
  for (const p of input.passengers) {
    if (typeof p.name !== "string" || p.name.trim().length < 2 || p.name.length > 60) {
      fail("Each passenger needs a name");
    }
    if (!Number.isInteger(p.age) || p.age < 1 || p.age > 120) fail(`Invalid age for ${p.name}`);
    if (!["Male", "Female", "Transgender"].includes(p.gender)) fail(`Invalid gender for ${p.name}`);
    if (typeof p.berth !== "string") fail(`Invalid berth for ${p.name}`);
  }

  const { status, count } = getSeatStatus(train.number, classCode, date);
  const coach = COACHES.find((c) => c.trainNo === train.number && c.classCode === classCode);
  const passengers: BookedPassenger[] = input.passengers.map((p, i) => {
    if (status === "AVL" && coach) {
      const seat = ((count + i * 3) % coach.totalSeats) + 1;
      const label = `CNF ${coach.code} ${seat}`;
      return { ...p, bookingStatus: label, currentStatus: label, coach: coach.code, seat, berth: p.berth.slice(0, 2).toUpperCase() };
    }
    const label = `${status === "RAC" ? "RAC" : "WL"} ${count + i}`;
    return { ...p, bookingStatus: `GN${label.replace(" ", "")}`, currentStatus: label, coach: null, seat: null, berth: null };
  });

  const now = new Date();
  let pnr = generatePnr();
  while (BOOKINGS.some((b) => b.pnr === pnr)) pnr = generatePnr();

  const booking: Booking = {
    userId: input.userId,
    bookingId: `RB${format(now, "yyMMdd")}${String(BOOKINGS.length + 1).padStart(4, "0")}`,
    pnr,
    trainNo: train.number,
    from: input.from,
    to: input.to,
    journeyDate: format(date, "yyyy-MM-dd"),
    classCode,
    quota: "GN",
    status: status === "AVL" ? "CONFIRMED" : status === "RAC" ? "RAC" : "WAITLIST",
    bookedOn: format(now, "yyyy-MM-dd"),
    chartPrepared: false,
    passengers,
  };
  BOOKINGS.push(booking);
  return booking;
}

export function setBookingStatus(bookingId: string, status: string) {
  const booking =
    BOOKINGS.find((b) => b.bookingId === bookingId) ?? fail("Booking not found");
  if (!BOOKING_STATUSES.includes(status as BookingStatus)) fail("Unknown status");
  booking.status = status as BookingStatus;
  if (status === "CANCELLED") {
    booking.passengers.forEach((p) => (p.currentStatus = "CAN"));
  }
  return booking;
}
