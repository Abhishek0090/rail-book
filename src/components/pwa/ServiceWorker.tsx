"use client";

import { useEffect } from "react";

// Registers public/sw.js. Production only: in `next dev` a caching worker
// would serve stale bundles and fight hot reload.
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  }, []);
  return null;
}
