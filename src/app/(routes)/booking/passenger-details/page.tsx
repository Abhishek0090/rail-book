import Link from "next/link";
import PassengerForm from "./PassengerForm";
import { resolveTrip, type TripParams } from "./trip";
import { requireUser } from "@/lib/userAuth";

export const metadata = { title: "Passenger details" };

export default async function PassengerDetailsPage({
  searchParams,
}: {
  searchParams: Promise<TripParams>;
}) {
  const params = await searchParams;
  const user = await requireUser(
    `/booking/passenger-details?${new URLSearchParams(params as Record<string, string>)}`,
  );
  const resolved = resolveTrip(params);
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
  return <PassengerForm trip={resolved.trip} user={user} />;
}
