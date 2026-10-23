import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import {
  RefreshCcw,
  SearchX,
  Smartphone,
  Star,
  Train,
  Utensils,
} from "lucide-react";
import TrainConfirmationLegend from "@/components/common/TrainConfirmationLegend";
import StatusBadge from "@/components/ui/StatusBadge";
import { getStation } from "@/constants/stations";
import {
  getBookingByPnr,
  getBookingDetails,
  getBookings,
} from "@/data/bookings";

export default async function PnrStatusPage({
  params,
}: {
  params: Promise<{ "pnr-number": string }>;
}) {
  const { "pnr-number": pnr } = await params;
  const booking = getBookingByPnr(pnr);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <SearchX className="mx-auto text-brand-300" size={48} />
          <h1 className="mt-4 text-lg font-semibold">
            PNR <span className="font-mono">{pnr}</span> not found
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sample PNRs:{" "}
            {getBookings()
              .map((b) => b.pnr)
              .join(", ")}
          </p>
          <Link
            href="/pnr"
            className="mt-6 inline-block rounded-lg bg-brand-gradient px-6 py-2 text-white hover:brightness-110"
          >
            Try another PNR
          </Link>
        </div>
      </div>
    );
  }

  const { train, segment } = getBookingDetails(booking);
  const journeyDate = parseISO(booking.journeyDate);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* PNR HEADER */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              PNR : <span className="font-mono font-bold">{booking.pnr}</span>
            </h2>
            <Link
              href="/pnr"
              className="text-brand-600 font-medium hover:underline"
            >
              CHANGE
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-medium">
              {train.number} - {train.name.toUpperCase()}
              <span className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-sm text-amber-700">
                <Star size={14} className="fill-amber-400 text-amber-400" />{" "}
                {train.rating}
              </span>
              <StatusBadge status={booking.status} />
            </div>

            <p className="text-gray-600">
              {getStation(booking.from)?.name} - {booking.from},{" "}
              {segment.departTime} {"->"} {getStation(booking.to)?.name} -{" "}
              {booking.to}, {segment.arriveTime} (
              {format(addDays(journeyDate, segment.dayOffset), "dd MMM")})
            </p>

            <p className="text-sm text-gray-500">
              {format(journeyDate, "EEE, dd MMM")} | {booking.classCode} |{" "}
              {booking.quota} | Expected platform: {segment.from.platform}
            </p>
          </div>
        </div>

        {/* PASSENGER STATUS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">Passenger Status</h3>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {booking.chartPrepared ? "Chart prepared" : "Chart not prepared"}
              </span>
              <RefreshCcw size={16} className="text-brand-600" />
              <span className="text-gray-400">(Checked just now)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2">S. No</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Current Status</th>
                  <th className="pb-2">Booking Status</th>
                  <th className="pb-2">Coach</th>
                </tr>
              </thead>

              <tbody>
                {booking.passengers.map((p, i) => (
                  <tr key={p.name} className="border-b last:border-none">
                    <td className="py-3">{i + 1}</td>
                    <td className="py-3">
                      {p.name}
                      <div className="text-xs text-gray-500">
                        {p.age} - {p.gender}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-brand-700">
                      {p.currentStatus}
                    </td>
                    <td className="py-3 font-medium">{p.bookingStatus}</td>
                    <td className="py-3">{p.coach ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Train className="text-brand-600" />
              <span className="text-lg font-medium">Book a return ticket</span>
            </div>
            <Link
              href={`/booking/search?from=${booking.to}&to=${booking.from}`}
              className="rounded-lg bg-brand-gradient px-4 py-2 text-white hover:brightness-110"
            >
              Book
            </Link>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Smartphone className="text-brand-600" />
              <span className="text-lg font-medium">
                For a faster experience, get the app
              </span>
            </div>
            <button className="rounded-lg bg-brand-gradient px-4 py-2 text-white hover:brightness-110">
              Download
            </button>
          </div>
        </div>

        {/* FOOD CARD */}
        {train.pantry && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Utensils className="text-amber-600" />
              <span className="text-lg font-medium">
                Get food delivered to your seat
              </span>
            </div>
            <button className="rounded-lg bg-brand-gradient px-4 py-2 text-white hover:brightness-110">
              Order Food
            </button>
          </div>
        )}

        {/* Confirm Percentage */}
        <TrainConfirmationLegend />
      </div>
    </div>
  );
}
