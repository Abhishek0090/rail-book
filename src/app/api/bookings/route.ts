import { getBookingDetails, getBookings } from "@/data/bookings";
import { createBooking, MutationError } from "@/data/mutations";
import { getCurrentUser } from "@/lib/userAuth";

const unauthorized = () =>
  Response.json({ error: "Log in to see your bookings" }, { status: 401 });

// GET /api/bookings  The signed-in user's bookings, newest journey first.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const bookings = getBookings(user.id)
    .slice()
    .sort((a, b) => b.journeyDate.localeCompare(a.journeyDate))
    .map((booking) => ({ ...booking, fare: getBookingDetails(booking).fare }));
  return Response.json({ bookings });
}

// POST /api/bookings  { trainNo, classCode, from, to, date, passengers: [{ name, age, gender, berth }] }
// Books for the signed-in user (demo payment) and returns the booking.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await request.json().catch(() => ({}));
  try {
    const booking = createBooking({
      userId: user.id,
      trainNo: String(body.trainNo ?? ""),
      classCode: String(body.classCode ?? ""),
      from: String(body.from ?? ""),
      to: String(body.to ?? ""),
      date: String(body.date ?? ""),
      passengers: Array.isArray(body.passengers) ? body.passengers : [],
    });
    return Response.json(
      { booking: { ...booking, fare: getBookingDetails(booking).fare } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MutationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
