import { notFound, redirect } from "next/navigation";
import { getBookingById } from "@/data/bookings";

// /booking/RB2610180001 -> the ticket page for that booking's PNR.
export default async function BookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = getBookingById(bookingId);
  if (!booking) notFound();
  redirect(`/booking/tickets/${booking.pnr}`);
}
