export default function DataTable({ columns, data, onEdit, onDelete, canWrite }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          {columns.map(col => <th key={col.key} className="p-2 border-b">{col.label}</th>)}
          {canWrite && <th className="p-2 border-b">Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id || i} className="hover:bg-gray-50">
            {columns.map(col => <td key={col.key} className="p-2 border-b">{row[col.key]}</td>)}
            {canWrite && (
              <td className="p-2 border-b space-x-2">
                <button onClick={() => onEdit(row)} className="text-blue-600">Edit</button>
                <button onClick={() => onDelete(row)} className="text-red-600">Hapus</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}