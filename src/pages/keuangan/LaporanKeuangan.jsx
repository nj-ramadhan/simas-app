import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LABEL = {
  global: 'Kas Global', sampah: 'Iuran Sampah', keamanan: 'Iuran Keamanan',
  'dana-sosial': 'Dana Sosial', 'dana-kematian': 'Dana Kematian', kompensasi: 'Dana Kompensasi',
};

export default function LaporanKeuangan() {
  const { jenis } = useParams();
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [summary, setSummary] = useState(null);
  const canWrite = user.role === 'rt_admin' || user.role === 'rw_admin';

  useEffect(() => {
    client.get(`/keuangan/${jenis}`).then(r => setTransaksi(r.data));
    client.get(`/keuangan/${jenis}/summary`).then(r => setSummary(r.data));
  }, [jenis]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Laporan Keuangan — {LABEL[jenis]}</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Masuk" value={summary.total_masuk} color="green" />
          <StatCard label="Total Keluar" value={summary.total_keluar} color="red" />
          <StatCard label="Saldo" value={summary.saldo} color="blue" />
        </div>
      )}

      {canWrite && <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">
        + Catat Transaksi
      </button>}

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Tanggal</th>
            <th className="p-2 text-left">Tipe</th>
            <th className="p-2 text-left">Kategori</th>
            <th className="p-2 text-right">Jumlah</th>
            <th className="p-2 text-left">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map(t => (
            <tr key={t.id} className="border-b">
              <td className="p-2">{t.tanggal}</td>
              <td className={`p-2 ${t.tipe === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>{t.tipe}</td>
              <td className="p-2">{t.kategori}</td>
              <td className="p-2 text-right">Rp {Number(t.jumlah).toLocaleString('id-ID')}</td>
              <td className="p-2">{t.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-lg border-l-4 border-${color}-500 bg-white shadow-sm`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">Rp {Number(value).toLocaleString('id-ID')}</p>
    </div>
  );
}