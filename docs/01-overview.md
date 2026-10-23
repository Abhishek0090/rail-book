# 01 - Overview

RailBook is a train ticket booking app. Passengers search trains between stations, see seat availability and
fares, add passengers, pay, and get an e-ticket with a PNR. They can also check PNR status, live running status
and train schedules, or book the whole trip by chatting with the assistant. Admins sign in separately to add
stations, trains (with their routes) and coaches, and to change booking status.

All data is dummy data held in memory on the server (`src/data/`). Every read and write goes through a few
functions there, so wiring in PostgreSQL later means changing those function bodies, not the pages.
See [03 - Data and the database](03-data-and-database.md).

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, tokens in `src/app/globals.css` |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans and JetBrains Mono, bundled from `@fontsource-variable` (no Google Fonts download) |
| Dates | date-fns, react-calendar |
| Toasts / top loader | react-hot-toast, nextjs-toploader |
| Database (later) | PostgreSQL with Drizzle ORM (`src/db/`), Redis seat locks (`src/lib/redisLock.ts`) |

## How a page is served

1. `src/proxy.ts` (Next 16's replacement for `middleware.ts`) runs first. It only acts on `/admin/*`: no admin
   cookie means a redirect to `/admin/login`.
2. `src/app/layout.tsx` loads the fonts and CSS, and wraps every page in `Provider`
   (`src/provider/provider.tsx`): top loader, toasts, navbar, footer and the floating chat assistant.
3. The root layout sets `dynamic = "force-dynamic"`, so pages render on each request. They read the
   in-memory store, which admins can change at any time.
4. Most pages are server components that read `src/data/*` directly. Interactive parts (forms, tabs, the
   date picker, the chat window) are client components that get their data as props.
5. Writes go through server actions: `src/app/(routes)/booking/actions.ts` for bookings,
   `src/app/(routes)/admin/actions.ts` for admin changes and `src/components/chat/actions.ts` for the chat.
   Each action calls a function in `src/data/mutations.ts` and then `revalidatePath("/", "layout")`.

## Things that are deliberately fake

- **Payment.** "Pay" creates the booking straight away. Replace it with a gateway in
  `SummaryForm.tsx` and in the chat's confirm step.
- **Passenger login.** There is no passenger login. `src/data/user.ts` is a fixed signed-in user.
- **Admin login.** The admin login uses demo credentials (see [06](06-admin-dashboard.md)).
- **Availability and live status.** Both come from a stable hash of train, class and date, so they look
  realistic and stay the same between server and client.
- **Persistence.** The store resets when the server restarts.
