# 11 - API reference

All endpoints live under `src/app/api/` and return JSON. Errors always look like
`{ "error": "Readable message" }`, with a matching status code.

## Conventions

| Topic | Rule |
| --- | --- |
| Base URL | Same origin as the site, e.g. `http://localhost:3000/api/...` |
| Auth | Cookies. `railbook_session` for passengers, `railbook_admin` for admins. Log in first, then send the cookie back (browsers do this automatically; with curl use `-c`/`-b`) |
| Body | `Content-Type: application/json` |
| Dates | `yyyy-MM-dd` (e.g. `2026-10-30`). Times are `HH:mm`, 24-hour |
| Codes | Station codes are 2 to 5 capital letters (`MMCT`), trains are 5 digits (`12951`), classes are `SL`, `3A`, `2A`, `1A`, `CC`, `EC` |
| Status codes | `200` OK, `201` created, `400` invalid input, `401` not signed in, `404` not found or not yours, `503` needs PostgreSQL |

## Accounts (passengers)

| Method and path | Body | Success | Errors |
| --- | --- | --- | --- |
| `POST /api/auth/register` | `{ name, email, phone, age, gender, password }` | `201 { user }`, sets session cookie | `400` validation or email taken |
| `POST /api/auth/login` | `{ email, password }` | `200 { user }`, sets session cookie | `401` wrong email or password |
| `POST /api/auth/logout` | - | `200 { ok: true }`, clears cookie | - |
| `GET /api/auth/me` | - | `200 { user }` | `401` |

`user` is `{ id, name, email, phone, irctcId, city, memberSince, walletBalance, savedPassengers[] }`. It never
includes the password hash.

```bash
curl -c jar.txt -X POST http://localhost:3000/api/auth/login \
  -H "content-type: application/json" \
  -d '{"email":"abhishek.pal@example.com","password":"railbook123"}'
curl -b jar.txt http://localhost:3000/api/bookings
```

## Trains and stations (public)

| Method and path | Query | Returns |
| --- | --- | --- |
| `GET /api/trains/search` | `from`, `to` (required), `date` (default today) | `{ trains: TrainSearchResult[] }`. Only trains running that day, with fares and availability for 3 days per class |
| `GET /api/trains/availability` | `train`, `date` | `{ train, classes: [{ classCode, status: "AVL"\|"RAC"\|"WL", count }] }`, `404` unknown train |
| `GET /api/routes` | `train` (optional) | With `train`: `{ train, route: RouteStop[] }`. Without: `{ trains: Train[] }` |
| `GET /api/coaches` | `train` (optional) | `{ coaches: [{ trainNo, code, classCode, totalSeats }] }` |
| `GET /api/pnr/{pnr}` | - | Booking status for any PNR (no owner info), `404` unknown PNR |

`TrainSearchResult` is `{ trainNo, trainName, rating, fromTime, fromStation, duration, durationMin, toTime,
toStation, dayOffset, journeyDate, seats: [{ className, price, status, count, availability[] }] }`.

## Bookings (passenger login required)

| Method and path | Body | Success | Errors |
| --- | --- | --- | --- |
| `GET /api/bookings` | - | `{ bookings: Booking[] }`, your bookings, newest journey first, each with `fare` | `401` |
| `POST /api/bookings` | `{ trainNo, classCode, from, to, date, passengers: [{ name, age, gender, berth }] }` | `201 { booking }` with PNR and status | `400` (unknown train, class not on train, route not served, past date, 1 to 6 passengers, bad passenger), `401` |
| `GET /api/bookings/{pnr}` | - | `{ booking }` with train name and times | `401`, `404` not found or someone else's |
| `POST /api/booking/create` | see chapter 12 | PostgreSQL booking with seat locks | `401`, `503` until `DATABASE_URL` is set |

`POST /api/bookings` is the in-memory flow the website uses, with demo payment. The status follows
availability: AVL books a confirmed seat, RAC gives an RAC number, WL gives a waitlist number.

```bash
curl -b jar.txt -X POST http://localhost:3000/api/bookings \
  -H "content-type: application/json" \
  -d '{"trainNo":"12951","classCode":"3A","from":"MMCT","to":"NDLS","date":"2026-11-02",
       "passengers":[{"name":"Abhishek Pal","age":29,"gender":"Male","berth":"Lower"}]}'
```

## Admin (admin login required)

Admins sign in through `/admin/login`. There is no JSON admin login, so copy the `railbook_admin` cookie
from the browser to call these from scripts.

| Method and path | Body | Success |
| --- | --- | --- |
| `GET /api/admin/stats` | - | `{ trains, stations, coaches, seats, bookings, revenue }` |
| `POST /api/stations/add` | `{ code, name, city, state }` | `201` station |
| `POST /api/trains/add` | `{ number, name, type, runningDays[], pantry, classes[], route: [{ code, arrive, depart, day, distanceKm, platform }] }` | `201` train (default coaches created) |
| `POST /api/seats/add` | `{ trainNo, code, classCode, totalSeats }` | `201 { coach, seats[] }` |
| `GET /api/test` | - | Seeds PostgreSQL (`503` without `DATABASE_URL`) |
| `POST /api/post-user` | `{ name, email, phone, password_hash }` | Raw insert into the PostgreSQL users table |

All return `401` without the admin cookie and `400` with the validation message for bad input. The rules
are in [chapter 03](03-data-and-database.md#validation-rules).

## Server actions (used by the website, not for external clients)

The web pages call server actions instead of these endpoints. They run the same functions:

| Action | File | Same logic as |
| --- | --- | --- |
| `loginAction`, `registerAction`, `logoutAction` | `src/app/(routes)/(auth)/actions.ts` | `/api/auth/*` |
| `createBookingAction` | `src/app/(routes)/booking/actions.ts` | `POST /api/bookings` |
| `chatReply`, `chatGreeting` | `src/components/chat/actions.ts` | - |
| admin add/delete/status actions | `src/app/(routes)/admin/actions.ts` | admin endpoints |

Server actions have unguessable IDs and CSRF protection built in, so they are not a public API. Build mobile
apps and integrations on the `/api` endpoints.
