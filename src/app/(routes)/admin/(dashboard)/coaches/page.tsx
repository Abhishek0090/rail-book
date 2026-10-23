import Link from "next/link";
import AdminTable from "../AdminTable";
import CoachForm from "./CoachForm";
import { Card, DeleteButton } from "@/components/admin/AdminUi";
import {
  COACH_PREFIX,
  getCoaches,
  SEATS_PER_COACH,
  type Coach,
} from "@/data/admin";
import { CLASS_NAMES, TRAINS, type ClassCode } from "@/data/trains";
import { deleteCoachAction } from "../../actions";

const nextCode = (coaches: Coach[], classCode: ClassCode) => {
  const prefix = COACH_PREFIX[classCode];
  const used = coaches
    .filter((c) => c.code.startsWith(prefix))
    .map((c) => Number(c.code.slice(prefix.length)) || 0);
  return `${prefix}${Math.max(0, ...used) + 1}`;
};

export default async function CoachesPage({
  searchParams,
}: {
  searchParams: Promise<{ train?: string }>;
}) {
  const { train: filter } = await searchParams;
  const coaches = getCoaches(filter);

  const trainOptions = TRAINS.map((t) => {
    const own = getCoaches(t.number);
    return {
      number: t.number,
      name: t.name,
      classes: t.classes,
      nextCode: Object.fromEntries(
        t.classes.map((c) => [c, nextCode(own, c)]),
      ),
    };
  });

  const rows = coaches.map((c) => ({
    id: `${c.trainNo}-${c.code}`,
    train: `${c.trainNo} ${TRAINS.find((t) => t.number === c.trainNo)?.name}`,
    code: (
      <Link
        href={`/admin/seats?train=${c.trainNo}&coach=${c.code}`}
        className="font-mono text-brand-700 hover:underline"
      >
        {c.code}
      </Link>
    ),
    classCode: `${c.classCode} (${CLASS_NAMES[c.classCode]})`,
    seats: c.totalSeats,
    actions: (
      <DeleteButton
        label={`Delete ${c.code}`}
        confirmText={`Delete coach ${c.code} from ${c.trainNo}?`}
        action={deleteCoachAction.bind(null, c.trainNo, c.code)}
      />
    ),
  }));

  return (
    <div className="space-y-6">
      <Card title="Add coach">
        <CoachForm
          trains={trainOptions}
          seatsPerClass={SEATS_PER_COACH}
          defaultTrain={filter}
        />
      </Card>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/coaches"
          className={`rounded-full border px-3 py-1 ${!filter ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 bg-white"}`}
        >
          All trains
        </Link>
        {TRAINS.map((t) => (
          <Link
            key={t.number}
            href={`/admin/coaches?train=${t.number}`}
            className={`rounded-full border px-3 py-1 ${filter === t.number ? "border-brand-600 bg-brand-600 text-white" : "border-gray-200 bg-white hover:border-brand-300"}`}
          >
            {t.number}
          </Link>
        ))}
      </div>

      <AdminTable
        title="Coaches"
        description={`${coaches.length} coaches. Click a coach to see its seat layout.`}
        rowKey="id"
        rows={rows}
        columns={[
          { key: "train", label: "Train" },
          { key: "code", label: "Coach" },
          { key: "classCode", label: "Class" },
          { key: "seats", label: "Seats" },
          { key: "actions", label: "" },
        ]}
      />
    </div>
  );
}
