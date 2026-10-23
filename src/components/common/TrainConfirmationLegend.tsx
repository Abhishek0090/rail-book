import { Info } from "lucide-react";
import LegendItem from "../ui/LegendItem";

const TrainConfirmationLegend = () => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="space-y-6">
        <LegendItem
          color="bg-emerald-500"
          text="Very High confirmation chances (>70%)."
        />

        <LegendItem
          color="bg-amber-400"
          text="Medium confirmation chances (30-70%)."
        />

        <LegendItem
          color="bg-rose-500"
          text="Very Low confirmation chances (<30%)."
        />

        <div className="flex items-start gap-2 text-gray-500 text-sm pt-2">
          <Info size={16} className="mt-0.5" />
          <p>RAC will be considered as confirmed while predicting.</p>
        </div>
      </div>
    </div>
  );
};

export default TrainConfirmationLegend;
