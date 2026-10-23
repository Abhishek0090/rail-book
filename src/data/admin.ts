// Dummy admin data: coaches, seat layouts and dashboard stats.
import { STATIONS } from "@/constants/stations";
import { BOOKINGS, getBookingDetails } from "./bookings";
import { persist } from "./persist";
import { TRAINS, type ClassCode, type Train } from "./trains";

export const COACH_PREFIX: Record<ClassCode, string> = {
  SL: "S",
  "3A": "B",
  "2A": "A",
  "1A": "H",
  CC: "C",
  EC: "E",
};

const COACH_COUNT: Record<ClassCode, number> = {
  SL: 8,
  "3A": 5,
  "2A": 3,
  "1A": 1,
  CC: 6,
  EC: 2,
};

export const SEATS_PER_COACH: Record<ClassCode, number> = {
  SL: 72,
  "3A": 64,
  "2A": 48,
  "1A": 24,
  CC: 78,
  EC: 56,
};

export type Coach = {
  trainNo: string;
  code: string;
  classCode: ClassCode;
  totalSeats: number;
};

// Default rake for a train: a fixed number of coaches per class.
export const defaultCoaches = (train: Train): Coach[] =>
  train.classes.flatMap((classCode) =>
    Array.from({ length: COACH_COUNT[classCode] }, (_, i) => ({
      trainNo: train.number,
      code: `${COACH_PREFIX[classCode]}${i + 1}`,
      classCode,
      totalSeats: SEATS_PER_COACH[classCode],
    })),
  );

// Mutable list: the admin dashboard adds and removes coaches.
export const COACHES: Coach[] = persist("coaches", () =>
  TRAINS.flatMap(defaultCoaches),
);

export const getCoaches = (trainNo?: string) =>
  trainNo ? COACHES.filter((c) => c.trainNo === trainNo) : COACHES;

const SLEEPER_BERTHS = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];
const AC_BERTHS = ["LB", "UB", "LB", "UB", "SL", "SU"];
const CHAIR_SEATS = ["WS", "MS", "AS", "AS", "MS", "WS"];

export type Seat = {
  number: number;
  berth: string;
  booked: boolean;
};

export const getSeats = (coach: Coach): Seat[] => {
  const pattern =
    coach.classCode === "SL"
      ? SLEEPER_BERTHS
      : coach.classCode === "CC" || coach.classCode === "EC"
        ? CHAIR_SEATS
        : AC_BERTHS;

  return Array.from({ length: coach.totalSeats }, (_, i) => ({
    number: i + 1,
    berth: pattern[i % pattern.length],
    // Deterministic "booked" pattern so the layout looks realistic.
    booked: (i * 7 + coach.code.charCodeAt(1) + Number(coach.trainNo)) % 3 !== 0,
  }));
};

export const getAdminStats = () => {
  const revenue = BOOKINGS.filter((b) => b.status !== "CANCELLED").reduce(
    (sum, b) => sum + getBookingDetails(b).fare.total,
    0,
  );

  return {
    trains: TRAINS.length,
    stations: STATIONS.length,
    coaches: COACHES.length,
    seats: COACHES.reduce((sum, c) => sum + c.totalSeats, 0),
    bookings: BOOKINGS.length,
    revenue,
  };
};
