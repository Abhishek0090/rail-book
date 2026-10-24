# 13 - Deployment

## Before you deploy: the one blocker

RailBook currently keeps trains, users and bookings **in server memory** (chapter 03). That is fine on one
long-running server for a demo. It breaks on serverless platforms such as Vercel:

- each function instance has its own copy, so a booking made on one instance is missing on another
- instances restart often, which wipes new users and bookings

**For a demo:** deploy anywhere. The seeded data always works, and new sign-ups and bookings may come and
go.

**For real users:** connect PostgreSQL first ([chapter 12](12-building-apis.md#connecting-postgresql)), and
Redis if you run more than one instance.

## Environment variables

| Variable | Required in production | Notes |
| --- | --- | --- |
| `USER_SESSION_SECRET` | yes | Long random string. `openssl rand -base64 48` |
| `ADMIN_SESSION_SECRET` | yes | A different long random string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | yes | Replace the demo admin login. The admin login page hides the hint once `ADMIN_PASSWORD` is set |
| `DATABASE_URL` | once PostgreSQL is wired in | Use the provider's pooled URL on serverless |
| `REDIS_URL` | with more than one instance | Seat locks across instances |
| `NODE_ENV` | set by the platform | `production` makes cookies `Secure` and registers the service worker |

Never commit `.env.local`. The share scripts skip it.

## Option A: Vercel (simplest)

1. Push the repo to GitHub, GitLab or Bitbucket.
2. In Vercel: **Add New > Project**, import the repo. It detects Next.js. Leave build settings at their
   defaults (`npm run build`).
3. **Settings > Environment Variables:** add the variables above for Production (and Preview if you use
   it).
4. Deploy. Vercel gives you HTTPS, which the PWA and `Secure` cookies need.
5. Add your domain under **Settings > Domains**.

Notes:

- `src/proxy.ts` runs as Vercel's routing middleware. Nothing to configure.
- The generated PWA icons (`/pwa-icon/*`, `/apple-icon`) are route handlers and are cached by their
  `Cache-Control` header.
- For PostgreSQL use Neon, Supabase or Vercel Postgres with the pooled connection string.

## Option B: Docker (any server or container platform)

Add `output: "standalone"` to `next.config.ts`, then use this `Dockerfile`:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t railbook .
docker run -p 3000:3000 --env-file .env.production railbook
```

This works on Railway, Render, Fly.io, Google Cloud Run, AWS App Runner or ECS, and Azure Container Apps.
With the in-memory store, run **one** instance. Set min and max instances to 1 until PostgreSQL is
connected.

## Option C: a Linux VPS with Node and a reverse proxy

```bash
# on the server (Node 20.9+)
git clone <repo> railbook && cd railbook
npm ci && npm run build
npm install -g pm2
pm2 start npm --name railbook -- start      # serves on :3000
pm2 save && pm2 startup
```

Put nginx or Caddy in front for HTTPS. Caddy is the shortest:

```text
railbook.example.com {
  reverse_proxy localhost:3000
}
```

To update: `git pull && npm ci && npm run build && pm2 restart railbook`.

## Production checklist

| Check | How |
| --- | --- |
| Secrets set | All of the variables above, none left at their dev fallback |
| Demo logins replaced | Admin env vars set. Remove or change the demo passenger once real data exists |
| HTTPS | Required for the service worker, install prompt and `Secure` cookies |
| Database | PostgreSQL connected, migrations applied (`npx drizzle-kit migrate`) and backups on |
| Single instance or Redis | One instance with the in-memory store, Redis with several |
| Payments | A real gateway with webhook verification (chapter 12), not the demo "Pay" |
| Rate limiting | Login, register and booking endpoints (chapter 09) |
| Monitoring | Error tracking (Sentry or the platform's) and uptime checks on `/` and `/api/trains/search` |
| PWA | Lighthouse PWA and Best practices pass on the live URL. `/sw.js` returns `Cache-Control: no-cache` |
| Security headers | `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options` come from `next.config.ts`. Add a site-wide Content-Security-Policy once third-party scripts (payments) are known |
| Dependencies | `npm audit` clean for production dependencies. Keep Next.js on the latest patch (it was moved to 16.4.3 for a critical advisory) |

## Sharing the code instead of deploying

To give the project to someone to run locally, use `npm run share` (chapter 08). It writes setup and update
scripts to `train-share/`.
