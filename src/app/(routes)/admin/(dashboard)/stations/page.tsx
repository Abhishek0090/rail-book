import AdminTable from "../AdminTable";
import StationForm from "./StationForm";
import { Card, DeleteButton } from "@/components/admin/AdminUi";
import { STATIONS } from "@/constants/stations";
import { TRAINS } from "@/data/trains";
import { deleteStationAction } from "../../actions";

export default function StationsPage() {
  const rows = STATIONS.map((s) => ({
    code: s.code,
    name: s.name,
    city: s.city,
    state: s.state,
    trains: TRAINS.filter((t) => t.route.some((r) => r.code === s.code))
      .length,
    actions: (
      <DeleteButton
        label={`Delete ${s.code}`}
        confirmText={`Delete station ${s.code} - ${s.name}?`}
        action={deleteStationAction.bind(null, s.code)}
      />
    ),
  }));

  return (
    <div className="space-y-6">
      <Card title="Add station">
        <StationForm />
      </Card>
      <AdminTable
        title="Stations"
        description={`${STATIONS.length} stations. A station on a train route cannot be deleted.`}
        rowKey="code"
        rows={rows}
        columns={[
          { key: "code", label: "Code", className: "font-mono font-medium" },
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "state", label: "State" },
          { key: "trains", label: "Trains stopping" },
          { key: "actions", label: "" },
        ]}
      />
    </div>
  );
}
