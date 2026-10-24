import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  MapPin,
  Search,
  Ticket,
  TrainFront,
  type LucideIcon,
} from "lucide-react";
import BookingCard from "@/components/features/BookingCard";
import { getBookingDetails, getBookings, isUpcoming } from "@/data/bookings";
import { requireUser } from "@/lib/userAuth";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const QUICK_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Book Ticket", icon: Search },
  { href: "/pnr", label: "PNR Status", icon: Ticket },
  { href: "/train/running-status", label: "Live Status", icon: MapPin },
  { href: "/train/schedule", label: "Schedule", icon: CalendarClock },
];

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const bookings = getBookings(user.id);
  const upcoming = bookings
    .filter((b) => isUpcoming(b))
    .sort((a, b) => a.journeyDate.localeCompare(b.journeyDate));
  const next = upcoming[0];
  const spent = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + getBookingDetails(b).fare.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total bookings" value={bookings.length} />
          <StatCard label="Upcoming trips" value={upcoming.length} />
          <StatCard label="Total spent" value={`Rs ${spent}`} />
          <StatCard
            label="Wallet balance"
            value={`Rs ${user.walletBalance}`}
          />
        </div>

        {/* Next trip */}
        {next && (
          <NextTrip pnr={next.pnr} {...getNextTripInfo(next.pnr)} />
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm font-medium shadow-sm hover:border-brand-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              {label}
            </Link>
          ))}
        </div>

        {/* Upcoming list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Upcoming trips</h2>
            <Link
              href="/booking/trips"
              className="text-sm text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {upcoming.map((b) => (
            <BookingCard key={b.bookingId} booking={b} />
          ))}
        </section>
      </div>
    </div>
  );
}

function getNextTripInfo(pnr: string) {
  const booking = getBookings().find((b) => b.pnr === pnr)!;
  const { train, segment } = getBookingDetails(booking);
  return {
    title: `${train.number} ${train.name}`,
    route: `${booking.from} -> ${booking.to}`,
    when: `${format(parseISO(booking.journeyDate), "EEE, dd MMM")} at ${segment.departTime}`,
    status: booking.passengers[0].currentStatus,
  };
}

function NextTrip({
  pnr,
  title,
  route,
  when,
  status,
}: {
  pnr: string;
  title: string;
  route: string;
  when: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-brand-gradient-dark p-6 text-white sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-amber-300">
        <TrainFront size={24} />
      </span>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-white/60">
          Next trip
        </p>
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-white/80">
          {route} - {when} - {status}
        </p>
      </div>
      <Link
        href={`/booking/tickets/${pnr}`}
        className="rounded-lg bg-amber-400 px-5 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-amber-300"
      >
        View Ticket
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
