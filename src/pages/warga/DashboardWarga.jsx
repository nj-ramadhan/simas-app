import { useEffect, useState } from 'react';
import StatCard from '../../components/common/StatCard';
import client from '../../api/client';

const money = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function DashboardWarga() {
  const [data, setData] = useState({ warga: [], lingkungan: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    async function load() {
      try {
        const [warga, lingkungan, finance] = await Promise.all([client.get('/warga'), client.get('/lingkungan'), client.get('/keuangan/global/summary')]);
        setData({ warga: warga.data, lingkungan: lingkungan.data, summary: finance.data });
      } catch (err) { setError(err.response?.data?.error || 'Gagal memuat informasi warga'); }
      finally { setLoading(false); }
    }
    load();
  }, []);
  const stats = [{ label: 'Warga Terdaftar', value: data.warga.length.toLocaleString('id-ID'), color: 'blue' }, { label: 'Saldo Kas Global', value: money(data.summary?.saldo), color: 'green' }, { label: 'Laporan Lingkungan', value: data.lingkungan.length.toLocaleString('id-ID'), color: 'yellow' }, { label: 'Transaksi Keuangan', value: (data.summary?.jumlah_transaksi || 0).toLocaleString('id-ID'), color: 'red' }];
  return <div className="dashboard-content"><section className="dashboard-hero dashboard-hero-warga"><div className="hero-copy"><span className="hero-label">Dashboard Warga</span><h1 className="hero-title">Selamat Datang</h1><p className="hero-text">Informasi warga dan transparansi keuangan yang diambil langsung dari database.</p></div></section>{error && <p className="finance-error">{error}</p>}{loading ? <div className="finance-empty">Memuat informasi warga...</div> : <><section className="stats-grid">{stats.map((item) => <StatCard key={item.label} {...item} />)}</section><section className="dashboard-panels"><article className="dashboard-panel large-panel"><div className="panel-header"><div><span className="panel-kicker">Transparansi</span><h2 className="panel-title">Ringkasan Keuangan</h2></div><span className="badge badge-success">Data terbaru</span></div><div className="mini-summary"><div><span className="summary-number">{money(data.summary?.total_masuk)}</span><span className="summary-label">Total masuk</span></div><div><span className="summary-number">{money(data.summary?.total_keluar)}</span><span className="summary-label">Total keluar</span></div><div><span className="summary-number">{money(data.summary?.saldo)}</span><span className="summary-label">Saldo</span></div></div></article><article className="dashboard-panel"><div className="panel-header compact-header"><div><span className="panel-kicker">Lingkungan</span><h2 className="panel-title">Laporan Tercatat</h2></div><span className="icon-badge">{data.lingkungan.length}</span></div><ul className="activity-list"><li><span className="bullet bullet-blue" />{data.lingkungan.length} laporan lingkungan tersimpan</li><li><span className="bullet bullet-green" />{data.warga.length} warga berada dalam cakupan Anda</li><li><span className="bullet bullet-orange" />{data.summary?.jumlah_transaksi || 0} transaksi dapat dilihat</li></ul></article></section></>}</div>;
}
