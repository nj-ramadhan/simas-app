import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = { rw_admin: 'Admin RW', rt_admin: 'Admin RT', warga: 'Warga' };

export default function Navbar() {
  const { user } = useAuth();
  return (
    <header className="h-14 bg-white border-b flex items-center justify-end px-6">
      <div className="text-sm text-right">
        <p className="font-medium">{user.nama}</p>
        <p className="text-gray-500">{ROLE_LABEL[user.role]}</p>
      </div>
    </header>
  );
}
