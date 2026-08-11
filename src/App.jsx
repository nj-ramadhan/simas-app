import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardRW from './pages/rw/DashboardRW';
import DashboardRT from './pages/rt/DashboardRT';
import DashboardWarga from './pages/warga/DashboardWarga';
import LaporanKeuangan from './pages/keuangan/LaporanKeuangan';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/rw/*" element={
            <ProtectedRoute allowedRoles={['rw_admin']}><DashboardRW /></ProtectedRoute>
          } />

          <Route path="/rt/*" element={
            <ProtectedRoute allowedRoles={['rt_admin']}><DashboardRT /></ProtectedRoute>
          } />

          <Route path="/warga/*" element={
            <ProtectedRoute allowedRoles={['warga']}><DashboardWarga /></ProtectedRoute>
          } />

          {/* Laporan keuangan bisa diakses semua role yang login (read-only utk warga) */}
          <Route path="/keuangan/:jenis" element={
            <ProtectedRoute allowedRoles={['rw_admin','rt_admin','warga']}><LaporanKeuangan /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}