import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/userAuth";
import { getBookingById } from "@/data/bookings";

// /booking/RB2610180001 -> the ticket page for that booking's PNR.
export default async function BookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const user = await requireUser(`/booking/${bookingId}`);
  const booking = getBookingById(bookingId);
  if (!booking || booking.userId !== user.id) notFound();
  redirect(`/booking/tickets/${booking.pnr}`);
}
