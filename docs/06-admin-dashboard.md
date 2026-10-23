# 06 - Admin dashboard

## Signing in

The admin area has its own login at `/admin/login`, separate from passengers.

| Setting | Default | Env variable |
| --- | --- | --- |
| Email | `admin@railbook.in` | `ADMIN_EMAIL` |
| Password | `admin123` | `ADMIN_PASSWORD` |
| Cookie signing secret | dev-only fallback | `ADMIN_SESSION_SECRET` |

Set all three in `.env.local` before deploying anywhere. The login page shows the demo credentials only
while `ADMIN_PASSWORD` is unset.

How the session works (`src/lib/adminAuth.ts`):

- The `loginAction` server action compares the credentials in constant time. On success it sets
  `railbook_admin` as `base64url(email).expiry.HMAC-SHA256`. The cookie is httpOnly and `SameSite=Lax`,
  `Secure` in production, and lasts 8 hours.
- `src/proxy.ts` redirects any `/admin/*` request without the cookie to `/admin/login?next=...`. `next`
  only accepts paths under `/admin`, so it can't be used as an open redirect.
- The `(dashboard)` layout calls `requireAdmin()`, which checks the signature and the expiry. Every admin
  server action and admin API route checks it again. The proxy is only a fast path.
- "Sign out" clears the cookie.

## Pages

| Page | Can do |
| --- | --- |
| Overview `/admin` | Counts for trains, stations, coaches, seats and bookings, revenue, recent bookings |
| Trains `/admin/trains` | List, delete (blocked when the train has bookings), open the schedule |
| Add train `/admin/trains/new` | Number, name, type, running days, classes, pantry, and a route editor (add or remove stops; station, times, day, km, platform). Saving creates default coaches |
| Stations `/admin/stations` | Add (code, name, city, state), delete (blocked while on a route) |
| Coaches `/admin/coaches?train=` | Add a coach to a train (suggests the next code, e.g. `B6`, and the seat count), delete, filter by train |
| Seats `/admin/seats?train=&coach=` | Seat map for any coach with berth types and booked/free |
| Bookings `/admin/bookings` | Change status (Confirmed / RAC / Waitlist / Cancelled). Cancelling marks passengers `CAN` |

A new train or station shows up straight away in search, the schedule, live status, the chat assistant and
the home page.

## Code layout

```text
src/app/(routes)/admin/
  actions.ts              all admin server actions (login, logout, add/delete, booking status)
  login/                  page.tsx + LoginForm.tsx (outside the protected layout)
  (dashboard)/
    layout.tsx            requireAdmin(), sidebar, sign out
    AdminNav.tsx          sidebar links
    AdminTable.tsx        title + ListTable card
    page.tsx              overview
    trains/ stations/ coaches/ seats/ bookings/
```

Forms use `useActionState` with the shared pieces in `src/components/admin/AdminUi.tsx`: `Field`,
`FormMessage`, `SubmitButton`, `DeleteButton` (confirm, run the bound action, toast, refresh) and
`useResetOnSuccess`.

To add a new admin entity:

1. Add the validating function to `src/data/mutations.ts`.
2. Add a server action to `actions.ts` that wraps it with `run()`.
3. Add a page under `(dashboard)/` and a link in `AdminNav.tsx`.

## Admin API routes

These need the admin cookie and return 401 without it.

| Route | Body | Does |
| --- | --- | --- |
| `GET /api/admin/stats` | - | dashboard counts |
| `POST /api/stations/add` | `{ code, name, city, state }` | `addStation` |
| `POST /api/trains/add` | `TrainInput` (see `mutations.ts`) | `addTrain` |
| `POST /api/seats/add` | `{ trainNo, code, classCode, totalSeats }` | `addCoach`, returns its seat map |

Public read routes: `/api/trains/search`, `/api/trains/availability`, `/api/routes`, `/api/coaches`,
`/api/pnr/[pnr]`.
