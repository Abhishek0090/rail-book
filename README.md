# RailBook - Train Ticket Booking

A Next.js train booking app with a blue and purple theme. Search trains, book tickets, check PNR status,
live running status and schedules, or book in a chat with the assistant. Admins manage stations, trains,
coaches and bookings from a separate dashboard.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. Data is in-memory dummy data
(`src/data/`) until PostgreSQL (Drizzle schema in `src/db/`) is wired in.

**How the code works:** [`docs/README.md`](docs/README.md).

## Run

```bash
npm ci
npm run dev        # http://localhost:3000
```

Requirements: Node.js 20.9 or newer. PostgreSQL and Redis are optional for now.

| Where | What |
| --- | --- |
| http://localhost:3000 | Passenger app (dummy user Abhishek Pal) |
| http://localhost:3000/admin/login | Admin dashboard: `admin@railbook.in` / `admin123` |
| "Book via chat" button | Booking assistant, e.g. "Mumbai to Delhi tomorrow" |

Sample PNRs: `2828538983`, `4512093376`, `6620418851`. Sample trains: `12951`, `22177`, `12301`.

## Configuration

Copy `.env.example` to `.env.local`. Every variable is optional for local use:

- `DATABASE_URL` for PostgreSQL
- `REDIS_URL` for seat locks
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` for the admin login. Set these before sharing
  a deployment.

Never share `.env.local`.

## Useful commands

```bash
npm run build
npm run lint
npm run test:booking
npm run share      # setup/update scripts for another machine (see below)
```

## Share this project

`npm run share` writes `train-share/` with setup scripts (Node, Bash and PowerShell) that recreate this
project on another machine, an update script for existing copies, and paste-sized parts. See
`HOW-TO-SETUP.md` inside it.
