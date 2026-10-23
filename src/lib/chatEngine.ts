// Rule-based booking assistant. reply() takes the conversation state and the
// user's message and returns the next state plus bot messages. Server-only:
// it is called through the chatReply server action and can create bookings.
// It runs on the dummy data in src/data; swap it for an LLM call later if needed.
import { addDays, format, isValid, parse, parseISO, startOfDay } from "date-fns";
import { STATIONS, getStation, type Station } from "@/constants/stations";
import { getBookingByPnr, getBookingDetails } from "@/data/bookings";
import { createBooking, MutationError } from "@/data/mutations";
import { CURRENT_USER } from "@/data/user";
import {
  CLASS_NAMES,
  getTrain,
  searchTrains,
  type ClassCode,
  type TrainSearchResult,
} from "@/data/trains";

export type ChatMessage = {
  id: number;
  role: "bot" | "user";
  text: string;
  chips?: string[];
  link?: { href: string; label: string };
};

type Step = "idle" | "from" | "to" | "date" | "train" | "class" | "pax" | "confirm";

export type ChatState = {
  step: Step;
  from?: string;
  to?: string;
  date?: string; // yyyy-MM-dd
  trainNo?: string;
  cls?: ClassCode;
  pax?: number;
  results?: TrainSearchResult[];
};

export const INITIAL_STATE: ChatState = { step: "idle" };

const MAIN_CHIPS = [
  "Book a ticket",
  "Mumbai to Delhi tomorrow",
  "PNR 2828538983",
  "Live status 12951",
];

let nextId = 1;
const bot = (
  text: string,
  extra: Omit<ChatMessage, "id" | "role" | "text"> = {},
): ChatMessage => ({ id: nextId++, role: "bot", text, ...extra });

export const greeting = (): ChatMessage[] => [
  bot(
    "Hi, I am the RailBook assistant. I can book a train ticket for you, check a PNR, or show live running status and schedules.",
    { chips: MAIN_CHIPS },
  ),
];

// ---------- parsing helpers ----------

export const findStation = (text: string): Station | undefined => {
  const raw = text.trim();
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  const lower = raw.toLowerCase();

  const byCode = STATIONS.find((s) => s.code === upper);
  if (byCode) return byCode;

  // Prefer the main station when a city has several (Mumbai -> MMCT).
  const aliases: Record<string, string> = {
    delhi: "NDLS",
    "new delhi": "NDLS",
    mumbai: "MMCT",
    bombay: "MMCT",
    kolkata: "HWH",
    calcutta: "HWH",
    howrah: "HWH",
    varanasi: "BSB",
    banaras: "BSB",
    allahabad: "PRYJ",
    prayagraj: "PRYJ",
    kanpur: "CNB",
    ahmedabad: "ADI",
    vadodara: "BRC",
    baroda: "BRC",
  };
  if (aliases[lower]) return getStation(aliases[lower]);

  const exact = STATIONS.find(
    (s) => s.name.toLowerCase() === lower || s.city.toLowerCase() === lower,
  );
  if (exact || lower.length < 3) return exact;

  return STATIONS.find(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      lower.includes(s.name.toLowerCase()) ||
      lower.includes(s.city.toLowerCase()),
  );
};

export const parseDate = (text: string, today = new Date()): Date | undefined => {
  const t = text.trim().toLowerCase();
  const base = startOfDay(today);
  if (!t) return undefined;
  if (t.includes("day after tomorrow")) return addDays(base, 2);
  if (t.includes("tomorrow")) return addDays(base, 1);
  if (t.includes("today") || t === "now") return base;

  const iso = parseISO(t);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t) && isValid(iso)) return iso;

  for (const pattern of ["d MMM", "d MMMM", "MMM d", "MMMM d", "d/M", "d-M", "d/M/yyyy"]) {
    const parsed = parse(t.replace(/(st|nd|rd|th)\b/, ""), pattern, base);
    if (isValid(parsed)) {
      // "5 Jan" in October means next January.
      return parsed < base && !pattern.includes("yyyy")
        ? new Date(parsed.getFullYear() + 1, parsed.getMonth(), parsed.getDate())
        : parsed;
    }
  }
  return undefined;
};

