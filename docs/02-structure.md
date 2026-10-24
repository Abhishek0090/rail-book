# 02 - Project structure

```text
railbook/
  next.config.ts             security headers, no-cache header for /sw.js
  package.json               scripts: dev, build, start, lint, test:booking, share
  drizzle.config.ts          Drizzle migrations config (PostgreSQL)
  scripts/
    make-share.mjs           builds train-share/ (see chapter 08)
  docs/                      these chapters
  public/
    sw.js                    service worker (chapter 10)
    firebase-messaging-sw.js self-unregistering worker (see chapter 08)
  src/
    proxy.ts                 login redirects for passenger and admin pages
    app/
      layout.tsx             fonts, metadata, viewport, theme + session cookies, Provider
      page.tsx               home page
      manifest.ts            PWA manifest (/manifest.webmanifest)
      apple-icon.tsx         iOS home-screen icon (generated PNG)
      pwa-icon/[size]/       PNG icons for the manifest (192, 512, maskable-512)
      offline/               page the service worker shows offline
      not-found.tsx          404 page
      globals.css            Tailwind, brand tokens, dark theme, gradients, scrollbars, calendar, train animation
      (routes)/              all other pages (the group name does not appear in URLs)
        (auth)/              /login, /register, their server actions
        booking/             search, passenger details, summary, tickets, trips, booking actions
        admin/               /admin/login and the protected (dashboard)/ pages
      api/                   JSON API routes (chapter 11)
    components/
      admin/AdminUi.tsx      form fields, delete button, card for admin pages
      auth/                  LoginForm, RegisterForm, AuthField
      chat/                  floating assistant, its server actions, open-chat button
      common/                search boxes, train cards, tables, timelines
      features/BookingCard   one booking in a list
      home/                  hero search and the train-on-track animation
      layout/                Navbar (hamburger menu below md), Footer, ThemeToggle
      pwa/                   ServiceWorker registration, InstallButton
      ui/                    Avatar, StatusBadge, LegendItem
    constants/
      stations.ts            STATIONS list + getStation()
      features.tsx           "why RailBook" feature list
    data/                    dummy data and every read/write (chapter 03)
    db/                      Drizzle schema, PostgreSQL pool, seed script
    drizzle/                 SQL migrations
    lib/
      userAuth.ts            passenger session cookie, getCurrentUser(), requireUser()
      adminAuth.ts           admin session cookie, requireAdmin()
      password.ts            scrypt hash and verify
      adminApi.ts            wrapper for admin-only API routes
      chatEngine.ts          the chat assistant's logic (chapter 05)
      appIcon.tsx            the app icon drawn as JSX (for generated PNGs)
      theme.ts               theme cookie name and default (light)
      bookingEngine.ts       seat locking for real bookings (+ test)
      redisLock.ts           Redis lock provider, in-process fallback
      pnr.ts                 random 10 digit PNR
    provider/provider.tsx    app chrome around every page
```

## Routes

| URL | Login | File | Notes |
| --- | --- | --- | --- |
| `/` | - | `app/page.tsx` | Hero search, services, popular routes, offers, FAQ |
| `/login`, `/register` | - | `(routes)/(auth)/` | `?next=` returns you to where you were |
| `/booking/search` | - | `(routes)/booking/search/page.tsx` | `?from=&to=&date=` |
| `/booking/passenger-details` | passenger | `.../passenger-details/page.tsx` + `PassengerForm.tsx` | `?train=&cls=&from=&to=&date=` |
| `/booking/passenger-details/summary` | passenger | `.../summary/page.tsx` + `SummaryForm.tsx` | adds `&pax=` and `&p=` passengers |
| `/booking/tickets/[pnr]` | passenger (owner) | `.../tickets/[ticketId]/page.tsx` | 404 for other users' tickets |
| `/booking/[bookingId]` | passenger (owner) | redirect to the ticket | |
| `/booking/trips` | passenger | `.../trips/page.tsx` + `TripTabs.tsx` | upcoming / past, own bookings only |
| `/pnr`, `/pnr/[pnr-number]` | - | `(routes)/pnr/` | public, like railway PNR enquiries |
| `/train/running-status[/n]` | - | `(routes)/train/running-status/` | dummy live status |
| `/train/schedule[/n]` | - | `(routes)/train/schedule/` | route table |
| `/train/[trainId]` | - | redirect to the schedule | |
| `/dashboard`, `/profile` | passenger | `(routes)/dashboard`, `(routes)/profile` | profile has Log out |
| `/offline` | - | `app/offline/` | cached by the service worker |
| `/admin/login` | - | `(routes)/admin/login/` | outside the protected layout |
| `/admin/*` | admin | `(routes)/admin/(dashboard)/` | layout calls `requireAdmin()` |

Unused older components (`components/custom/`, `components/TrainCard.tsx`, `components/Profile.tsx`) are not
imported anywhere. `components/forms/*` re-export the real forms in `components/auth/`.
