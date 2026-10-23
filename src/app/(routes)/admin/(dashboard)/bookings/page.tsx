import Link from "next/link";
import { format, parseISO } from "date-fns";
import AdminTable from "../AdminTable";
import BookingStatusSelect from "./BookingStatusSelect";
import StatusBadge from "@/components/ui/StatusBadge";
import { getBookingDetails, getBookings } from "@/data/bookings";

export default function AdminBookingsPage() {
  const rows = [...getBookings()]
    .sort((a, b) => b.bookedOn.localeCompare(a.bookedOn))
    .map((b) => ({
      id: b.bookingId,
      pnr: (
        <Link
          href={`/booking/tickets/${b.pnr}`}
          className="font-mono text-brand-700 hover:underline"
        >
          {b.pnr}
        </Link>
      ),
      train: b.trainNo,
      route: `${b.from} - ${b.to}`,
      journey: format(parseISO(b.journeyDate), "dd MMM yyyy"),
      passengers: b.passengers.length,
      fare: `Rs ${getBookingDetails(b).fare.total}`,
      status: <StatusBadge status={b.status} />,
      change: <BookingStatusSelect bookingId={b.bookingId} status={b.status} />,
    }));

  return (
    <AdminTable
      title="Bookings"
      description="Change a status to confirm, move to RAC or cancel a booking."
      rowKey="id"
      rows={rows}
      columns={[
        { key: "pnr", label: "PNR" },
        { key: "train", label: "Train" },
        { key: "route", label: "Route" },
        { key: "journey", label: "Journey" },
        { key: "passengers", label: "Pax" },
        { key: "fare", label: "Fare" },
        { key: "status", label: "Status" },
        { key: "change", label: "Update" },
      ]}
    />
  );
}
