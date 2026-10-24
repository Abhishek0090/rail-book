# 10 - PWA: how RailBook became an installable app

RailBook is a Progressive Web App:

- It can be installed to the home screen or desktop, and opens in its own window without browser bars.
- It has app icons, a splash color and shortcuts.
- It shows a friendly offline page instead of the browser's error.

No PWA library is used. Next.js has built-in manifest and icon support, and the service worker is about 60
lines in `public/sw.js`.

## What was added

| Step | File | Why |
| --- | --- | --- |
| 1. Manifest | `src/app/manifest.ts` | Name, colors, `display: standalone`, start URL, icons and shortcuts. Next serves it at `/manifest.webmanifest` and adds the `<link rel="manifest">` tag |
| 2. Icons | `src/lib/appIcon.tsx`, `src/app/pwa-icon/[size]/route.tsx` | The icon is drawn once as JSX, and `next/og`'s `ImageResponse` renders it to PNG at 192, 512 and maskable 512. There are no image files to keep in sync |
| 3. Apple icon | `src/app/apple-icon.tsx` | iOS uses `apple-touch-icon` instead of the manifest icons. Next generates and links it |
| 4. Theme color and iOS meta | `viewport` and `metadata.appleWebApp` in `src/app/layout.tsx` | Colors the address bar or title bar, and lets iOS open it full screen |
| 5. Service worker | `public/sw.js` | Offline page and caching (below) |
| 6. Registration | `src/components/pwa/ServiceWorker.tsx` (in `Provider`) | Registers `/sw.js`, in production builds only |
| 7. Offline page | `src/app/offline/` | What you see without a connection |
| 8. Install button | `src/components/pwa/InstallButton.tsx` (in the footer) | Catches `beforeinstallprompt` and shows "Install app" when the browser allows it |
| 9. Headers | `next.config.ts` | `/sw.js` is served `no-cache`, so a new version is picked up straight away. It also gets a strict CSP |

## Caching strategy

| Request | Strategy | Why |
| --- | --- | --- |
| Page navigations | Network first. If the network fails, show the cached `/offline` | Fares, availability and bookings must never be stale |
| `/_next/static/*`, `/pwa-icon/*` | Cache first, filled on first use | These files have content hashes in their names, so a cached copy is always correct |
| Everything else (API, server actions, page data) | Not touched | Bookings and logins always go to the server |

The offline page is cached at install with `credentials: "omit"`, so the cached copy never contains a
signed-in user's name.

## Updating the service worker

1. Edit `public/sw.js` and bump `VERSION` (for example `v1` to `v2`).
2. Deploy. Browsers check `/sw.js` on navigation. Because it is served `no-cache`, they see the change, and
   the new worker installs with `skipWaiting()` and takes over with `clients.claim()`.
3. The `activate` step deletes old `railbook-*` caches.

To remove the worker completely, ship a `sw.js` that unregisters itself.
`public/firebase-messaging-sw.js` is an example of that pattern.

## Testing it

Service workers need HTTPS or `localhost`, and only run in production builds here:

```bash
npm run build
npm start          # http://localhost:3000
```

1. **Chrome or Edge DevTools > Application.** Manifest should show the name, icons and no errors. Service
   workers should show `sw.js` "activated and running".
2. **Install.** The "Install app" button appears in the footer, and there is an install icon in the address
   bar. After installing, RailBook opens in its own window.
3. **Offline.** DevTools > Network > Offline, then reload. You should see the "You are offline" page.
4. **Lighthouse.** Run the PWA / Best practices checks.
5. **Phones.**
   - Android Chrome shows an install banner or menu item.
   - iOS Safari has no install prompt. Use Share > Add to Home Screen; it uses the Apple icon.

## Ideas for later

- **Offline tickets.** Cache `/booking/tickets/*` per user with a network-first strategy so tickets open
  without signal. Clear the cache on logout, because tickets are personal.
- **Push notifications.** Add a `push` handler to `sw.js` and a subscription API for PNR status changes,
  chart preparation and delays.
- **Background sync.** Queue a PNR check made offline and run it when the connection returns.
