# 02 - Project structure

```text
railbook/
  next.config.ts             remote image hosts
  package.json               scripts: dev, build, start, lint, test:booking, share
  drizzle.config.ts          Drizzle migrations config (PostgreSQL)
  scripts/
    make-share.mjs           builds train-share/ (see chapter 08)
  docs/                      these chapters
  public/
    firebase-messaging-sw.js self-unregistering worker (see chapter 08)
  src/
    proxy.ts                 redirects signed-out admins to /admin/login
    app/
      layout.tsx             fonts, metadata, Provider, force-dynamic
      page.tsx               home page
      not-found.tsx          404 page
      globals.css            Tailwind, brand tokens, gradients, train animation
      (routes)/              all pages (the group name does not appear in URLs)
      api/                   JSON API routes
    components/
      admin/AdminUi.tsx      form fields, delete button, card for admin pages
      chat/                  floating assistant, its server actions, open-chat button
      common/                search boxes, train cards, tables, timelines
      features/BookingCard   one booking in a list
      home/                  hero search and the train-on-track animation
      layout/                Navbar, Footer
      ui/                    Avatar, StatusBadge, LegendItem
    constants/
      stations.ts            STATIONS list + getStation()
      features.tsx           "why RailBook" feature list
    data/                    dummy data and every read/write (chapter 03)
    db/                      Drizzle schema, PostgreSQL pool, seed script
    drizzle/                 SQL migrations
    lib/
      adminAuth.ts           signed admin session cookie
      adminApi.ts            wrapper for admin-only API routes
      chatEngine.ts          the chat assistant's logic (chapter 05)
      bookingEngine.ts       seat locking for real bookings (+ test)
      redisLock.ts           Redis lock provider, in-process fallback
      pnr.ts                 random 10 digit PNR
    provider/provider.tsx    app chrome around every page
```

## Routes

| URL | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Hero search, services, popular routes, offers, FAQ |
| `/booking/search` | `(routes)/booking/search/page.tsx` | `?from=&to=&date=` |
| `/booking/passenger-details` | `.../passenger-details/page.tsx` + `PassengerForm.tsx` | `?train=&cls=&from=&to=&date=` |
| `/booking/passenger-details/summary` | `.../summary/page.tsx` + `SummaryForm.tsx` | adds `&pax=` and `&p=` passengers |
| `/booking/tickets/[ticketId]` | `.../tickets/[ticketId]/page.tsx` | `ticketId` is the PNR |
| `/booking/[bookingId]` | redirect to the ticket | |
| `/booking/trips` | `.../trips/page.tsx` + `TripTabs.tsx` | upcoming / past |
| `/pnr`, `/pnr/[pnr-number]` | `(routes)/pnr/` | |
| `/train/running-status[/n]` | `(routes)/train/running-status/` | dummy live status |
| `/train/schedule[/n]` | `(routes)/train/schedule/` | route table |
| `/train/[trainId]` | redirect to the schedule | |
| `/dashboard`, `/profile` | `(routes)/dashboard`, `(routes)/profile` | for the dummy user |
| `/admin/login` | `(routes)/admin/login/` | outside the protected layout |
| `/admin/*` | `(routes)/admin/(dashboard)/` | layout calls `requireAdmin()` |

Unused older components (`components/custom/`, `components/forms/`, `components/auth/`,
`components/TrainCard.tsx`, `components/Profile.tsx`) are not imported anywhere. Delete them or reuse them
when passenger login is built.
