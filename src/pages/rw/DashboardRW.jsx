import StatCard from '../../components/common/StatCard';

export default function DashboardRW() {
  if (typeof window !== 'undefined') {
    console.log('✅ DashboardRW component mounted');
  }
  
  const stats = [
    { label: 'Total Warga', value: '1.284', color: 'blue' },
    { label: 'RT Aktif', value: '12', color: 'green' },
    { label: 'Lansia Terpantau', value: '86', color: 'yellow' },
    { label: 'Dana Terkumpul', value: 'Rp 18,5Jt', color: 'red' },
  ];

  return (
    <div className="dashboard-content">
      <section className="dashboard-hero dashboard-hero-rw">
        <div className="hero-copy">
          <span className="hero-label">Dashboard RW</span>
          <h1 className="hero-title">Overview Wilayah</h1>
          <p className="hero-text">Selamat datang kembali, berikut kondisi terkini lingkungan RW.</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button">Buat Laporan</button>
          <button className="secondary-button">Lihat Semua</button>
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
              <span className="panel-kicker">Kinerja Komunal</span>
              <h2 className="panel-title">Kondisi Warga</h2>
            </div>
            <span className="badge badge-success">Normal</span>
          </div>
          <div className="chart-block">
            <div className="bar-group">
              <div className="bar-row">
                <span>RT 01</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: '72%' }}></div></div>
                <span className="bar-value">72%</span>
              </div>
              <div className="bar-row">
                <span>RT 02</span>
                <div className="bar-track"><div className="bar-fill fill-green" style={{ width: '91%' }}></div></div>
                <span className="bar-value">91%</span>
              </div>
              <div className="bar-row">
                <span>RT 03</span>
                <div className="bar-track"><div className="bar-fill fill-orange" style={{ width: '48%' }}></div></div>
                <span className="bar-value">48%</span>
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-header compact-header">
            <div>
              <span className="panel-kicker">Agenda Hari Ini</span>
              <h2 className="panel-title">Kegiatan</h2>
            </div>
            <span className="icon-badge">✓</span>
          </div>
          <ul className="activity-list">
            <li><span className="bullet bullet-green"></span>Rapat koordinasi iuran</li>
            <li><span className="bullet bullet-blue"></span>Monitoring lingkungan</li>
            <li><span className="bullet bullet-orange"></span>Ronda malam RT 03</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