// "mumbai to delhi on 30 oct", "from LTT to PRYJ tomorrow"
const parseRoute = (text: string) => {
  const match = text.match(
    /(?:from\s+)?([a-z .]+?)\s+to\s+([a-z .]+?)(?:\s+(?:on\s+)?(today|tomorrow|day after tomorrow|\d.*|[a-z]{3,9}\s+\d{1,2}))?\s*$/i,
  );
  if (!match) return {};
  const strip = (s: string) =>
    s
      .replace(/\b(book|a|ticket|tickets|train|trains|for|me|i want|please|from)\b/gi, "")
      .trim();
  return {
    from: findStation(strip(match[1])),
    to: findStation(strip(match[2])),
    date: match[3] ? parseDate(match[3]) : undefined,
  };
};

// ---------- prompts for each step ----------

const askFrom = () =>
  bot("Where are you travelling from?", {
    chips: ["Mumbai", "New Delhi", "Howrah", "CSMT"],
  });

const askTo = (from: string) =>
  bot(`From ${getStation(from)?.name}. Where to?`, {
    chips: ["New Delhi", "Varanasi", "Ahmedabad", "Prayagraj"].filter(
      (c) => findStation(c)?.code !== from,
    ),
  });

const askDate = () =>
  bot("When do you want to travel? (for example: tomorrow, 30 Oct)", {
    chips: ["Today", "Tomorrow", "Day after tomorrow"],
  });

const resultsMessage = (state: ChatState): [ChatState, ChatMessage[]] => {
  const date = parseISO(state.date!);
  const results = searchTrains(state.from!, state.to!, date);
  if (results.length === 0) {
    return [
      { step: "from" },
      [
        bot(
          `I could not find direct trains from ${getStation(state.from)?.name} to ${getStation(state.to)?.name}. Try another route, for example Mumbai to New Delhi.`,
        ),
        askFrom(),
      ],
    ];
  }

  const lines = results
    .map(
      (r, i) =>
        `${i + 1}. ${r.trainNo} ${r.trainName} - ${r.fromTime} to ${r.toTime}${r.dayOffset ? ` (+${r.dayOffset})` : ""}, ${r.duration}`,
    )
    .join("\n");

  return [
    { ...state, step: "train", results },
    [
      bot(
        `${results.length} train${results.length > 1 ? "s" : ""} on ${format(date, "EEE, dd MMM")}:\n${lines}\n\nWhich one would you like?`,
        { chips: results.map((r) => `${r.trainNo} ${r.trainName}`) },
      ),
    ],
  ];
};

const askClass = (state: ChatState): ChatMessage => {
  const train = state.results!.find((r) => r.trainNo === state.trainNo)!;
  const lines = train.seats
    .map(
      (s) =>
        `${s.className} (${CLASS_NAMES[s.className]}) - Rs ${s.price} - ${s.status} ${s.count}`,
    )
    .join("\n");
  return bot(`${train.trainNo} ${train.trainName}. Pick a class:\n${lines}`, {
    chips: train.seats.map((s) => s.className),
  });
};

const askPax = () =>
  bot("How many passengers? (1 to 6)", { chips: ["1", "2", "3", "4"] });

const summary = (state: ChatState): ChatMessage => {
  const train = state.results!.find((r) => r.trainNo === state.trainNo)!;
  const seat = train.seats.find((s) => s.className === state.cls)!;
  return bot(
    `Please confirm:\n${train.trainNo} ${train.trainName}\n${getStation(state.from)?.name} (${train.fromTime}) to ${getStation(state.to)?.name} (${train.toTime})\n${format(parseISO(state.date!), "EEE, dd MMM yyyy")} - ${state.cls} - ${state.pax} passenger${state.pax! > 1 ? "s" : ""}\nStatus: ${seat.status} ${seat.count}\nFare: Rs ${seat.price * state.pax!} + fees`,
    { chips: ["Confirm and pay", "Review on payment page", "Change class", "Start over"] },
  );
};

