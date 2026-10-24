import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/userAuth";
import { addDays, format, parseISO } from "date-fns";
import {
  Ban,
  CalendarClock,
  FileText,
  LayoutGrid,
  MapPin,
  QrCode,
  Send,
  Shuffle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getStation } from "@/constants/stations";
import { getBookingByPnr, getBookingDetails } from "@/data/bookings";
import { CLASS_NAMES, formatDuration } from "@/data/trains";
import FareDetails from "./FareDetails";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const user = await requireUser(`/booking/tickets/${ticketId}`);
  const booking = getBookingByPnr(ticketId);
  // Tickets are private: other users get a 404, not someone else's ticket.
  if (!booking || booking.userId !== user.id) notFound();

  const { train, segment, fare } = getBookingDetails(booking);
  const departDate = parseISO(booking.journeyDate);
  const arriveDate = addDays(departDate, segment.dayOffset);

  const actions = [
    { label: "Cancel Ticket", icon: Ban },
    { label: "Change Boarding", icon: Shuffle },
    { label: "Resend Ticket", icon: Send },
    { label: "File TDR", icon: FileText },
    {
      label: "Running Status",
      icon: MapPin,
      href: `/train/running-status/${train.number}`,
    },
    {
      label: "View Schedule",
      icon: CalendarClock,
      href: `/train/schedule/${train.number}`,
    },
    { label: "Seat Layout", icon: LayoutGrid },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {/* Ticket left, actions / fare / QR right on large screens */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* PNR Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="text-center">
            <h1 className="font-semibold text-lg">
              PNR: <span className="font-mono">{booking.pnr}</span>
            </h1>
            <p className="text-xs text-gray-500">
              Booking ID: {booking.bookingId}
            </p>
            <div className="mt-2">
              <StatusBadge status={booking.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-lg border py-2 text-sm font-medium hover:bg-gray-50">
              Download Ticket
            </button>
            <Link
              href={`/booking/search?from=${booking.to}&to=${booking.from}`}
              className="rounded-lg border py-2 text-center text-sm font-medium hover:bg-gray-50"
            >
              Book a return ticket
            </Link>
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <p className="font-medium">
              {train.number} - {train.name.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500">
              {CLASS_NAMES[booking.classCode]} - {booking.classCode} | General
            </p>

            <div className="flex justify-between text-sm">
              <div>
                <p className="font-semibold">{segment.departTime}</p>
                <p className="text-xs">{format(departDate, "EEE, dd MMM")}</p>
                <p className="text-xs text-gray-500">
                  {booking.from} - {getStation(booking.from)?.name}
                </p>
              </div>

              <div className="text-xs text-gray-500 self-center">
                {formatDuration(segment.durationMin)}
              </div>

              <div className="text-right">
                <p className="font-semibold">{segment.arriveTime}</p>
                <p className="text-xs">{format(arriveDate, "EEE, dd MMM")}</p>
                <p className="text-xs text-gray-500">
                  {booking.to} - {getStation(booking.to)?.name}
                </p>
              </div>
            </div>

            <div className="border-t pt-3 text-sm">
              <p className="font-medium mb-2">Passenger Status</p>
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[320px] text-left">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="pb-1 pr-3 font-normal">Name</th>
                      <th className="pb-1 pr-3 font-normal">Status</th>
                      <th className="pb-1 pr-3 font-normal">Coach / Seat</th>
                      <th className="pb-1 font-normal">Berth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.passengers.map((p) => (
                      <tr key={p.name} className="whitespace-nowrap">
                        <td className="py-1 pr-3">{p.name}</td>
                        <td className="py-1 pr-3 font-medium text-brand-700">
                          {p.currentStatus}
                        </td>
                        <td className="py-1 pr-3">
                          {p.coach ? `${p.coach} / ${p.seat}` : "-"}
                        </td>
                        <td className="py-1">{p.berth ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
            <p className="text-sm font-medium">
              {train.pantry
                ? "Get food delivered to your seat"
                : "Pantry not available - carry your own food & water"}
            </p>
            {train.pantry && (
              <button className="bg-brand-gradient text-white px-4 py-1.5 rounded text-sm hover:brightness-110">
                Order Food
              </button>
            )}
          </div>
        </div>

        {/* QR & Fare Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 lg:sticky lg:top-24">
          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 text-xs text-center">
            {actions.map(({ label, icon: Icon, href }) => {
              const content = (
                <>
                  <span className="flex w-10 h-10 items-center justify-center bg-brand-50 text-brand-600 rounded-full">
                    <Icon size={18} />
                  </span>
                  <span>{label}</span>
                </>
              );
              return href ? (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-1 hover:text-brand-700"
                >
                  {content}
                </Link>
              ) : (
                <div key={label} className="flex flex-col items-center gap-1">
                  {content}
                </div>
              );
            })}
          </div>

          <FareDetails fare={fare} />

          {/* QR Code */}
          <div className="text-center space-y-2">
            <p className="font-medium">QR Code</p>
            <div className="mx-auto flex w-40 h-40 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <QrCode size={96} strokeWidth={1} />
            </div>
          </div>

          <Link
            href="/"
            className="block w-full bg-brand-gradient text-center text-white py-3 rounded-xl hover:brightness-110"
          >
            Book Another Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
