import { getBookingByPnr, getBookingDetails } from "@/data/bookings";
import { getCurrentUser } from "@/lib/userAuth";

// GET /api/bookings/2828538983  One of the signed-in user's bookings.
// Other users' PNRs return 404, the same as a PNR that does not exist.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pnr: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in first" }, { status: 401 });

  const booking = getBookingByPnr((await params).pnr);
  if (!booking || booking.userId !== user.id) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
  const { train, segment, fare } = getBookingDetails(booking);
  return Response.json({
    booking: {
      ...booking,
      trainName: train.name,
      departTime: segment.departTime,
      arriveTime: segment.arriveTime,
      fare,
    },
  });
}
