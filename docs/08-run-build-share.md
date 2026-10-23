# 08 - Run, build and share

## Commands

```bash
npm ci                 # install exactly what package-lock.json lists
npm run dev            # http://localhost:3000
npm run build          # production build
npm start              # serve the build
npm run lint
npm run test:booking   # seat-lock tests (node:test)
npm run share          # write train-share/ (below)
```

Needs Node.js 20.9 or newer.

## Environment variables (`.env.local`)

| Variable | Needed for | Default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL (seed route, booking API, later the whole store) | unset: the app runs on dummy data |
| `REDIS_URL` | distributed seat locks | unset: in-process locks |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | admin login | `admin@railbook.in` / `admin123` |
| `ADMIN_SESSION_SECRET` | signing the admin cookie | dev-only fallback. Set it in any shared or deployed environment |

## Two warnings you may have seen

- **Google Fonts TLS error** (`Error while requesting resource ... fonts.gstatic.com`). This is fixed:
  the fonts now come from npm (chapter 07). Nothing is fetched at build time.
- **`GET /firebase-messaging-sw.js 500`**. RailBook does not use Firebase. A browser that once ran
  another app on `localhost:3000` keeps a service worker that requests this file. `public/` now serves a
  small worker with that name that unregisters itself, so the requests stop after one reload. To clear it by
  hand: DevTools > Application > Service workers > Unregister.

## Share the project (`npm run share`)

`scripts/make-share.mjs` packs every project file into `train-share/` (ignored by git). It skips
`node_modules`, `.next`, `.git`, `.env*` (except `.env.example`) and the old `setup.mjs`.

| File | Use |
| --- | --- |
| `railbook-setup.mjs` | New machine. Run `node railbook-setup.mjs` in an empty folder |
| `railbook-setup.sh` / `.ps1` | Same, without Node (Bash or PowerShell) |
| `railbook-update.mjs` | Existing copy. `--dry-run` previews, `--keep` keeps dropped files, `--no-install` skips npm |
| `parts/railbook-part-N-of-M.mjs` | The setup split into pieces of about 90 KB for pasting |
| `HOW-TO-SETUP.md` | Step-by-step instructions for whoever receives it |

Every script checks each written file with SHA-256. The update script works on copies made by the old
`setup.mjs` (package name `train-ticket-system`). It also deletes files this version replaced, listed in
`OBSOLETE` in `make-share.mjs`. When you delete or move a file, add its old path to `OBSOLETE` before the
next share.

`setup.mjs` in the project root is the previous generator. It is out of date and can be deleted.
