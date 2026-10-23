import Link from "next/link";
import SummaryForm from "./SummaryForm";
import { resolveTrip, type TripParams } from "../trip";
import { parsePassengers } from "../../passengers";

export const metadata = { title: "Ticket summary" };

export default async function TicketSummaryPage({
  searchParams,
}: {
  searchParams: Promise<TripParams & { p?: string | string[] }>;
}) {
  const params = await searchParams;
  const resolved = resolveTrip(params);
  if (!resolved) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p>Booking details are missing.</p>
        <Link href="/" className="mt-4 inline-block text-brand-700 underline">
          Search again
        </Link>
      </div>
    );
  }

  return (
    <SummaryForm
      trip={resolved.trip}
      farePerPassenger={resolved.farePerPassenger}
      seat={resolved.seat}
      passengers={parsePassengers(params.p, resolved.pax)}
    />
  );
}
