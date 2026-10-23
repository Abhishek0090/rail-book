import Link from "next/link";
import { Plus } from "lucide-react";
import AdminTable from "../AdminTable";
import { DeleteButton } from "@/components/admin/AdminUi";
import { getStation } from "@/constants/stations";
import { getCoaches } from "@/data/admin";
import { TRAINS } from "@/data/trains";
import { deleteTrainAction } from "../../actions";

export default function TrainsPage() {
  const rows = TRAINS.map((t) => {
    const first = t.route[0];
    const last = t.route[t.route.length - 1];
    return {
      id: t.number,
      number: (
        <Link
          href={`/train/schedule/${t.number}`}
          className="font-mono text-brand-700 hover:underline"
        >
          {t.number}
        </Link>
      ),
      name: t.name,
      type: t.type,
      route: `${getStation(first.code)?.name ?? first.code} - ${getStation(last.code)?.name ?? last.code}`,
      stops: t.route.length,
      distance: `${last.distanceKm} km`,
      classes: t.classes.join(", "),
      coaches: (
        <Link
          href={`/admin/coaches?train=${t.number}`}
          className="text-brand-700 hover:underline"
        >
          {getCoaches(t.number).length}
        </Link>
      ),
      days: t.runningDays.length === 7 ? "Daily" : t.runningDays.join(" "),
      actions: (
        <DeleteButton
          label={`Delete ${t.number}`}
          confirmText={`Delete train ${t.number} ${t.name} and its coaches?`}
          action={deleteTrainAction.bind(null, t.number)}
        />
      ),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href="/admin/trains/new"
          className="flex items-center gap-1 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          <Plus size={16} /> Add train
        </Link>
      </div>
      <AdminTable
        title="Trains"
        description={`${TRAINS.length} trains. Trains with bookings cannot be deleted.`}
        rowKey="id"
        rows={rows}
        columns={[
          { key: "number", label: "Number" },
          { key: "name", label: "Name", className: "font-medium" },
          { key: "type", label: "Type" },
          { key: "route", label: "Route" },
          { key: "stops", label: "Stops" },
          { key: "distance", label: "Distance" },
          { key: "classes", label: "Classes" },
          { key: "coaches", label: "Coaches" },
          { key: "days", label: "Runs" },
          { key: "actions", label: "" },
        ]}
      />
    </div>
  );
}
