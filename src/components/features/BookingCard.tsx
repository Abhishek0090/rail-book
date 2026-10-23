import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { getBookingDetails, type Booking } from "@/data/bookings";

export default function BookingCard({ booking }: { booking: Booking }) {
  const { train, segment } = getBookingDetails(booking);

  return (
    <Link
      href={`/booking/tickets/${booking.pnr}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow"
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="flex items-center gap-1 font-semibold text-gray-900">
            {booking.from} <ArrowRight size={14} className="text-gray-400" />{" "}
            {booking.to}
          </p>
          <p className="mt-0.5 text-sm text-gray-600">
            {train.number} {train.name} - {booking.classCode}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-medium">PNR:</span>{" "}
            <span className="font-mono">{booking.pnr}</span>
          </p>
          <p className="text-xs text-gray-400">
            Booking ID: {booking.bookingId}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-700">
            {format(parseISO(booking.journeyDate), "EEE, dd MMM yyyy")}
          </p>
          <p className="text-xs text-gray-500">Departs {segment.departTime}</p>
          <div className="mt-2">
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>
    </Link>
  );
}
