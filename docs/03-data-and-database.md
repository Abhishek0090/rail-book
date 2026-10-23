# 03 - Data and the database

## The dummy data store

| File | Holds | Main functions |
| --- | --- | --- |
| `src/constants/stations.ts` | `STATIONS` (16) | `getStation(code)` |
| `src/data/trains.ts` | `TRAINS` (7) with routes, classes, running days | `getTrain`, `getSegment`, `searchTrains`, `calculateFare`, `getSeatStatus`, `getLiveStatus`, `trainOptions` |
| `src/data/bookings.ts` | `BOOKINGS` (6 to start) | `getBookings`, `getBookingByPnr`, `getBookingById`, `isUpcoming`, `getBookingDetails` |
| `src/data/admin.ts` | `COACHES` (generated per train) | `getCoaches`, `getSeats`, `getAdminStats`, `defaultCoaches` |
| `src/data/user.ts` | `CURRENT_USER` | `initials` |
| `src/data/mutations.ts` | every write, with validation | `addStation`, `deleteStation`, `addTrain`, `deleteTrain`, `addCoach`, `deleteCoach`, `setBookingStatus`, `createBooking` |
| `src/data/persist.ts` | `persist(key, initial)` | keeps the arrays on `globalThis` |

`persist()` keeps each array on `globalThis`, so admin changes survive dev hot reloads. They reset when the
server restarts. Arrays are mutated in place (`push`, `splice`), so every module that imported them sees the
change.

Only server code should read the store. Client components get data as props from a server page. A client
bundle has its own copy of these modules and would not see changes. That is why `HeroSearch` receives
`stations` and `TrainNumberSearch` receives `trains`.

### How the numbers are made

- **Fare.** `calculateFare(class, km)` = max(km, 50) x per-km rate + reservation charge. Booking totals add
  `CONVENIENCE_FEE` (35.40) and `AGENT_FEE` (39.99).
- **Availability.** `getSeatStatus(train, class, date)` hashes the three values into AVL, RAC or WL with a
  count. It is deterministic, so search, summary and booking always agree.
- **Running days.** `searchTrains` skips a train if it does not leave its origin on that weekday. It
  allows for boarding on day 2 of the journey.
- **Live status.** `getLiveStatus` marks the middle stop as current and adds each stop's `avgDelayMin`.

### Validation rules (mutations.ts)

| Rule | Detail |
| --- | --- |
| Station code | 2 to 5 letters, unique |
| Train number | 5 digits, unique |
| Route | 2 or more stops, all existing stations, no repeats. The first stop has no arrival and is at 0 km. The last stop has no departure. Distance increases. Day is 1 to 4 and never goes backwards |
| Adding a train | Creates default coaches for each class |
| Deleting a train | Not allowed when bookings reference it |
| Deleting a station | Not allowed while a route uses it |
| Deleting a coach | The last coach of a class cannot be deleted |
| Bookings | Valid train, class and route. Date from today. 1 to 6 passengers with name, age 1 to 120 and gender |

They throw `MutationError`. Server actions and API routes turn that into a readable message or a 400.

## Moving to PostgreSQL

The schema already exists in `src/db/schema/` (stations, trains, routes, coaches, seats, bookings,
transactions, users), with migrations in `src/drizzle/`. `src/db/index.ts` creates a `pg` Pool, which
connects lazily, so importing it never crashes the server.

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
2. Run the migrations: `npx drizzle-kit migrate`.
3. Seed sample rows: open `GET /api/test`. It runs `src/db/seed.ts` for train 11055 with its route, coaches
   and seats.
4. Replace the store one module at a time. Keep each function's name and return shape, and change its body
   to a Drizzle query, for example:

```ts
// src/data/trains.ts
export const getTrain = async (number: string) =>
  (await db.select().from(trains).where(eq(trains.number, number)))[0];
```

5. Functions that become `async` need `await` at their call sites. They are all in server components and
   server actions, so the change is mechanical.
6. Point `createBooking` at the real flow in `POST /api/booking/create`. It locks the seat
   (`withSeatLock`) and writes the booking and transaction in one DB transaction.
7. Delete `persist.ts` once nothing imports it.
