# 03 - Data and the database

## The dummy data store

| File | Holds | Main functions |
| --- | --- | --- |
| `src/constants/stations.ts` | `STATIONS` (16) | `getStation(code)` |
| `src/data/trains.ts` | `TRAINS` (7) with routes, classes, running days | `getTrain`, `getSegment`, `searchTrains`, `calculateFare`, `getSeatStatus`, `getLiveStatus`, `trainOptions` |
| `src/data/bookings.ts` | `BOOKINGS` (6 to start, all owned by user 1) | `getBookings(userId?)`, `getBookingByPnr`, `getBookingById`, `isUpcoming`, `getBookingDetails` |
| `src/data/users.ts` | users with scrypt password hashes (1 demo user to start) | `getUser`, `authenticate`, `createUser`, `DEMO_USER` |
| `src/data/user.ts` | types only: `PublicUser`, `SavedPassenger` | `initials` (safe for client components) |
| `src/data/admin.ts` | `COACHES` (generated per train) | `getCoaches`, `getSeats`, `getAdminStats`, `defaultCoaches` |
| `src/data/mutations.ts` | every booking and admin write, with validation | `addStation`, `deleteStation`, `addTrain`, `deleteTrain`, `addCoach`, `deleteCoach`, `setBookingStatus`, `createBooking` |
| `src/data/persist.ts` | `persist(key, initial)` | keeps the arrays on `globalThis` |

### How the store works

- `persist()` keeps each array on `globalThis`, so changes survive dev hot reloads. They reset when the
  server restarts, and every server instance has its own copy.
- Arrays are mutated in place (`push`, `splice`), so every module that imported them sees the change.
- Only server code should read the store. Client components get data as props from a server page. A client
  bundle has its own copy of these modules and would not see changes. That is why:
  - `HeroSearch` receives `stations`
  - `TrainNumberSearch` receives `trains`
  - `PassengerForm` receives the signed-in `user`
- `users.ts` imports Node's crypto, so never import it from a `"use client"` file. Use the types in
  `user.ts` there instead.

### Ownership

Every booking has a `userId`. The passenger pages and APIs read `getBookings(user.id)`. The ticket page
returns 404 for someone else's PNR. Admin pages call `getBookings()` with no argument to see everything.
The public PNR status page (`/pnr/[n]`) shows any PNR, like real railway enquiries.

### How the numbers are made

- **Fare.** `calculateFare(class, km)` = max(km, 50) x per-km rate + reservation charge. Booking totals add
  `CONVENIENCE_FEE` (35.40) and `AGENT_FEE` (39.99).
- **Availability.** `getSeatStatus(train, class, date)` hashes the three values into AVL, RAC or WL with a
  count. It is deterministic, so search, summary and booking always agree.
- **Running days.** `searchTrains` skips a train if it does not leave its origin on that weekday. It
  allows for boarding on day 2 of the journey.
- **Live status.** `getLiveStatus` marks the middle stop as current and adds each stop's `avgDelayMin`.

### Validation rules

| Rule | Detail |
| --- | --- |
| Station code | 2 to 5 letters, unique |
| Train number | 5 digits, unique |
| Route | 2 or more stops, all existing stations, no repeats. The first stop has no arrival and is at 0 km. The last stop has no departure. Distance increases. Day is 1 to 4 and never goes backwards |
| Adding a train | Creates default coaches for each class |
| Deleting a train | Not allowed when bookings reference it |
| Deleting a station | Not allowed while a route uses it |
| Deleting a coach | The last coach of a class cannot be deleted |
| Bookings | Signed-in user. Valid train, class and route. Date from today. 1 to 6 passengers with name, age 1 to 120 and gender |
| Accounts | Name 3 to 60 characters, valid and unique email, 10 to 15 digit phone, age 5 to 120, password 8+ characters |

Booking and admin writes throw `MutationError`, and account writes throw `AuthError`. Server actions and
API routes turn these into a readable message or a 400/401.

## Moving to PostgreSQL

The Drizzle schema (`src/db/schema/`), the migrations and a seed script are already in the repo.
[Chapter 12](12-building-apis.md#connecting-postgresql) walks through replacing this store one module at a
time.
