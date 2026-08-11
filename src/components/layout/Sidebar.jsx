import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENU_BY_ROLE = {
  rw_admin: [
    { to: '/rw', label: 'Dashboard' },
    { to: '/rw/warga', label: 'Data Sensus Warga' },
    { to: '/rw/jompo', label: 'Data Lansia' },
    { to: '/rw/anak', label: 'Data Anak' },
    { to: '/rw/inklusi', label: 'Data Inklusi' },
    { to: '/rw/perusahaan', label: 'Data Perusahaan' },
    { to: '/rw/lingkungan', label: 'Data Lingkungan' },
    { to: '/rw/infrastruktur', label: 'Data Infrastruktur' },
    { to: '/rw/aset', label: 'Data Aset' },
  ],
  rt_admin: [
    { to: '/rt', label: 'Dashboard' },
    { to: '/rt/warga', label: 'Data Sensus Warga' },
    { to: '/rt/jompo', label: 'Data Lansia' },
    { to: '/rt/anak', label: 'Data Anak' },
    { to: '/rt/inklusi', label: 'Data Inklusi' },
    { to: '/rt/perusahaan', label: 'Data Perusahaan' },
    { to: '/rt/lingkungan', label: 'Data Lingkungan' },
    { to: '/rt/infrastruktur', label: 'Data Infrastruktur' },
    { to: '/rt/aset', label: 'Data Aset' },
  ],
  warga: [
    { to: '/warga', label: 'Dashboard' },
    { to: '/warga/warga', label: 'Data Warga Lain' },
  ],
};

const KEUANGAN_MENU = [
  { jenis: 'global', label: 'Kas Global' },
  { jenis: 'sampah', label: 'Iuran Sampah' },
  { jenis: 'keamanan', label: 'Iuran Keamanan' },
  { jenis: 'dana-sosial', label: 'Dana Sosial' },
  { jenis: 'dana-kematian', label: 'Dana Kematian' },
  { jenis: 'kompensasi', label: 'Dana Kompensasi' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const menu = MENU_BY_ROLE[user.role] || [];

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-gray-700">SIMAS</div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`
            }
          >
            {item.label}
          </NavLink>
        ))}

        <p className="px-3 pt-4 pb-1 text-xs uppercase text-gray-500">Laporan Keuangan</p>
        {KEUANGAN_MENU.map((k) => (
          <NavLink
            key={k.jenis}
            to={`/keuangan/${k.jenis}`}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`
            }
          >
            {k.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={logout} className="m-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-sm">
        Keluar
      </button>
    </aside>
  );
}
