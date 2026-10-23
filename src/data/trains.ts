// Dummy train data. Every function here stands in for a database query,
// so pages keep their imports and only the function bodies change later.
import { addDays, format } from "date-fns";
import { getStation } from "@/constants/stations";
import { persist } from "./persist";

export type ClassCode = "SL" | "3A" | "2A" | "1A" | "CC" | "EC";

export const CLASS_NAMES: Record<ClassCode, string> = {
  SL: "Sleeper",
  "3A": "Third AC",
  "2A": "Second AC",
  "1A": "First AC",
  CC: "AC Chair Car",
  EC: "Executive Chair Car",
};

const FARE_PER_KM: Record<ClassCode, number> = {
  SL: 0.45,
  "3A": 1.2,
  "2A": 1.75,
  "1A": 2.9,
  CC: 1.1,
  EC: 2.3,
};

const RESERVATION_CHARGE: Record<ClassCode, number> = {
  SL: 20,
  "3A": 40,
  "2A": 50,
  "1A": 60,
  CC: 40,
  EC: 60,
};

export type RouteStop = {
  code: string;
  arrive: string | null;
  depart: string | null;
  day: number;
  distanceKm: number;
  avgDelayMin: number;
  platform: number;
};

export type Train = {
  number: string;
  name: string;
  type: string;
  rating: number;
  runningDays: string[];
  pantry: boolean;
  classes: ClassCode[];
  route: RouteStop[];
};

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const stop = (
  code: string,
  arrive: string | null,
  depart: string | null,
  day: number,
  distanceKm: number,
  avgDelayMin: number,
  platform: number,
): RouteStop => ({
  code,
  arrive,
  depart,
  day,
  distanceKm,
  avgDelayMin,
  platform,
});

// Mutable list: the admin dashboard adds and removes trains.
export const TRAINS: Train[] = persist("trains", () => [
  {
    number: "12951",
    name: "Mumbai Rajdhani",
    type: "Rajdhani",
    rating: 4.5,
    runningDays: ALL_DAYS,
    pantry: true,
    classes: ["3A", "2A", "1A"],
    route: [
      stop("MMCT", null, "17:00", 1, 0, 0, 3),
      stop("ST", "19:40", "19:43", 1, 263, 5, 2),
      stop("BRC", "21:03", "21:13", 1, 392, 8, 4),
      stop("KOTA", "03:15", "03:25", 2, 920, 12, 1),
      stop("NDLS", "08:32", null, 2, 1386, 15, 16),
    ],
  },
  {
    number: "12952",
    name: "New Delhi Mumbai Rajdhani",
    type: "Rajdhani",
    rating: 4.4,
    runningDays: ALL_DAYS,
    pantry: true,
    classes: ["3A", "2A", "1A"],
    route: [
      stop("NDLS", null, "16:55", 1, 0, 0, 4),
      stop("KOTA", "21:35", "21:45", 1, 465, 6, 2),
      stop("BRC", "04:06", "04:16", 2, 993, 10, 3),
      stop("ST", "05:43", "05:46", 2, 1122, 9, 1),
      stop("MMCT", "08:35", null, 2, 1386, 14, 4),
    ],
  },
  {
    number: "12009",
    name: "Mumbai Ahmedabad Shatabdi",
    type: "Shatabdi",
    rating: 4.3,
    runningDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    pantry: true,
    classes: ["CC", "EC"],
    route: [
      stop("MMCT", null, "06:20", 1, 0, 0, 2),
      stop("ST", "09:06", "09:11", 1, 263, 4, 1),
      stop("BRC", "10:28", "10:33", 1, 392, 6, 5),
      stop("ADI", "11:55", null, 1, 491, 9, 8),
    ],
  },
  {
    number: "22177",
    name: "Mahanagari Express",
    type: "Superfast",
    rating: 4.1,
    runningDays: ALL_DAYS,
    pantry: true,
    classes: ["SL", "3A", "2A", "1A"],
    route: [
      stop("CSMT", null, "00:10", 1, 0, 0, 18),
      stop("KYN", "01:05", "01:10", 1, 54, 4, 5),
      stop("NK", "03:25", "03:30", 1, 187, 11, 2),
      stop("BSL", "06:40", "06:45", 1, 444, 17, 4),
      stop("JBP", "14:30", "14:40", 1, 1010, 22, 6),
      stop("PRYJ", "19:05", "19:15", 1, 1376, 25, 3),
      stop("BSB", "22:35", null, 1, 1509, 28, 8),
    ],
  },
  {
    number: "11055",
    name: "Godan Express",
    type: "Express",
    rating: 3.9,
    runningDays: ["Mon", "Wed", "Sat"],
    pantry: false,
    classes: ["SL", "3A", "2A"],
    route: [
      stop("LTT", null, "10:55", 1, 0, 0, 3),
      stop("KYN", "11:35", "11:40", 1, 32, 6, 6),
      stop("NK", "13:45", "13:50", 1, 165, 14, 2),
      stop("BSL", "17:20", "17:25", 1, 421, 21, 5),
      stop("JBP", "01:35", "01:45", 2, 987, 33, 4),
      stop("PRYJ", "07:05", null, 2, 1356, 41, 6),
    ],
  },
  {
    number: "12301",
    name: "Howrah New Delhi Rajdhani",
    type: "Rajdhani",
    rating: 4.6,
    runningDays: ALL_DAYS,
    pantry: true,
    classes: ["3A", "2A", "1A"],
    route: [
      stop("HWH", null, "16:50", 1, 0, 0, 9),
      stop("PRYJ", "02:15", "02:17", 2, 819, 7, 4),
      stop("CNB", "04:20", "04:25", 2, 1013, 10, 1),
      stop("NDLS", "10:00", null, 2, 1453, 12, 14),
    ],
  },
  {
    number: "12560",
    name: "Shivganga Express",
    type: "Superfast",
    rating: 4.2,
    runningDays: ALL_DAYS,
    pantry: true,
    classes: ["SL", "3A", "2A", "1A"],
    route: [
      stop("NDLS", null, "20:05", 1, 0, 0, 7),
      stop("CNB", "01:45", "01:50", 2, 440, 9, 3),
      stop("PRYJ", "04:40", "04:45", 2, 634, 12, 2),
      stop("BSB", "07:20", null, 2, 760, 15, 5),
    ],
  },
]);

