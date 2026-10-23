"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Armchair,
  LayoutDashboard,
  MapPin,
  Ticket,
  TrainFront,
  Warehouse,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/trains", label: "Trains", icon: TrainFront },
  { href: "/admin/stations", label: "Stations", icon: MapPin },
  { href: "/admin/coaches", label: "Coaches", icon: Warehouse },
  { href: "/admin/seats", label: "Seats", icon: Armchair },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
