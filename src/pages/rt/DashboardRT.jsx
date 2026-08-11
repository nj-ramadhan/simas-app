import StatCard from '../../components/common/StatCard';

export default function DashboardRT() {
  const stats = [
    { label: 'Warga RT', value: '126', color: 'blue' },
    { label: 'Kepala Keluarga', value: '38', color: 'green' },
    { label: 'Lansia', value: '14', color: 'yellow' },
    { label: 'Iuran Bulan Ini', value: 'Rp 2,9Jt', color: 'red' },
  ];

  return (
    <div className="dashboard-content">
      <section className="dashboard-hero dashboard-hero-rt">
        <div className="hero-copy">
          <span className="hero-label">Dashboard RT</span>
          <h1 className="hero-title">Monitoring RT 03</h1>
          <p className="hero-text">Pantau data warga, kegiatan, dan layanan sosial RT saat ini.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button">Tambah Data</button>
          <button className="secondary-button">Cetak Ringkas</button>
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
              <span className="panel-kicker">Kondisi RT</span>
              <h2 className="panel-title">Layanan Warga</h2>
            </div>
            <span className="badge badge-info">Hari Ini</span>
          </div>
          <div className="mini-summary">
            <div>
              <span className="summary-number">08</span>
              <span className="summary-label">Keluarga butuh bantuan</span>
            </div>
            <div>
              <span className="summary-number">04</span>
              <span className="summary-label">Laporan lingkungan</span>
            </div>
            <div>
              <span className="summary-number">12</span>
              <span className="summary-label">Kegiatan aktif</span>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header compact-header">
            <div>
              <span className="panel-kicker">Prioritas</span>
              <h2 className="panel-title">Catatan</h2>
            </div>
            <span className="icon-badge">!</span>
          </div>
          <ul className="activity-list">
            <li><span className="bullet bullet-danger"></span>Verifikasi data KK baru</li>
            <li><span className="bullet bullet-green"></span>Perbaikan lampu gang</li>
            <li><span className="bullet bullet-blue"></span>Persiapan posyandu</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
