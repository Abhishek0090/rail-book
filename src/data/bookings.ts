// Dummy bookings and PNRs. Swap these functions for database queries later.
import { persist } from "./persist";
import { calculateFare, getSegment, getTrain, type ClassCode } from "./trains";

export type BookingStatus = "CONFIRMED" | "RAC" | "WAITLIST" | "CANCELLED";

export type BookedPassenger = {
  name: string;
  age: number;
  gender: "Male" | "Female" | "Transgender";
  bookingStatus: string;
  currentStatus: string;
  coach: string | null;
  seat: number | null;
  berth: string | null;
};

export type Booking = {
  bookingId: string;
  userId: number;
  pnr: string;
  trainNo: string;
  from: string;
  to: string;
  journeyDate: string; // yyyy-MM-dd
  classCode: ClassCode;
  quota: "GN" | "TQ";
  status: BookingStatus;
  bookedOn: string;
  chartPrepared: boolean;
  passengers: BookedPassenger[];
};

export const CONVENIENCE_FEE = 35.4;
export const AGENT_FEE = 39.99;

// Mutable list: admins can change a booking's status.
export const BOOKINGS: Booking[] = persist("bookings", () => [
  {
    bookingId: "RB2610180001",
    userId: 1,
    pnr: "2828538983",
    trainNo: "12951",
    from: "MMCT",
    to: "NDLS",
    journeyDate: "2026-10-30",
    classCode: "3A",
    quota: "GN",
    status: "CONFIRMED",
    bookedOn: "2026-10-18",
    chartPrepared: false,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "CNF B3 21",
        currentStatus: "CNF B3 21",
        coach: "B3",
        seat: 21,
        berth: "LB",
      },
      {
        name: "Diya Sharma",
        age: 27,
        gender: "Female",
        bookingStatus: "CNF B3 24",
        currentStatus: "CNF B3 24",
        coach: "B3",
        seat: 24,
        berth: "UB",
      },
    ],
  },
  {
    bookingId: "RB2610200014",
    userId: 1,
    pnr: "4512093376",
    trainNo: "22177",
    from: "CSMT",
    to: "BSB",
    journeyDate: "2026-11-06",
    classCode: "SL",
    quota: "GN",
    status: "RAC",
    bookedOn: "2026-10-20",
    chartPrepared: false,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "GNWL 32",
        currentStatus: "RAC 14",
        coach: null,
        seat: null,
        berth: null,
      },
    ],
  },
  {
    bookingId: "RB2610210027",
    userId: 1,
    pnr: "6620418851",
    trainNo: "12009",
    from: "MMCT",
    to: "ADI",
    journeyDate: "2026-11-14",
    classCode: "CC",
    quota: "GN",
    status: "CONFIRMED",
    bookedOn: "2026-10-21",
    chartPrepared: false,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "CNF C2 45",
        currentStatus: "CNF C2 45",
        coach: "C2",
        seat: 45,
        berth: "WS",
      },
    ],
  },
  {
    bookingId: "RB2610220031",
    userId: 1,
    pnr: "7301928840",
    trainNo: "12301",
    from: "HWH",
    to: "NDLS",
    journeyDate: "2026-12-02",
    classCode: "2A",
    quota: "GN",
    status: "WAITLIST",
    bookedOn: "2026-10-22",
    chartPrepared: false,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "GNWL 11",
        currentStatus: "WL 6",
        coach: null,
        seat: null,
        berth: null,
      },
      {
        name: "Kavya Iyer",
        age: 58,
        gender: "Female",
        bookingStatus: "GNWL 12",
        currentStatus: "WL 7",
        coach: null,
        seat: null,
        berth: null,
      },
    ],
  },
  {
    bookingId: "RB2609050008",
    userId: 1,
    pnr: "8929929713",
    trainNo: "12952",
    from: "NDLS",
    to: "MMCT",
    journeyDate: "2026-09-18",
    classCode: "2A",
    quota: "GN",
    status: "CONFIRMED",
    bookedOn: "2026-09-05",
    chartPrepared: true,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "CNF A1 12",
        currentStatus: "CNF A1 12",
        coach: "A1",
        seat: 12,
        berth: "LB",
      },
    ],
  },
  {
    bookingId: "RB2607200019",
    userId: 1,
    pnr: "2508534421",
    trainNo: "11055",
    from: "LTT",
    to: "PRYJ",
    journeyDate: "2026-08-03",
    classCode: "SL",
    quota: "GN",
    status: "CANCELLED",
    bookedOn: "2026-07-20",
    chartPrepared: true,
    passengers: [
      {
        name: "Abhishek Pal",
        age: 29,
        gender: "Male",
        bookingStatus: "GNWL 48",
        currentStatus: "CAN",
        coach: null,
        seat: null,
        berth: null,
      },
    ],
  },
]);

// All bookings (admin), or one user's bookings.
export const getBookings = (userId?: number) =>
  userId === undefined ? BOOKINGS : BOOKINGS.filter((b) => b.userId === userId);

export const getBookingByPnr = (pnr: string) =>
  BOOKINGS.find((b) => b.pnr === pnr);

export const getBookingById = (bookingId: string) =>
  BOOKINGS.find((b) => b.bookingId === bookingId);

export const isUpcoming = (booking: Booking, today = new Date()) =>
  booking.status !== "CANCELLED" &&
  new Date(`${booking.journeyDate}T23:59:59`) >= today;

export const getBookingDetails = (booking: Booking) => {
  const train = getTrain(booking.trainNo)!;
  const segment = getSegment(train, booking.from, booking.to)!;
  const ticketFare =
    calculateFare(booking.classCode, segment.distanceKm) *
    booking.passengers.length;
  const total = Math.round(ticketFare + CONVENIENCE_FEE + AGENT_FEE);

  return {
    train,
    segment,
    fare: {
      ticketFare,
      convenienceFee: CONVENIENCE_FEE,
      agentFee: AGENT_FEE,
      gatewayFee: 0,
      total,
    },
  };
};
