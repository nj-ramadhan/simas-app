import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardRW from './pages/rw/DashboardRW';
import DashboardRT from './pages/rt/DashboardRT';
import DashboardWarga from './pages/warga/DashboardWarga';

import Sensus from './pages/data/Sensus';
import Jompo from './pages/data/Jompo';
import Anak from './pages/data/Anak';
import Inklusi from './pages/data/Inklusi';
import Perusahaan from './pages/data/Perusahaan';
import Lingkungan from './pages/data/Lingkungan';
import Infrastruktur from './pages/data/Infrastruktur';
import Aset from './pages/data/Aset';

import LaporanKeuangan from './pages/keuangan/LaporanKeuangan';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/rw" element={
            <ProtectedRoute allowedRoles={['rw_admin']}><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardRW />} />
            <Route path="warga" element={<Sensus />} />
            <Route path="jompo" element={<Jompo />} />
            <Route path="anak" element={<Anak />} />
            <Route path="inklusi" element={<Inklusi />} />
            <Route path="perusahaan" element={<Perusahaan />} />
            <Route path="lingkungan" element={<Lingkungan />} />
            <Route path="infrastruktur" element={<Infrastruktur />} />
            <Route path="aset" element={<Aset />} />
          </Route>

          <Route path="/rt" element={
            <ProtectedRoute allowedRoles={['rt_admin']}><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardRT />} />
            <Route path="warga" element={<Sensus />} />
            <Route path="jompo" element={<Jompo />} />
            <Route path="anak" element={<Anak />} />
            <Route path="inklusi" element={<Inklusi />} />
            <Route path="perusahaan" element={<Perusahaan />} />
            <Route path="lingkungan" element={<Lingkungan />} />
            <Route path="infrastruktur" element={<Infrastruktur />} />
            <Route path="aset" element={<Aset />} />
          </Route>

          <Route path="/warga" element={
            <ProtectedRoute allowedRoles={['warga']}><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardWarga />} />
            <Route path="warga" element={<Sensus />} />
          </Route>

          {/* Laporan keuangan bisa diakses semua role yang login (read-only utk warga) */}
          <Route path="/keuangan/:jenis" element={
            <ProtectedRoute allowedRoles={['rw_admin','rt_admin','warga']}><LaporanKeuangan /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}