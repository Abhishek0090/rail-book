import { Train } from "lucide-react";
import type { LiveStop } from "@/data/trains";

const TrainRunningInfo = ({
  current,
  lastUpdated,
}: {
  current: LiveStop;
  lastUpdated: string;
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex gap-4">
      <div className="h-10 w-10 shrink-0 rounded-full bg-brand-100 flex items-center justify-center">
        <Train className="text-brand-600" size={20} />
      </div>

      <div>
        <p className="font-medium">
          Train is at{" "}
          <span className="font-semibold">{current.name.toUpperCase()}</span>
          {current.avgDelayMin > 0 && (
            <span className="ml-2 text-rose-600">
              ({current.avgDelayMin} min late)
            </span>
          )}
        </p>
        <p className="text-sm text-gray-500">
          Last Updated: {lastUpdated}. Demo data: this running information is
          not affiliated with or endorsed by Indian Railways or IRCTC.
        </p>
      </div>
    </div>
  );
};

export default TrainRunningInfo;
