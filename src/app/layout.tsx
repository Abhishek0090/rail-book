import type { Metadata } from "next";
// Fonts are bundled from npm, so builds never download from Google Fonts.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Provider from "@/provider/provider";

// Pages read the in-memory store that admins edit, so render on each request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "RailBook - Train Ticket Booking",
    template: "%s | RailBook",
  },
  description:
    "Search trains, check PNR status and live running status, and book train tickets with RailBook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
