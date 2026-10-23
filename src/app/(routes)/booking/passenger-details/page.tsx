import Link from "next/link";
import PassengerForm from "./PassengerForm";
import { resolveTrip, type TripParams } from "./trip";

export const metadata = { title: "Passenger details" };

export default async function PassengerDetailsPage({
  searchParams,
}: {
  searchParams: Promise<TripParams>;
}) {
  const resolved = resolveTrip(await searchParams);
  if (!resolved) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p>This train does not run between the selected stations.</p>
        <Link href="/" className="mt-4 inline-block text-brand-700 underline">
          Search again
        </Link>
      </div>
    );
  }
  return <PassengerForm trip={resolved.trip} />;
}
