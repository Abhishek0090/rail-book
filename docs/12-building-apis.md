# 12 - Building APIs and connecting the database

This chapter covers four things:

- how an API route is put together, and adding your own
- moving from the in-memory dummy data to PostgreSQL
- adding a real payment gateway
- calling the API from a mobile app or another frontend

## Anatomy of an API route

Every route follows the same four steps. This is `src/app/api/bookings/route.ts`:

```ts
import { getBookingDetails } from "@/data/bookings";
import { createBooking, MutationError } from "@/data/mutations";
import { getCurrentUser } from "@/lib/userAuth";

export async function POST(request: Request) {
  // 1. Who is calling? Never trust ids from the body.
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in first" }, { status: 401 });

  // 2. Parse. A broken body becomes {} instead of a 500.
  const body = await request.json().catch(() => ({}));

  try {
    // 3. Do the work through the data layer. Validation lives there,
    //    so the website, the chat and the API all follow the same rules.
    const booking = createBooking({
      userId: user.id,
      trainNo: String(body.trainNo ?? ""),
      classCode: String(body.classCode ?? ""),
      from: String(body.from ?? ""),
      to: String(body.to ?? ""),
      date: String(body.date ?? ""),
      passengers: Array.isArray(body.passengers) ? body.passengers : [],
    });
    // 4. Respond with JSON and a precise status code.
    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof MutationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error; // unexpected: let Next log it and return 500
  }
}
```

Rules that keep the API consistent:

| Rule | Why |
| --- | --- |
| Put logic in `src/data/*`, not in the route | Pages, server actions, the chat and the API share one implementation |
| Take the user from `getCurrentUser()` / `getAdminSession()` | A client-sent `userId` can be forged |
| Return 404 for "not yours" | Do not reveal that someone else's PNR exists |
| Errors are `{ error }` with 400/401/404/503 | Clients can show the message as-is |
| Admin-only routes use `adminRoute()` from `src/lib/adminApi.ts` | Auth and error mapping in one line |

## Adding an endpoint: example "cancel my booking"

1. **Data layer.** Add `cancelBooking(userId, pnr)` to `src/data/mutations.ts`. It should:
   - find the booking, and throw a `MutationError` if it is missing or not owned by `userId`
   - refuse if the journey is in the past
   - set `status = "CANCELLED"` and each passenger's `currentStatus = "CAN"`
2. **Route.** Create `src/app/api/bookings/[pnr]/cancel/route.ts`:

   ```ts
   import { cancelBooking, MutationError } from "@/data/mutations";
   import { getCurrentUser } from "@/lib/userAuth";

   export async function POST(_req: Request, { params }: { params: Promise<{ pnr: string }> }) {
     const user = await getCurrentUser();
     if (!user) return Response.json({ error: "Log in first" }, { status: 401 });
     try {
       const booking = cancelBooking(user.id, (await params).pnr);
       return Response.json({ booking });
     } catch (error) {
       if (error instanceof MutationError) return Response.json({ error: error.message }, { status: 400 });
       throw error;
     }
   }
   ```

3. **Website.** Add a server action next to `createBookingAction` that calls the same `cancelBooking`.
   Wire it to the "Cancel Ticket" button on the ticket page and `revalidatePath("/", "layout")`.
4. **Login.** If the new page needs a login, add its path to the `matcher` in `src/proxy.ts`.
5. **Docs.** Add the row to [chapter 11](11-api-reference.md).

