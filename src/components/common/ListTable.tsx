export type ColumnDef<Row> = {
  key: keyof Row & string;
  label: string;
  className?: string;
};

// Generic table: pass column definitions and rows with matching keys.
const ListTable = <Row extends Record<string, React.ReactNode>>({
  rows,
  columns,
  rowKey,
}: {
  rows: Row[];
  columns: ColumnDef<Row>[];
  rowKey: keyof Row & string;
}) => {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="bg-brand-50 text-brand-900">
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="p-3 text-left font-semibold">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={String(row[rowKey])}
            className="border-b border-gray-100 last:border-none hover:bg-gray-50"
          >
            {columns.map((col) => (
              <td key={col.key} className={`p-3 ${col.className ?? ""}`}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ListTable;