export const getTrain = (number: string | null | undefined) =>
  TRAINS.find((t) => t.number === number);

// Plain {number, name} list for client-side pickers.
export const trainOptions = () =>
  TRAINS.map((t) => ({ number: t.number, name: t.name }));

// Minutes since 00:00 on day 1 of the journey.
const toMinutes = (time: string, day: number) => {
  const [h, m] = time.split(":").map(Number);
  return (day - 1) * 1440 + h * 60 + m;
};

export const formatDuration = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;

export const calculateFare = (classCode: ClassCode, distanceKm: number) =>
  Math.round(
    Math.max(distanceKm, 50) * FARE_PER_KM[classCode] +
      RESERVATION_CHARGE[classCode],
  );

export type Segment = {
  train: Train;
  from: RouteStop;
  to: RouteStop;
  departTime: string;
  arriveTime: string;
  dayOffset: number;
  durationMin: number;
  distanceKm: number;
};

export const getSegment = (
  train: Train,
  fromCode: string,
  toCode: string,
): Segment | null => {
  const fromIndex = train.route.findIndex((s) => s.code === fromCode);
  const toIndex = train.route.findIndex((s) => s.code === toCode);
  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) return null;

  const from = train.route[fromIndex];
  const to = train.route[toIndex];
  const departTime = from.depart!;
  const arriveTime = to.arrive!;

  return {
    train,
    from,
    to,
    departTime,
    arriveTime,
    dayOffset: to.day - from.day,
    durationMin: toMinutes(arriveTime, to.day) - toMinutes(departTime, from.day),
    distanceKm: to.distanceKm - from.distanceKm,
  };
};

export type SeatStatus = "AVL" | "RAC" | "WL";

// Stable pseudo-random number so server and client render the same values.
const hash = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
};