For richer input, add [zod](https://zod.dev) and parse the body with a schema before calling the data
layer. The data layer should still validate, because server actions call it too.

## Connecting PostgreSQL

The schema is in `src/db/schema/` (users, stations, trains, routes, coaches, seats, bookings,
transactions), with migrations in `src/drizzle/` and a pooled client in `src/db/index.ts`.

### 1. Database and environment

```bash
# local PostgreSQL with Docker
docker run -d --name railbook-db -e POSTGRES_PASSWORD=change-me -p 5432:5432 postgres:17
```

In `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:change-me@localhost:5432/postgres
```

Hosted options (Neon, Supabase, Vercel Postgres, RDS) all give you a `DATABASE_URL`. Add `?sslmode=require`
if the provider asks for it.

### 2. Migrate and seed

```bash
npx drizzle-kit migrate      # applies src/drizzle/*.sql (drizzle.config.ts reads DATABASE_URL)
npx drizzle-kit generate     # after you change src/db/schema, creates a new migration
```

Then sign in as admin and open `GET /api/test` to seed train 11055 with its stations, route, coaches and
seats (`src/db/seed.ts`). Extend the seed with the other dummy trains, or write a one-off script that
inserts `TRAINS` and `STATIONS` from `src/data/`.

### 3. Schema gaps to close first

The dummy data has a few fields the tables do not have yet. Add them with a migration before switching:

| Dummy field | Add to |
| --- | --- |
| `Train.type`, `rating`, `runningDays`, `pantry`, `classes` | `trains` (classes as `text[]`, running days as `text[]`) |
| `RouteStop.day`, `avgDelayMin`, `platform` | `routes` |
| `User.irctcId`, `city`, `walletBalance` | `users` |
| saved passengers | a new `saved_passengers` table (user_id, name, age, gender, berth) |
| booking passengers (several per booking) | a new `booking_passengers` table, because `bookings` holds one seat today |
| `Booking.classCode`, `quota`, `chartPrepared` | `bookings` |

### 4. Swap the data layer, one module at a time

Keep every exported function's name and return shape, and change only its body. For example:

```ts
// src/data/trains.ts
import { db } from "@/db";
import { trains } from "@/db/schema/train";
import { eq } from "drizzle-orm";

export const getTrain = async (number: string) =>
  (await db.select().from(trains).where(eq(trains.number, number)).limit(1))[0];
```

```ts
// src/data/users.ts (sketch: map the row's columns onto PublicUser in toPublic)
export async function authenticate(email: string, password: string) {
  const [row] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!row || !verifyPassword(password, row.password_hash)) throw new AuthError("Wrong email or password");
  return toPublic(row);
}
```

Suggested order (each step is shippable):

1. **Stations and trains.** Read-only, so the lowest risk.
2. **Users.** This makes accounts permanent. Passwords keep the `scrypt$salt$hash` format.
3. **Bookings.** Route `createBooking` through the seat-locked flow already written in
   `POST /api/booking/create`. It uses `withSeatLock` (Redis when `REDIS_URL` is set) and writes the booking
   and its transaction in one database transaction, so two people can never get the same seat.
4. **Admin.** Coaches, seats and stats.

Functions that become `async` need `await` at their call sites. They are all in server components, server
actions and route handlers, so the change is mechanical, and `npx tsc --noEmit` lists every place. When
nothing imports `src/data/persist.ts` any more, delete it.

## Real payments

Today "Pay" books immediately. With a gateway (Razorpay, Stripe, PayU, Cashfree), payment works in five
steps:

1. **Create an order.** `SummaryForm` calls a server action that computes the fare on the server (never trust
   the client's total), creates a gateway order and returns its id.
2. **Customer pays.** The page opens the gateway's checkout with that order id.
3. **Verify the result.** The gateway calls a webhook route, e.g. `POST /api/payments/webhook`. Check the
   signature with the gateway secret, then call the booking flow with the verified
   `paymentTransactionId`. `POST /api/booking/create` already refuses bookings without one and is
   idempotent per transaction id.
4. **Show the ticket.** The page polls `GET /api/bookings/{pnr}` (or the order status) and shows the ticket.
5. **Refunds.** Cancelling a ticket calls the gateway's refund API and records a `transactions` row.

Put gateway keys in environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, ...). Only the
public key may reach the browser (`NEXT_PUBLIC_` prefix).

## Calling the API from a mobile app or another frontend

- **Same domain (this site, a PWA, a WebView).** Cookies just work.
- **Native app.** Log in with `POST /api/auth/login` and keep the `Set-Cookie` value. React Native's `fetch`
  stores cookies automatically on iOS and Android. Send `credentials: "include"` from web code.
- **Another web origin.** Add CORS headers for that origin in `next.config.ts` `headers()`, and set the
  session cookie with `SameSite=None; Secure`. A simpler option is to proxy the API through that site's own
  backend.
- **Token-based clients.** If you need bearer tokens instead of cookies, issue a signed token in the login
  route using the same HMAC helper as `userAuth.ts`. Accept `Authorization: Bearer ...` in a small
  `getApiUser(request)` helper, and use it in place of `getCurrentUser()` in API routes.
- **Types.** Share the response types by importing them from `src/data/*` (`TrainSearchResult`, `Booking`,
  `PublicUser`) in a shared package, or generate an OpenAPI file from chapter 11.
