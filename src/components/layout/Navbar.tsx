"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrainFront } from "lucide-react";
import Avatar from "../ui/Avatar";

const LINKS = [
  { href: "/pnr", label: "PNR Status" },
  { href: "/train/running-status", label: "Live Status" },
  { href: "/train/schedule", label: "Schedule" },
  { href: "/booking/trips", label: "My Trips" },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <TrainFront size={20} />
          </span>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Rail<span className="text-brand-gradient">Book</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto text-sm font-medium sm:gap-2">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/profile" className="ml-2 shrink-0" aria-label="Profile">
            <Avatar />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
