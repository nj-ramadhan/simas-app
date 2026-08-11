# Cara Integrasi File Tambahan Ini ke Project Anda

## 1. Copy Semua File
Salin seluruh isi folder ini (kecuali file `CARA-INTEGRASI.md` ini sendiri) ke folder project `simas-app` Anda, **timpa jika ada file yang sama** kecuali:
- `api/_lib/crudFactory.js` — file ini SENGAJA menggantikan versi sederhana sebelumnya (sekarang mendukung GET/PUT/DELETE per-id). Timpa saja.
- Jangan timpa `App.jsx`, `AuthContext.jsx`, `ProtectedRoute.jsx`, `DataTable.jsx`, `LaporanKeuangan.jsx`, `LoginPage.jsx`, `DashboardRW.jsx`, `DashboardRT.jsx`, `DashboardWarga.jsx`, `sheets.js`, `auth.js`, `login.js`, `api/warga/*`, `api/keuangan/*`, `client.js`, `vite.config.js` — itu sudah ada dari langkah sebelumnya.
- Jika `package.json`, `.gitignore`, `vercel.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/index.css` sudah ada dan sudah jalan di project Anda, **tidak perlu ditimpa** — file di sini hanya jaga-jaga kalau belum ada.

## 2. Update `src/App.jsx`

Ganti isi `DashboardRW.jsx` placeholder Anda dengan routing bersarang memakai `DashboardLayout`, atau paling simpel: tambahkan route baru langsung di `App.jsx` seperti ini (contoh untuk role RW, pola yang sama untuk RT & Warga):

```jsx
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardRW from './pages/rw/DashboardRW';
import Sensus from './pages/data/Sensus';
import Jompo from './pages/data/Jompo';
import Anak from './pages/data/Anak';
import Inklusi from './pages/data/Inklusi';
import Perusahaan from './pages/data/Perusahaan';
import Lingkungan from './pages/data/Lingkungan';
import Infrastruktur from './pages/data/Infrastruktur';
import Aset from './pages/data/Aset';

// ... di dalam <Routes>, ganti route "/rw/*" menjadi nested route:
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
```

Route `/keuangan/:jenis` yang sudah ada sebelumnya tidak perlu diubah — tetap bisa diakses semua role yang login. Kalau ingin laporan keuangan juga tampil di dalam `DashboardLayout` (dengan Sidebar), pindahkan route itu ke dalam masing-masing blok `/rw`, `/rt`, `/warga` di atas.

## 3. Sesuaikan Spreadsheet
Pastikan nama sheet di Google Spreadsheet Anda **persis sama** (case-sensitive) dengan yang dipakai kode: `Jompo`, `Anak`, `Inklusi`, `Perusahaan`, `Lingkungan`, `Infrastruktur`, `Aset` — dengan kolom header sesuai skema di panduan awal (`PANDUAN-SIMAS.md`).

## 4. Jalankan
```bash
npm run dev
```
Login sebagai `rt_admin` atau `rw_admin`, cek menu di Sidebar kiri — semua modul data sudah bisa diakses dengan CRUD penuh (tambah/edit/hapus), sementara login sebagai `warga` hanya bisa melihat (read-only).
