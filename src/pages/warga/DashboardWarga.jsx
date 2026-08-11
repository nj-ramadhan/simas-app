import StatCard from '../../components/common/StatCard';

export default function DashboardWarga() {
  const stats = [
    { label: 'Warga Terdaftar', value: '1.284', color: 'blue' },
    { label: 'Iuran Bulan Ini', value: 'Rp 2,9Jt', color: 'green' },
    { label: 'Lansia', value: '86', color: 'yellow' },
    { label: 'Kegiatan Aktif', value: '12', color: 'red' },
  ];

  return (
    <div className="dashboard-content">
      <section className="dashboard-hero dashboard-hero-warga">
        <div className="hero-copy">
          <span className="hero-label">Dashboard Warga</span>
          <h1 className="hero-title">Selamat Datang</h1>
          <p className="hero-text">Informasi warga, layanan, dan laporan keuangan RT/RW tersedia disini.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button">Lihat Keuangan</button>
          <button className="secondary-button">Kirim Laporan</button>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} color={item.color} />
        ))}
      </section>

      <section className="dashboard-panels">
        <article className="dashboard-panel large-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Data Warga</span>
              <h2 className="panel-title">Status Keaktifan</h2>
            </div>
            <span className="badge badge-success">Online</span>
          </div>
          <div className="mini-summary">
            <div>
              <span className="summary-number">76%</span>
              <span className="summary-label">Kepala keluarga hadir</span>
            </div>
            <div>
              <span className="summary-number">08</span>
              <span className="summary-label">Kegiatan minggu ini</span>
            </div>
            <div>
              <span className="summary-number">07</span>
              <span className="summary-label">Layanan aktif</span>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header compact-header">
            <div>
              <span className="panel-kicker">Notifikasi</span>
              <h2 className="panel-title">Pemberitahuan</h2>
            </div>
            <span className="icon-badge">•••</span>
          </div>
          <ul className="activity-list">
            <li><span className="bullet bullet-green"></span>Tagihan iuran siap dibayar</li>
            <li><span className="bullet bullet-blue"></span>Posyandu hari Sabtu</li>
            <li><span className="bullet bullet-orange"></span>Rapat RT malam ini</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
