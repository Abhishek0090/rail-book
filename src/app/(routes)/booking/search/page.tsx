import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";
import { ArrowRight, TrainFront } from "lucide-react";
import TrainSeatCard from "@/components/common/TrainSeatCard";
import { getStation } from "@/constants/stations";
import { searchTrains } from "@/data/trains";

export const metadata = { title: "Search trains" };

export default async function TrainSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
}) {
  const { from = null, to = null, date } = await searchParams;
  const parsed = date ? parseISO(date) : new Date();
  const journeyDate = isValid(parsed) ? parsed : new Date();

  const results = searchTrains(from, to, journeyDate);
  const fromStation = getStation(from);
  const toStation = getStation(to);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="my-5 flex flex-col gap-1 rounded-2xl bg-brand-gradient-dark px-6 py-5 text-white">
          <strong className="flex items-center gap-2 text-xl">
            {fromStation?.city ?? from ?? "?"} <ArrowRight size={18} />{" "}
            {toStation?.city ?? to ?? "?"}
          </strong>
          <span className="text-sm text-white/75">
            {results.length} trains between {fromStation?.name ?? from} ({from})
            and {toStation?.name ?? to} ({to}) on{" "}
            {format(journeyDate, "EEE, dd MMM yyyy")}
          </span>
        </div>

        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((train) => (
              <TrainSeatCard key={train.trainNo} {...train} />
            ))
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <TrainFront className="mx-auto text-brand-300" size={48} />
              <p className="mt-4 font-medium text-gray-800">
                No direct trains found for this route on this date
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Some trains do not run every day. Try another date, or Mumbai
                to New Delhi, New Delhi to Varanasi or Howrah to New Delhi.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-lg bg-brand-gradient px-6 py-2 text-white hover:brightness-110"
              >
                Change search
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
