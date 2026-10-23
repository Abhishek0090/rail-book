import { getBookingByPnr, getBookingDetails } from "@/data/bookings";

// GET /api/pnr/2828538983
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pnr: string }> },
) {
  const { pnr } = await params;
  const booking = getBookingByPnr(pnr);
  if (!booking) {
    return Response.json({ error: "PNR not found" }, { status: 404 });
  }

  const { train, segment, fare } = getBookingDetails(booking);
  return Response.json({
    ...booking,
    trainName: train.name,
    departTime: segment.departTime,
    arriveTime: segment.arriveTime,
    fare,
  });
}
