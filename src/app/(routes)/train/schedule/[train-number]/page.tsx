import Link from "next/link";
import { notFound } from "next/navigation";
import ListTable, { type ColumnDef } from "@/components/common/ListTable";
import { getStation } from "@/constants/stations";
import { CLASS_NAMES, getTrain, type RouteStop } from "@/data/trains";

type ScheduleRow = {
  sno: number;
  station: string;
  arrive: string;
  depart: string;
  halt: string;
  distance: string;
  delay: string;
  day: number;
  platform: number;
};

const COLUMNS: ColumnDef<ScheduleRow>[] = [
  { key: "sno", label: "S. No" },
  { key: "station", label: "Station Name & Code", className: "font-medium" },
  { key: "arrive", label: "Arrives" },
  { key: "depart", label: "Departs" },
  { key: "halt", label: "Halt" },
  { key: "distance", label: "Distance" },
  { key: "platform", label: "PF" },
  {
    key: "delay",
    label: "Avg. Delay",
    className: "text-amber-700 font-medium",
  },
  { key: "day", label: "Day" },
];

const haltMinutes = (s: RouteStop) => {
  if (!s.arrive || !s.depart) return "--";
  const [ah, am] = s.arrive.split(":").map(Number);
  const [dh, dm] = s.depart.split(":").map(Number);
  return `${(dh * 60 + dm - (ah * 60 + am) + 1440) % 1440} min`;
};

export default async function TrainRoutePage({
  params,
}: {
  params: Promise<{ "train-number": string }>;
}) {
  const { "train-number": trainNumber } = await params;
  const train = getTrain(trainNumber);
  if (!train) notFound();

  const first = train.route[0];
  const last = train.route[train.route.length - 1];

  const rows: ScheduleRow[] = train.route.map((s, i) => ({
    sno: i + 1,
    station: `${getStation(s.code)?.name.toUpperCase()} - ${s.code}`,
    arrive: s.arrive ?? "Source",
    depart: s.depart ?? "Destination",
    halt: haltMinutes(s),
    distance: `${s.distanceKm} km`,
    delay: s.avgDelayMin ? `${s.avgDelayMin} min` : "-",
    day: s.day,
    platform: s.platform,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* PAGE TITLE */}
        <h1 className="text-center text-3xl font-bold tracking-tight">
          {train.number} Train Route
        </h1>

        {/* TOP INFO SECTION */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Train Info */}
          <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  {train.number} - {train.name.toUpperCase()}
                </h2>
                <p className="mt-1 text-gray-600">
                  {getStation(first.code)?.name} to{" "}
                  {getStation(last.code)?.name} - {last.distanceKm} km
                </p>
                <p className="mt-3 text-sm text-gray-500">
                  Running Days :
                  <span className="ml-2 font-medium text-gray-900">
                    {train.runningDays.join(" ")}
                  </span>
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Classes :
                  <span className="ml-2 font-medium text-gray-900">
                    {train.classes
                      .map((c) => `${c} (${CLASS_NAMES[c]})`)
                      .join(", ")}
                  </span>
                </p>
              </div>
              <Link
                href="/train/schedule"
                className="text-brand-600 font-medium hover:underline"
              >
                CHANGE
              </Link>
            </div>
          </div>

          {/* Promo Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold">{train.name}</h3>
              <p className="mt-1 text-white/80">Seats filling fast!</p>
              <Link
                href={`/booking/search?from=${first.code}&to=${last.code}`}
                className="mt-4 inline-block rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* ROUTE TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ListTable rows={rows} columns={COLUMNS} rowKey="sno" />
        </div>
      </div>
    </div>
  );
}
