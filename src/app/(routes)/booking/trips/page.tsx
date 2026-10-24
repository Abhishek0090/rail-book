import BookingCard from "@/components/features/BookingCard";
import { getBookings, isUpcoming } from "@/data/bookings";
import { requireUser } from "@/lib/userAuth";
import TripTabs from "./TripTabs";

export const metadata = { title: "My Trips" };

export default async function MyBookingsPage() {
  const user = await requireUser("/booking/trips");
  const bookings = [...getBookings(user.id)].sort((a, b) =>
    a.journeyDate.localeCompare(b.journeyDate),
  );
  const card = (b: (typeof bookings)[number]) => (
    <BookingCard key={b.bookingId} booking={b} />
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="bg-white py-4 text-center text-xl font-semibold">
        My Bookings
      </h1>
      <TripTabs
        upcoming={bookings.filter((b) => isUpcoming(b)).map(card)}
        past={bookings
          .filter((b) => !isUpcoming(b))
          .reverse()
          .map(card)}
      />
    </div>
  );
}
