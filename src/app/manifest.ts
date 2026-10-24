import type { MetadataRoute } from "next";

// Web app manifest, served at /manifest.webmanifest and linked automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "RailBook - Train Ticket Booking",
    short_name: "RailBook",
    description:
      "Search trains, book tickets, check PNR and live running status.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    categories: ["travel", "navigation"],
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "PNR Status", url: "/pnr", icons: [{ src: "/pwa-icon/192", sizes: "192x192" }] },
      { name: "My Trips", url: "/booking/trips", icons: [{ src: "/pwa-icon/192", sizes: "192x192" }] },
      { name: "Live Status", url: "/train/running-status", icons: [{ src: "/pwa-icon/192", sizes: "192x192" }] },
    ],
  };
}
