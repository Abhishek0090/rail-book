import { Check, TrainFront } from "lucide-react";
import type { LiveStop } from "@/data/trains";

const DOT_STYLES: Record<LiveStop["state"], string> = {
  departed: "bg-brand-100 text-brand-600",
  current: "bg-brand-gradient text-white ring-4 ring-brand-100",
  upcoming: "bg-gray-100 text-gray-400",
};

const TrainStationTimeline = ({ stops }: { stops: LiveStop[] }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-5 text-sm text-gray-500 px-6 py-3 border-b">
        <span>Station</span>
        <span>Date</span>
        <span>Arrives</span>
        <span>Departs</span>
        <span>Late</span>
      </div>

      {stops.map((s) => (
        <div
          key={s.code}
          className={`grid min-w-[640px] grid-cols-5 items-center px-6 py-4 border-b last:border-none text-sm ${
            s.state === "current" ? "bg-brand-50" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center ${DOT_STYLES[s.state]}`}
            >
              {s.state === "current" ? (
                <TrainFront size={12} />
              ) : s.state === "departed" ? (
                <Check size={12} />
              ) : null}
            </span>
            <span className={s.state === "upcoming" ? "text-gray-500" : ""}>
              {s.name}
            </span>
          </div>

          <span>
            Day {s.day} {s.date}
          </span>
          <span>
            {s.arrive ?? "-"}
            {s.actualArrive && s.avgDelayMin > 0 && (
              <span className="block text-xs text-rose-500">
                {s.actualArrive}
              </span>
            )}
          </span>
          <span>
            {s.depart ?? "-"}
            {s.actualDepart && s.avgDelayMin > 0 && (
              <span className="block text-xs text-rose-500">
                {s.actualDepart}
              </span>
            )}
          </span>
          <span
            className={s.avgDelayMin > 0 ? "text-rose-600" : "text-emerald-600"}
          >
            {s.avgDelayMin > 0 ? `${s.avgDelayMin} min` : "On time"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TrainStationTimeline;
