import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useState } from 'react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`dashboard-frame ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
      <div className="content-area">
        <Navbar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
