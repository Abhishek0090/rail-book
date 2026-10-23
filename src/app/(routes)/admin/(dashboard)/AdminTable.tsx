import ListTable, { type ColumnDef } from "@/components/common/ListTable";

// Page title + card-wrapped table used by every admin page.
export default function AdminTable<Row extends Record<string, React.ReactNode>>({
  title,
  description,
  rows,
  columns,
  rowKey,
}: {
  title: string;
  description?: string;
  rows: Row[];
  columns: ColumnDef<Row>[];
  rowKey: keyof Row & string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <ListTable rows={rows} columns={columns} rowKey={rowKey} />
      </div>
    </div>
  );
}
