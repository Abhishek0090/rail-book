// RailBook service worker (registered by src/components/pwa/ServiceWorker.tsx).
// - Pages: network first; when offline, show the cached /offline page.
// - Build assets (/_next/static, icons): cache first, they are versioned.
// - Everything else (API routes, server actions, page data) is never cached,
//   so bookings and logins are always live.
// Bump VERSION when this file changes so old caches are cleared.
const VERSION = "v1";
const CACHE = `railbook-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/pwa-icon/192", "/pwa-icon/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // credentials: "omit" so the cached offline page never shows a user's name.
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { credentials: "omit" }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("railbook-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pwa-icon/");

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) ?? Response.error()),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
  // Anything else falls through to the network untouched.
});