export const getSeatStatus = (
  trainNo: string,
  classCode: ClassCode,
  date: Date,
): { status: SeatStatus; count: number } => {
  const h = hash(`${trainNo}-${classCode}-${format(date, "yyyy-MM-dd")}`);
  const bucket = h % 10;
  if (bucket < 5) return { status: "AVL", count: 8 + (h % 90) };
  if (bucket < 7) return { status: "RAC", count: 1 + (h % 40) };
  return { status: "WL", count: 1 + (h % 80) };
};

export type ClassAvailability = {
  className: ClassCode;
  price: number;
  status: SeatStatus;
  count: number;
  availability: {
    date: string;
    day: string;
    iso: string;
    status: SeatStatus;
    count: number;
    price: number;
  }[];
};

export type TrainSearchResult = {
  trainNo: string;
  trainName: string;
  rating: number;
  fromTime: string;
  fromStation: string;
  duration: string;
  durationMin: number;
  toTime: string;
  toStation: string;
  dayOffset: number;
  journeyDate: string;
  seats: ClassAvailability[];
};

export const searchTrains = (
  fromCode: string | null,
  toCode: string | null,
  journeyDate: Date,
): TrainSearchResult[] => {
  if (!fromCode || !toCode) return [];

  return TRAINS.flatMap((train) => {
    const segment = getSegment(train, fromCode, toCode);
    if (!segment) return [];
    // Running days are for the origin station; boarding later on day 2
    // means the train left its origin the day before.
    const originDate = addDays(journeyDate, -(segment.from.day - 1));
    if (!train.runningDays.includes(format(originDate, "EEE"))) return [];

    const seats = train.classes.map((className) => {
      const price = calculateFare(className, segment.distanceKm);
      const days = [0, 1, 2].map((offset) => {
        const date = addDays(journeyDate, offset);
        return {
          date: format(date, "dd MMM"),
          day: format(date, "EEE"),
          iso: format(date, "yyyy-MM-dd"),
          price,
          ...getSeatStatus(train.number, className, date),
        };
      });
      return {
        className,
        price,
        status: days[0].status,
        count: days[0].count,
        availability: days,
      };
    });

    return [
      {
        trainNo: train.number,
        trainName: train.name,
        rating: train.rating,
        fromTime: segment.departTime,
        fromStation: fromCode,
        duration: formatDuration(segment.durationMin),
        durationMin: segment.durationMin,
        toTime: segment.arriveTime,
        toStation: toCode,
        dayOffset: segment.dayOffset,
        journeyDate: format(journeyDate, "yyyy-MM-dd"),
        seats,
      },
    ];
  });
};

export const POPULAR_ROUTES = [
  { from: "MMCT", to: "NDLS" },
  { from: "NDLS", to: "BSB" },
  { from: "MMCT", to: "ADI" },
  { from: "HWH", to: "NDLS" },
  { from: "CSMT", to: "PRYJ" },
];

export const stationLabel = (code: string) => {
  const station = getStation(code);
  return station ? `${station.name} - ${code}` : code;
};

const addMinutes = (time: string, minutes: number) => {
  const total = toMinutes(time, 1) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export type LiveStop = RouteStop & {
  name: string;
  state: "departed" | "current" | "upcoming";
  actualArrive: string | null;
  actualDepart: string | null;
  date: string;
};

// Dummy live running status: the train is treated as halfway along its route.
export const getLiveStatus = (train: Train, journeyDate: Date) => {
  const currentIndex = Math.floor((train.route.length - 1) / 2);

  const stops: LiveStop[] = train.route.map((s, index) => ({
    ...s,
    name: getStation(s.code)?.name ?? s.code,
    state:
      index < currentIndex
        ? "departed"
        : index === currentIndex
          ? "current"
          : "upcoming",
    actualArrive: s.arrive && addMinutes(s.arrive, s.avgDelayMin),
    actualDepart: s.depart && addMinutes(s.depart, s.avgDelayMin),
    date: format(addDays(journeyDate, s.day - 1), "dd MMM"),
  }));

  return {
    stops,
    current: stops[currentIndex],
    lastUpdated: format(new Date(), "dd MMM yyyy, HH:mm"),
  };
};
