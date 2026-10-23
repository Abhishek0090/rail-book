import type { BookingStatus } from "@/data/bookings";

const STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  RAC: "bg-amber-50 text-amber-800 ring-amber-200",
  WAITLIST: "bg-rose-50 text-rose-700 ring-rose-200",
  CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
};

const LABELS: Record<BookingStatus, string> = {
  CONFIRMED: "Confirmed",
  RAC: "RAC",
  WAITLIST: "Waitlisted",
  CANCELLED: "Cancelled",
};

const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${STYLES[status]}`}
  >
    {LABELS[status]}
  </span>
);

export default StatusBadge;
