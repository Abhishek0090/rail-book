// Seeds PostgreSQL with one train, its route, coaches and seats.
// Triggered by GET /api/test once DATABASE_URL is set.
import { db } from "@/db";
import { stations } from "@/db/schema/stations";
import { trains } from "@/db/schema/train";
import { trainRoutes } from "@/db/schema/routes";
import { coaches } from "@/db/schema/coaches";
import { seats } from "@/db/schema/seats";

export async function seed() {
  console.log("Starting database seeding...");

  // 1. Stations
  const stationData = [
    {
      code: "LTT",
      name: "Lokmanya Tilak Terminus",
      city: "Mumbai",
      state: "Maharashtra",
    },
    {
      code: "KYN",
      name: "Kalyan Junction",
      city: "Kalyan",
      state: "Maharashtra",
    },
    { code: "NK", name: "Nashik Road", city: "Nashik", state: "Maharashtra" },
    {
      code: "BSL",
      name: "Bhusaval Junction",
      city: "Bhusaval",
      state: "Maharashtra",
    },
    {
      code: "JBP",
      name: "Jabalpur",
      city: "Jabalpur",
      state: "Madhya Pradesh",
    },
    {
      code: "PRYJ",
      name: "Prayagraj Junction",
      city: "Prayagraj",
      state: "Uttar Pradesh",
    },
  ];

  const insertedStations = await db
    .insert(stations)
    .values(stationData)
    .returning();

  const stationMap = Object.fromEntries(
    insertedStations.map((s) => [s.code, s.id]),
  );

  // 2. Train
  const [train] = await db
    .insert(trains)
    .values({
      number: "11055",
      name: "Godan Express",
      type: "Express",
    })
    .returning();

  // 3. Route (matches 11055 in src/data/trains.ts)
  const routeData = [
    { code: "LTT", stop: 1, arr: null, dep: "10:55", dist: 0 },
    { code: "KYN", stop: 2, arr: "11:35", dep: "11:40", dist: 32 },
    { code: "NK", stop: 3, arr: "13:45", dep: "13:50", dist: 165 },
    { code: "BSL", stop: 4, arr: "17:20", dep: "17:25", dist: 421 },
    { code: "JBP", stop: 5, arr: "01:35", dep: "01:45", dist: 987 },
    { code: "PRYJ", stop: 6, arr: "07:05", dep: null, dist: 1356 },
  ];

  await db.insert(trainRoutes).values(
    routeData.map((r) => ({
      train_id: train.id,
      station_id: stationMap[r.code],
      stop_number: r.stop,
      arrival_time: r.arr,
      departure_time: r.dep,
      distance_from_start: r.dist,
    })),
  );

  // 4. Coaches
  const coachList = [
    { code: "S1", type: "SL", seats: 72 },
    { code: "S2", type: "SL", seats: 72 },
    { code: "S3", type: "SL", seats: 72 },
    { code: "B1", type: "3A", seats: 64 },
    { code: "B2", type: "3A", seats: 64 },
  ];

  const insertedCoaches = await db
    .insert(coaches)
    .values(
      coachList.map((c) => ({
        train_id: train.id,
        coach_code: c.code,
        coach_type: c.type,
        total_seats: c.seats,
      })),
    )
    .returning();

  // 5. Seats
  const berthTypesSL = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];
  const berthTypes3A = ["LB", "UB", "SL", "SU"];

  const seatsToInsert = insertedCoaches.flatMap((coach) =>
    Array.from({ length: coach.total_seats }, (_, index) => ({
      coach_id: coach.id,
      seat_number: index + 1,
      berth_type:
        coach.coach_type === "SL"
          ? berthTypesSL[index % berthTypesSL.length]
          : berthTypes3A[index % berthTypes3A.length],
      position_meta: null,
    })),
  );

  await db.insert(seats).values(seatsToInsert);

  console.log(
    `Seeded ${insertedStations.length} stations, 1 train, ${insertedCoaches.length} coaches, ${seatsToInsert.length} seats.`,
  );
}
