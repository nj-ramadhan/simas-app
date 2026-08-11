import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  console.log('🔵 DashboardLayout mounted');
  
  return (
    <div className="dashboard-frame">
      <Sidebar />
      <div className="content-area">
        <Navbar />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