// Ask for whatever is still missing in the booking draft.
const advance = (state: ChatState): [ChatState, ChatMessage[]] => {
  if (!state.from) return [{ ...state, step: "from" }, [askFrom()]];
  if (!state.to) return [{ ...state, step: "to" }, [askTo(state.from)]];
  if (!state.date) return [{ ...state, step: "date" }, [askDate()]];
  return resultsMessage(state);
};

// ---------- intents that work at any step ----------

const handleGlobal = (text: string): ChatMessage[] | null => {
  const lower = text.toLowerCase();

  const pnr = text.match(/\b(\d{10})\b/);
  if (pnr) {
    const booking = getBookingByPnr(pnr[1]);
    if (!booking) {
      return [
        bot(`PNR ${pnr[1]} was not found. Try 2828538983 or 4512093376.`),
      ];
    }
    const { train, segment } = getBookingDetails(booking);
    const statuses = booking.passengers
      .map((p, i) => `${i + 1}. ${p.name}: ${p.currentStatus}`)
      .join("\n");
    return [
      bot(
        `PNR ${booking.pnr}: ${train.number} ${train.name}\n${booking.from} ${segment.departTime} to ${booking.to} ${segment.arriveTime}, ${format(parseISO(booking.journeyDate), "dd MMM yyyy")}, ${booking.classCode}\n${statuses}`,
        { link: { href: `/pnr/${booking.pnr}`, label: "Open PNR status" } },
      ),
    ];
  }

  const trainNo = text.match(/\b(\d{5})\b/)?.[1];
  if (trainNo && /status|running|live|where/.test(lower)) {
    const train = getTrain(trainNo);
    return [
      train
        ? bot(`Live running status for ${train.number} ${train.name}:`, {
            link: {
              href: `/train/running-status/${train.number}`,
              label: "Open live status",
            },
          })
        : bot(`Train ${trainNo} was not found. Try 12951 or 22177.`),
    ];
  }
  if (trainNo && /schedule|route|time ?table|stops/.test(lower)) {
    const train = getTrain(trainNo);
    return [
      train
        ? bot(
            `${train.number} ${train.name} stops at ${train.route.map((s) => s.code).join(", ")}. Runs ${train.runningDays.length === 7 ? "daily" : train.runningDays.join(" ")}.`,
            {
              link: {
                href: `/train/schedule/${train.number}`,
                label: "Open full schedule",
              },
            },
          )
        : bot(`Train ${trainNo} was not found. Try 12951 or 22177.`),
    ];
  }

  if (/^(help|menu|hi|hello|hey)\b/.test(lower)) return greeting();
  return null;
};

// ---------- main entry ----------

