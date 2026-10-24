"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, TrainFront, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import ThemeToggle from "./ThemeToggle";
import { logoutAction } from "@/app/(routes)/(auth)/actions";
import type { Theme } from "@/lib/theme";

const LINKS = [
  { href: "/pnr", label: "PNR Status" },
  { href: "/train/running-status", label: "Live Status" },
  { href: "/train/schedule", label: "Schedule" },
  { href: "/booking/trips", label: "My Trips" },
];

export type NavUser = { name: string } | null;

// Links sit inline from md (tablet landscape and up); below that they move
// into a menu panel behind the hamburger button.
const Navbar = ({ theme, user }: { theme: Theme; user: NavUser }) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  const linkClass = (href: string) =>
    `whitespace-nowrap rounded-lg px-3 py-2 transition ${
      pathname.startsWith(href)
        ? "bg-brand-50 text-brand-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <TrainFront size={20} />
          </span>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Rail<span className="text-brand-gradient">Book</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium lg:gap-2">
          <div className="hidden items-center gap-1 md:flex lg:gap-2">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>
          <ThemeToggle initial={theme} />

          {user ? (
            <>
              <Link href="/profile" className="ml-1 shrink-0" aria-label="Profile">
                <Avatar name={user.name} />
              </Link>
              <form action={logoutAction} className="hidden md:block">
                <button
                  aria-label="Log out"
                  title="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href={loginHref} className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-gradient px-4 py-2 text-white hover:brightness-110"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="grid gap-1 border-t border-gray-200 bg-white px-4 py-3 text-sm font-medium md:hidden"
        >
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={close} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={close} className={linkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link href="/profile" onClick={close} className={linkClass("/profile")}>
                Profile
              </Link>
              <form action={logoutAction}>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-rose-700 hover:bg-rose-50">
                  <LogOut size={16} /> Log out
                </button>
              </form>
            </>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href={loginHref}
                onClick={close}
                className="rounded-lg border border-gray-200 px-3 py-2 text-center text-gray-700"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="rounded-lg bg-brand-gradient px-3 py-2 text-center text-white"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
