import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = { rw_admin: 'Admin RW', rt_admin: 'Admin RT', warga: 'Warga' };

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="app-navbar">
      <div className="page-title-group">
        <span className="page-kicker">Dashboard RT/RW</span>
        <h1 className="page-title">SIMAS Dashboard</h1>
      </div>

      <div className="navbar-actions">
        <button className="icon-button" aria-label="Notifikasi">
          <span aria-hidden="true">♢</span>
        </button>
        <div className="user-summary">
          <div className="user-avatar">{user?.nama ? user.nama.charAt(0).toUpperCase() : 'S'}</div>
          <div>
            <p className="user-name">{user?.nama || 'Sistem'}</p>
            <p className="user-role">{ROLE_LABEL[user?.role] || 'Akses'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
