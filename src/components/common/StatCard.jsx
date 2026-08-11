// Catatan: warna dipetakan ke class Tailwind statis (bukan template string
// dinamis "border-${color}-500") karena Tailwind hanya bisa mendeteksi
// nama class yang ditulis utuh saat proses build/purge.
const COLOR_MAP = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  red: 'border-red-500',
  yellow: 'border-yellow-500',
};

export default function StatCard({ label, value, color = 'blue' }) {
  return (
    <div className={`p-4 rounded-lg border-l-4 ${COLOR_MAP[color] || COLOR_MAP.blue} bg-white shadow-sm`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
