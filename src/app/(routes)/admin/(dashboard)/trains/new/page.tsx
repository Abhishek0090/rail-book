import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/admin/AdminUi";
import { STATIONS } from "@/constants/stations";
import TrainForm from "./TrainForm";

export default function NewTrainPage() {
  return (
    <div className="space-y-4">
      <Link
        href="/admin/trains"
        className="flex items-center gap-1 text-sm text-brand-700 hover:underline"
      >
        <ArrowLeft size={14} /> Back to trains
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Add train</h1>
      <p className="text-sm text-gray-500">
        Default coaches are created for each class you pick. Adjust them on the
        Coaches page afterwards. Missing a station? Add it on the Stations page
        first.
      </p>
      <Card>
        <TrainForm stations={[...STATIONS]} />
      </Card>
    </div>
  );
}
