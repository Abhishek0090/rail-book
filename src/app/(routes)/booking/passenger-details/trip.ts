// Resolves the booking draft in the URL (?train=&cls=&from=&to=&date=) on the server.
import { format, isValid, parseISO } from "date-fns";
import { getStation } from "@/constants/stations";
import {
  calculateFare,
  CLASS_NAMES,
  getSeatStatus,
  getSegment,
  getTrain,
  type ClassCode,
} from "@/data/trains";
import type { Trip } from "./PassengerForm";

export type TripParams = {
  train?: string;
  cls?: string;
  from?: string;
  to?: string;
  date?: string;
  pax?: string;
};

export function resolveTrip(params: TripParams) {
  const train = getTrain(params.train ?? "12951");
  const fromCode = params.from ?? "MMCT";
  const toCode = params.to ?? "NDLS";
  const segment = train && getSegment(train, fromCode, toCode);
  const classCode = (params.cls ?? train?.classes[0]) as ClassCode;
  if (!train || !segment || !train.classes.includes(classCode)) return null;

  const parsed = parseISO(params.date ?? "");
  const journeyDate = isValid(parsed) ? parsed : new Date();

  const trip: Trip = {
    trainNo: train.number,
    trainName: train.name,
    classCode,
    className: CLASS_NAMES[classCode],
    fromCode,
    fromName: getStation(fromCode)?.name ?? fromCode,
    toCode,
    toName: getStation(toCode)?.name ?? toCode,
    departTime: segment.departTime,
    date: format(journeyDate, "yyyy-MM-dd"),
  };

  return {
    trip,
    farePerPassenger: calculateFare(classCode, segment.distanceKm),
    seat: getSeatStatus(train.number, classCode, journeyDate),
    pax: Math.min(6, Math.max(1, Number(params.pax) || 1)),
  };
}
