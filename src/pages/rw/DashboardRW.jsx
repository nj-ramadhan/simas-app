import { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard';
import client from '../../api/client';

const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function DashboardRW() {
  const [data, setData] = useState({ warga: [], lingkungan: [], infrastruktur: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [warga, lingkungan, infrastruktur, finance] = await Promise.all([
          client.get('/warga'), client.get('/lingkungan'), client.get('/infrastruktur'), client.get('/keuangan/global/summary'),
        ]);
        setData({ warga: warga.data, lingkungan: lingkungan.data, infrastruktur: infrastruktur.data, summary: finance.data });
      } catch (err) { setError(err.response?.data?.error || 'Gagal memuat ringkasan RW'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const rtCount = new Set(data.warga.map((row) => row.id_rt).filter(Boolean)).size;
  const stats = [
    { label: 'Total Warga', value: data.warga.length.toLocaleString('id-ID'), color: 'blue' },
    { label: 'RT Terdata', value: rtCount.toLocaleString('id-ID'), color: 'green' },
    { label: 'Laporan Lingkungan', value: data.lingkungan.length.toLocaleString('id-ID'), color: 'yellow' },
    { label: 'Saldo Kas Global', value: money(data.summary?.saldo), color: 'red' },
  ];

  return <div className="dashboard-content"><section className="dashboard-hero dashboard-hero-rw"><div className="hero-copy"><span className="hero-label">Dashboard RW</span><h1 className="hero-title">Overview Wilayah</h1><p className="hero-text">Ringkasan berdasarkan data warga, aset wilayah, dan keuangan yang tersimpan.</p></div></section>{error && <p className="finance-error">{error}</p>}{loading ? <div className="finance-empty">Memuat ringkasan RW...</div> : <><section className="stats-grid">{stats.map((item) => <StatCard key={item.label} {...item} />)}</section><section className="dashboard-panels"><article className="dashboard-panel large-panel"><div className="panel-header"><div><span className="panel-kicker">Data Terukur</span><h2 className="panel-title">Kondisi Wilayah</h2></div><span className="badge badge-success">Database aktif</span></div><div className="mini-summary"><div><span className="summary-number">{data.infrastruktur.length}</span><span className="summary-label">Data infrastruktur</span></div><div><span className="summary-number">{data.lingkungan.length}</span><span className="summary-label">Laporan lingkungan</span></div><div><span className="summary-number">{data.summary?.jumlah_transaksi || 0}</span><span className="summary-label">Transaksi kas global</span></div></div></article><article className="dashboard-panel"><div className="panel-header compact-header"><div><span className="panel-kicker">Keuangan</span><h2 className="panel-title">Arus Kas Global</h2></div><span className="icon-badge">Rp</span></div><ul className="activity-list"><li><span className="bullet bullet-green" />Pemasukan: {money(data.summary?.total_masuk)}</li><li><span className="bullet bullet-danger" />Pengeluaran: {money(data.summary?.total_keluar)}</li><li><span className="bullet bullet-blue" />Saldo: {money(data.summary?.saldo)}</li></ul></article></section></>}</div>;
}
