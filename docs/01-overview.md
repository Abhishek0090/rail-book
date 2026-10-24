# 01 - Overview

RailBook is a train ticket booking app.

- **Anyone** can search trains, check PNR status, live running status and schedules.
- **Passengers with an account** can add passengers, pay, get an e-ticket with a PNR, and see their trips.
  They can also book the whole trip by chatting with the assistant.
- **Admins** sign in separately to add stations, trains (with their routes) and coaches, and to change
  booking status.

The app works in light and dark mode, on phones, tablets and desktops, and can be installed as a PWA.

All data is dummy data held in memory on the server (`src/data/`). Every read and write goes through a few
functions there. Wiring in PostgreSQL later means changing those function bodies, not the pages. See
[12 - Building APIs and connecting the database](12-building-apis.md).

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router), React 19.2, TypeScript |
| Styling | Tailwind CSS 4, tokens in `src/app/globals.css` |
| Icons | lucide-react |
| Fonts | Plus Jakarta Sans and JetBrains Mono, bundled from `@fontsource-variable` (no Google Fonts download) |
| Dates | date-fns, react-calendar |
| Toasts / top loader | react-hot-toast, nextjs-toploader |
| Auth | Signed httpOnly cookies, scrypt password hashes (Node built-ins, no auth library) |
| PWA | `app/manifest.ts`, generated icons, a hand-written service worker in `public/sw.js` |
| Database (later) | PostgreSQL with Drizzle ORM (`src/db/`), Redis seat locks (`src/lib/redisLock.ts`) |

## How a page is served

1. `src/proxy.ts` (Next 16's replacement for `middleware.ts`) runs first.
   - `/admin/*` without the admin cookie redirects to `/admin/login`.
   - Booking, trips, tickets, dashboard and profile without the passenger cookie redirect to
     `/login?next=...`.
2. `src/app/layout.tsx` loads the fonts and CSS, and reads two cookies: the theme and the passenger session.
   It wraps every page in `Provider` (`src/provider/provider.tsx`): top loader, toasts, navbar, footer, the
   floating chat assistant and the service worker registration.
3. The root layout sets `dynamic = "force-dynamic"`, so pages render on each request. They read the
   in-memory store, which admins can change at any time.
4. Most pages are server components that read `src/data/*` directly. Pages that need a login call
   `requireUser()`, and admin pages call `requireAdmin()`. Interactive parts (forms, tabs, the date picker,
   the chat window) are client components that get their data as props.
5. Writes go through server actions, which call functions in `src/data/mutations.ts` or `src/data/users.ts`
   and then refresh the pages:

   | Action file | Handles |
   | --- | --- |
   | `src/app/(routes)/(auth)/actions.ts` | login, register, logout |
   | `src/app/(routes)/booking/actions.ts` | bookings |
   | `src/app/(routes)/admin/actions.ts` | admin changes |
   | `src/components/chat/actions.ts` | the chat |

## Things that are deliberately fake

- **Payment.** "Pay" creates the booking straight away. Replace it with a gateway (chapter 12).
- **Accounts.** Accounts and sessions are real, but users live in memory: new sign-ups disappear when the
  server restarts. The demo login is `abhishek.pal@example.com` / `railbook123`.
- **Admin login.** The admin login uses demo credentials from environment variables (see
  [06](06-admin-dashboard.md)).
- **Availability and live status.** Both come from a stable hash of train, class and date, so they look
  realistic and stay the same between server and client.
- **Persistence.** Everything resets when the server restarts, and each server instance has its own copy.
  Connect PostgreSQL before deploying to more than one instance (chapter 13).
