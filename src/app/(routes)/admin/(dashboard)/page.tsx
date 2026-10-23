import Link from "next/link";
import { format, parseISO } from "date-fns";
import StatusBadge from "@/components/ui/StatusBadge";
import { getAdminStats } from "@/data/admin";
import { getBookingDetails, getBookings } from "@/data/bookings";

export default function AdminPage() {
  const stats = getAdminStats();
  const cards = [
    { label: "Trains", value: stats.trains, href: "/admin/trains" },
    { label: "Stations", value: stats.stations, href: "/admin/stations" },
    { label: "Coaches", value: stats.coaches, href: "/admin/coaches" },
    { label: "Seats", value: stats.seats, href: "/admin/seats" },
    { label: "Bookings", value: stats.bookings, href: "/admin/bookings" },
    { label: "Revenue", value: `Rs ${stats.revenue}` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const body = (
            <>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            </>
          );
          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300"
            >
              {body}
            </Link>
          ) : (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {body}
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Recent bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">PNR</th>
                <th className="pb-2">Train</th>
                <th className="pb-2">Route</th>
                <th className="pb-2">Journey</th>
                <th className="pb-2">Fare</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...getBookings()]
                .sort((a, b) => b.bookedOn.localeCompare(a.bookedOn))
                .map((b) => (
                  <tr key={b.bookingId} className="border-b last:border-none">
                    <td className="py-3 font-mono">
                      <Link
                        href={`/booking/tickets/${b.pnr}`}
                        className="text-brand-700 hover:underline"
                      >
                        {b.pnr}
                      </Link>
                    </td>
                    <td className="py-3">{b.trainNo}</td>
                    <td className="py-3">
                      {b.from} - {b.to}
                    </td>
                    <td className="py-3">
                      {format(parseISO(b.journeyDate), "dd MMM yyyy")}
                    </td>
                    <td className="py-3">
                      Rs {getBookingDetails(b).fare.total}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