export function reply(state: ChatState, input: string): [ChatState, ChatMessage[]] {
  const text = input.trim();
  const lower = text.toLowerCase();

  if (/^(start over|restart|reset|cancel)$/.test(lower)) {
    return [INITIAL_STATE, [bot("Okay, starting over.", { chips: MAIN_CHIPS })]];
  }

  // PNR, live status and schedule questions work at any point, except when
  // the user is answering "which train / class / how many" with a number.
  const answeringWithNumber =
    ["train", "class", "pax"].includes(state.step) &&
    /^\d{1,5}\b/.test(text) &&
    !/status|running|live|schedule|route/.test(lower);
  if (!answeringWithNumber) {
    const global = handleGlobal(text);
    if (global) return [state, global];
  }

  switch (state.step) {
    case "idle": {
      const route = parseRoute(text);
      if (route.from || route.to || /book|ticket|train/.test(lower)) {
        return advance({
          step: "idle",
          from: route.from?.code,
          to: route.to?.code,
          date: route.date && format(route.date, "yyyy-MM-dd"),
        });
      }
      return [
        state,
        [
          bot(
            "I can help with booking tickets, PNR status, live train status and schedules. Try one of these:",
            { chips: MAIN_CHIPS },
          ),
        ],
      ];
    }

    case "from": {
      const route = parseRoute(text);
      const from = route.from ?? findStation(text);
      if (!from) {
        return [state, [bot("I did not recognise that station. Try a city or a code like MMCT."), askFrom()]];
      }
      return advance({
        ...state,
        from: from.code,
        to: route.to?.code ?? state.to,
        date: route.date ? format(route.date, "yyyy-MM-dd") : state.date,
      });
    }

    case "to": {
      const to = findStation(text);
      if (!to) return [state, [bot("I did not recognise that station."), askTo(state.from!)]];
      if (to.code === state.from) {
        return [state, [bot("Origin and destination are the same. Pick another destination."), askTo(state.from!)]];
      }
      return advance({ ...state, to: to.code });
    }

    case "date": {
      const date = parseDate(text);
      if (!date || date < startOfDay(new Date())) {
        return [state, [bot("Please give a date from today onwards."), askDate()]];
      }
      return advance({ ...state, date: format(date, "yyyy-MM-dd") });
    }

    case "train": {
      const results = state.results ?? [];
      const index = Number(text) - 1;
      const train =
        results[index] ??
        results.find(
          (r) =>
            text.includes(r.trainNo) ||
            r.trainName.toLowerCase().includes(lower),
        );
      if (!train) {
        return [state, [bot("Pick one of the trains above (number or name).", { chips: results.map((r) => `${r.trainNo} ${r.trainName}`) })]];
      }
      const next = { ...state, step: "class" as const, trainNo: train.trainNo };
      return [next, [askClass(next)]];
    }

    case "class": {
      const train = state.results!.find((r) => r.trainNo === state.trainNo)!;
      const cls = train.seats.find(
        (s) =>
          s.className.toLowerCase() === lower ||
          CLASS_NAMES[s.className].toLowerCase() === lower ||
          lower.startsWith(s.className.toLowerCase()),
      )?.className;
      if (!cls) return [state, [askClass(state)]];
      return [{ ...state, step: "pax", cls }, [askPax()]];
    }

    case "pax": {
      const pax = Number(text.match(/\d+/)?.[0]);
      if (!Number.isInteger(pax) || pax < 1 || pax > 6) {
        return [state, [askPax()]];
      }
      const next = { ...state, step: "confirm" as const, pax };
      return [next, [summary(next)]];
    }

    case "confirm": {
      if (/change class/.test(lower)) {
        return [{ ...state, step: "class" }, [askClass(state)]];
      }
      if (/review|payment page/.test(lower)) {
        const params = new URLSearchParams({
          train: state.trainNo!,
          cls: state.cls!,
          from: state.from!,
          to: state.to!,
          date: state.date!,
          pax: String(state.pax),
        });
        return [
          INITIAL_STATE,
          [
            bot("Review passengers and fare, then pay on the next page.", {
              link: {
                href: `/booking/passenger-details/summary?${params}`,
                label: "Open payment page",
              },
              chips: ["Book another ticket"],
            }),
          ],
        ];
      }
      if (/confirm|yes|pay|book/.test(lower)) {
        // Demo payment: books straight away for the user's saved passengers.
        try {
          const booking = createBooking({
            trainNo: state.trainNo!,
            classCode: state.cls!,
            from: state.from!,
            to: state.to!,
            date: state.date!,
            passengers: Array.from({ length: state.pax! }, (_, i) => {
              const saved = CURRENT_USER.savedPassengers[i];
              return saved
                ? { name: saved.name, age: saved.age, gender: saved.gender, berth: saved.berth }
                : { name: `Passenger ${i + 1}`, age: 30, gender: "Male" as const, berth: "No Preference" };
            }),
          });
          const { fare } = getBookingDetails(booking);
          const statuses = booking.passengers
            .map((p) => `${p.name}: ${p.currentStatus}`)
            .join("\n");
          return [
            INITIAL_STATE,
            [
              bot(
                `Payment of Rs ${fare.total} received (demo). Ticket booked!\nPNR ${booking.pnr} - ${booking.status}\n${statuses}`,
                {
                  link: { href: `/booking/tickets/${booking.pnr}`, label: "View e-ticket" },
                  chips: ["Book another ticket", `PNR ${booking.pnr}`],
                },
              ),
            ],
          ];
        } catch (error) {
          if (error instanceof MutationError) {
            return [{ ...state, step: "confirm" }, [bot(error.message, { chips: ["Start over"] })]];
          }
          throw error;
        }
      }
      return [state, [summary(state)]];
    }
  }
}
