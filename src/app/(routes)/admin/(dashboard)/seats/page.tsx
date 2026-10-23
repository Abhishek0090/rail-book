import Link from "next/link";
import { COACHES, getSeats } from "@/data/admin";
import { CLASS_NAMES, getTrain } from "@/data/trains";

export default async function SeatsPage({
  searchParams,
}: {
  searchParams: Promise<{ train?: string; coach?: string }>;
}) {
  const { train: trainNo, coach: coachCode } = await searchParams;
  const coach =
    COACHES.find((c) => c.trainNo === trainNo && c.code === coachCode) ??
    COACHES[0];
  const train = getTrain(coach.trainNo)!;
  const seats = getSeats(coach);
  const booked = seats.filter((s) => s.booked).length;
  const trainCoaches = COACHES.filter((c) => c.trainNo === train.number);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seats</h1>
        <p className="text-sm text-gray-500">
          {train.number} {train.name} - coach {coach.code} (
          {CLASS_NAMES[coach.classCode]}) - {booked}/{seats.length} booked
        </p>
      </div>

      {/* Train picker */}
      <div className="flex flex-wrap gap-2 text-sm">
        {Array.from(new Set(COACHES.map((c) => c.trainNo))).map((n) => (
          <Link
            key={n}
            href={`/admin/seats?train=${n}&coach=${COACHES.find((c) => c.trainNo === n)!.code}`}
            className={`rounded-full border px-3 py-1 ${
              n === train.number
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-gray-200 bg-white hover:border-brand-300"
            }`}
          >
            {n}
          </Link>
        ))}
      </div>

      {/* Coach picker */}
      <div className="flex flex-wrap gap-2 text-sm">
        {trainCoaches.map((c) => (
          <Link
            key={c.code}
            href={`/admin/seats?train=${c.trainNo}&coach=${c.code}`}
            className={`rounded-lg border px-3 py-1 font-mono ${
              c.code === coach.code
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white hover:border-brand-300"
            }`}
          >
            {c.code}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-brand-100 ring-1 ring-brand-300" />{" "}
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-gray-200" /> Booked
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {seats.map((s) => (
            <div
              key={s.number}
              className={`rounded-lg p-2 text-center text-xs ${
                s.booked
                  ? "bg-gray-100 text-gray-400"
                  : "bg-brand-50 text-brand-800 ring-1 ring-brand-200"
              }`}
            >
              <p className="font-semibold">{s.number}</p>
              <p>{s.berth}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
