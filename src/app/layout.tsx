import type { Metadata } from "next";
// Fonts are bundled from npm, so builds never download from Google Fonts.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { cookies } from "next/headers";
import Provider from "@/provider/provider";
import { DEFAULT_THEME, THEME_COOKIE, type Theme } from "@/lib/theme";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Light unless the toggle stored "dark" in the theme cookie.
  const saved = (await cookies()).get(THEME_COOKIE)?.value;
  const theme: Theme =
    saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;

  return (
    <html lang="en" className={theme === "dark" ? "dark" : undefined}>
      <body className="antialiased">
        <Provider theme={theme}>{children}</Provider>
      </body>
    </html>
  );
}
