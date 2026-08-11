# Panduan Lengkap Pembangunan SIMAS
### Sistem Informasi Masyarakat — Manajemen & Transparansi Keuangan RT/RW
**Stack:** React (Vite) · Google Sheets sebagai Database · Vercel Serverless Functions · Deploy di Vercel

---

## 1. Ringkasan Arsitektur

```
[ Browser ]
     │  (React SPA, Vite build)
     ▼
[ Vercel Static Hosting ]
     │  fetch('/api/...')
     ▼
[ Vercel Serverless Functions ]  (folder /api → Node.js)
     │  googleapis / google-spreadsheet (Service Account)
     ▼
[ Google Sheets (Spreadsheet) ]  → berfungsi sebagai "database"
```

Prinsip penting:
- **Frontend React TIDAK PERNAH bicara langsung ke Google Sheets API.** Semua akses lewat `api/*` (serverless function) di server, karena kredensial Service Account (private key) tidak boleh bocor ke browser.
- **Role-Based Access Control (RBAC)** ditegakkan di backend (api routes), bukan hanya disembunyikan di UI. Tiga role: `rw_admin`, `rt_admin`, `warga`.
- Google Sheets punya rate limit (≈300 request/menit/project, 60 request/menit/user) — desain API harus meminimalkan jumlah call (batch read, caching ringan).

---

## 2. Skema Data (Struktur Spreadsheet)

Buat 1 Google Spreadsheet, dengan sheet (tab) berikut. Baris 1 = header kolom.

### 2.1 Master & Struktur Wilayah
| Sheet | Kolom |
|---|---|
| `RW` | id_rw, nama_rw, alamat, admin_rw_user_id |
| `RT` | id_rt, id_rw, nama_rt, admin_rt_user_id |
| `Users` | id_user, nama, email, password_hash, role, id_rt, id_rw, status, created_at |

### 2.2 Data Sosial Kependudukan
| Sheet | Kolom kunci |
|---|---|
| `Sensus` | id_warga, id_rt, nik, nama, jenis_kelamin, tgl_lahir, pekerjaan, status_kk, no_kk, alamat, no_hp, foto_url |
| `Jompo` | id, id_warga, id_rt, usia, kondisi_kesehatan, penanggung_jawab, kebutuhan_khusus |
| `Anak` | id, id_warga, id_rt, tgl_lahir, sekolah, jenjang, nama_ortu |
| `Inklusi` | id, id_warga, id_rt, jenis_disabilitas, kebutuhan_bantuan, alat_bantu |

### 2.3 Data Lingkungan & Aset
| Sheet | Kolom kunci |
|---|---|
| `Perusahaan` | id, id_rt, nama_usaha, jenis_usaha, pemilik, alamat, status_izin |
| `Lingkungan` | id, id_rt, kategori (drainase/pohon/TPS/dll), lokasi, kondisi, tgl_laporan |
| `Infrastruktur` | id, id_rt, jenis (jalan/lampu/pos ronda/dll), lokasi, kondisi, tahun_bangun |
| `Aset` | id, id_rt, nama_aset, kategori, jumlah, kondisi, lokasi_simpan, nilai_perolehan |

### 2.4 Modul Keuangan (6 jenis laporan terpisah — sengaja dipisah agar transparan per pos)
Semua sheet keuangan pakai struktur transaksi yang seragam supaya 1 fungsi backend bisa dipakai ulang (generic ledger):

| Sheet | Kolom |
|---|---|
| `Keuangan_Global` | id, id_rt/id_rw, tanggal, tipe(masuk/keluar), kategori, jumlah, keterangan, bukti_url, dicatat_oleh, created_at |
| `Keuangan_Sampah` | (kolom sama) |
| `Keuangan_Keamanan` | (kolom sama) |
| `Keuangan_DanaSosial` | (kolom sama) |
| `Keuangan_DanaKematian` | (kolom sama) |
| `Keuangan_Kompensasi` | (kolom sama) |

> `id_rt` diisi jika transaksi tingkat RT, kosong/`ALL` jika transaksi tingkat RW (mis. Keuangan_Global bisa gabungan semua RT).

---

## 3. Setup Google Cloud & Service Account

1. Buka [Google Cloud Console](https://console.cloud.google.com/) → buat project baru, misalnya `simas-rtrw`.
2. Aktifkan **Google Sheets API** (APIs & Services → Library → cari "Google Sheets API" → Enable).
3. Buat **Service Account**: IAM & Admin → Service Accounts → Create Service Account.
4. Buat **Key** untuk service account tsb (tab Keys → Add Key → JSON) → file JSON ini berisi `client_email` dan `private_key`. **Simpan aman, jangan commit ke git.**
5. Buka Google Spreadsheet yang akan dipakai → klik **Share** → tambahkan `client_email` dari service account sebagai **Editor**.
6. Catat `Spreadsheet ID` (bagian di URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`).

---

## 4. Inisialisasi Project dengan CLI

```bash
# 1. Buat project React dengan Vite
npm create vite@latest simas-app -- --template react
cd simas-app
npm install

# 2. Install dependency inti
npm install react-router-dom axios jsonwebtoken bcryptjs google-spreadsheet google-auth-library dotenv
npm install recharts date-fns clsx

# 3. Styling (Tailwind)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Vercel CLI
npm install -g vercel
vercel login
```

**tailwind.config.js**
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**src/index.css** (tambahkan di paling atas)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 5. Struktur Folder Project

```
simas-app/
├── api/                         # Serverless Functions (Vercel)
│   ├── _lib/
│   │   ├── sheets.js            # koneksi Google Sheets
│   │   ├── auth.js              # verifikasi JWT & role guard
│   │   └── response.js          # helper response JSON standar
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── warga/
│   │   ├── index.js             # GET (list), POST (create)
│   │   └── [id].js              # GET/PUT/DELETE by id
│   ├── jompo/[...].js
│   ├── anak/[...].js
│   ├── inklusi/[...].js
│   ├── perusahaan/[...].js
│   ├── lingkungan/[...].js
│   ├── infrastruktur/[...].js
│   ├── aset/[...].js
│   └── keuangan/
│       ├── [jenis]/index.js     # jenis = global|sampah|keamanan|dana-sosial|dana-kematian|kompensasi
│       └── [jenis]/summary.js   # rekap saldo masuk/keluar
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/                     # axios wrapper client-side
│   │   └── client.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── components/
│   │   ├── layout/ (Sidebar, Navbar, DashboardLayout)
│   │   ├── common/ (DataTable, Modal, FormField, StatCard)
│   │   └── charts/ (FinanceChart)
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── rw/ (DashboardRW.jsx, KelolaRT.jsx, ...)
│   │   ├── rt/ (DashboardRT.jsx, KelolaWarga.jsx, ...)
│   │   ├── warga/ (DashboardWarga.jsx, DataWargaLain.jsx)
│   │   └── keuangan/ (LaporanKeuangan.jsx  — generic, dipakai 6 jenis)
│   └── utils/
├── .env.local                   # JANGAN commit
├── vercel.json
└── package.json
```

---

## 6. Backend — Koneksi ke Google Sheets

**api/_lib/sheets.js**
```js
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let cachedDoc = null;

export async function getDoc() {
  if (cachedDoc) return cachedDoc;

  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  cachedDoc = doc;
  return doc;
}

export async function getSheet(sheetName) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" tidak ditemukan`);
  return sheet;
}

// Helper generic CRUD
export async function getRows(sheetName, filterFn = null) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const data = rows.map(r => r.toObject());
  return filterFn ? data.filter(filterFn) : data;
}

export async function addRow(sheetName, rowData) {
  const sheet = await getSheet(sheetName);
  const row = await sheet.addRow(rowData);
  return row.toObject();
}

export async function updateRowById(sheetName, idField, idValue, newData) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get(idField) === String(idValue));
  if (!row) throw new Error('Data tidak ditemukan');
  Object.entries(newData).forEach(([k, v]) => row.set(k, v));
  await row.save();
  return row.toObject();
}

export async function deleteRowById(sheetName, idField, idValue) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get(idField) === String(idValue));
  if (!row) throw new Error('Data tidak ditemukan');
  await row.delete();
  return true;
}
```

> Catatan: `cachedDoc` bertahan selama serverless function instance "hangat" (warm) — mempercepat request berikutnya. Setelah cold start, akan load ulang. Ini strategi caching paling sederhana; untuk beban lebih tinggi, tambahkan cache in-memory per-sheet dengan TTL singkat (misal 15 detik).

**.env.local** (jangan commit, isi sesuai punya Anda)
```
GOOGLE_CLIENT_EMAIL=service-account@simas-rtrw.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID=1AbCдEfGhIjKlMnOpQrStUvWxYz
JWT_SECRET=isi_dengan_string_acak_panjang
```

---

## 7. Autentikasi & RBAC

### 7.1 Konsep Role
- `rw_admin` → akses semua RT & warga dalam RW-nya, semua laporan keuangan tingkat RW.
- `rt_admin` → hanya akses warga & keuangan di `id_rt` miliknya.
- `warga` → read-only, hanya melihat data warga lain **dalam RT yang sama**, dan laporan keuangan RT-nya (transparansi).

### 7.2 Helper Auth

**api/_lib/auth.js**
```js
import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { id: user.id_user, role: user.role, id_rt: user.id_rt, id_rw: user.id_rw },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function verifyToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Token tidak ada', 401);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AuthError('Token tidak valid', 401);
  }
}

export class AuthError extends Error {
  constructor(message, status = 403) {
    super(message);
    this.status = status;
  }
}

// Guard: hanya role tertentu yang boleh lanjut
export function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError('Anda tidak punya akses untuk aksi ini', 403);
  }
}

// Guard: pastikan resource yang diakses ada dalam scope RT/RW milik user
export function assertScope(user, targetIdRt, targetIdRw) {
  if (user.role === 'rw_admin') {
    if (targetIdRw && targetIdRw !== user.id_rw) {
      throw new AuthError('Di luar cakupan RW Anda', 403);
    }
    return;
  }
  if (user.role === 'rt_admin' || user.role === 'warga') {
    if (targetIdRt && targetIdRt !== user.id_rt) {
      throw new AuthError('Di luar cakupan RT Anda', 403);
    }
    return;
  }
}
```

### 7.3 Login API

**api/auth/login.js**
```js
import bcrypt from 'bcryptjs';
import { getRows } from '../_lib/sheets.js';
import { signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  const { email, password } = req.body;
  try {
    const users = await getRows('Users', u => u.email === email);
    if (users.length === 0) return res.status(401).json({ error: 'Email atau password salah' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

    const token = signToken(user);
    const { password_hash, ...safeUser } = user;
    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
```

> Registrasi warga (`api/auth/register.js`) sebaiknya HANYA bisa dipicu oleh `rt_admin`/`rw_admin` (bukan self-signup bebas), karena identitas warga harus diverifikasi RT dulu. Terapkan `requireRole(user, ['rt_admin','rw_admin'])` di dalamnya.

### 7.4 Password Hashing
Saat membuat user baru:
```js
import bcrypt from 'bcryptjs';
const password_hash = await bcrypt.hash(plainPassword, 10);
```

---

## 8. Pola API Endpoint per Modul (CRUD + RBAC)

Semua endpoint modul data warga (Sensus, Jompo, Anak, Inklusi, Perusahaan, Lingkungan, Infrastruktur, Aset) mengikuti pola yang sama. Contoh untuk **Sensus**:

**api/warga/index.js**
```js
import { getRows, addRow } from '../_lib/sheets.js';
import { verifyToken, requireRole, assertScope, AuthError } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);

    if (req.method === 'GET') {
      // warga & rt_admin hanya lihat RT sendiri; rw_admin lihat semua RT di RW-nya
      let data = await getRows('Sensus');
      if (user.role !== 'rw_admin') {
        data = data.filter(d => d.id_rt === user.id_rt);
      } else {
        const rtList = await getRows('RT', rt => rt.id_rw === user.id_rw);
        const rtIds = rtList.map(rt => rt.id_rt);
        data = data.filter(d => rtIds.includes(d.id_rt));
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']); // warga tidak boleh input
      const payload = req.body;
      assertScope(user, payload.id_rt, null);
      const created = await addRow('Sensus', { id_warga: crypto.randomUUID(), ...payload });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}
```

**api/warga/[id].js**
```js
import { getRows, updateRowById, deleteRowById } from '../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { id } = req.query;

    if (req.method === 'PUT') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      const existing = (await getRows('Sensus', d => d.id_warga === id))[0];
      if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });
      assertScope(user, existing.id_rt, null);
      const updated = await updateRowById('Sensus', 'id_warga', id, req.body);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      const existing = (await getRows('Sensus', d => d.id_warga === id))[0];
      if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });
      assertScope(user, existing.id_rt, null);
      await deleteRowById('Sensus', 'id_warga', id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}
```

> **Replikasi ke modul lain**: copy 2 file di atas, ganti nama sheet (`Jompo`, `Anak`, `Inklusi`, `Perusahaan`, `Lingkungan`, `Infrastruktur`, `Aset`) dan nama field id. Karena logikanya identik, pertimbangkan membuat 1 factory function `createCrudHandler(sheetName, idField, allowedWriteRoles)` di `_lib/` supaya tidak duplikasi kode 8×.

**Contoh factory (opsional, lebih rapi):**
```js
// api/_lib/crudFactory.js
import { getRows, addRow, updateRowById, deleteRowById } from './sheets.js';
import { verifyToken, requireRole, assertScope } from './auth.js';

export function createCrudHandler(sheetName, idField, writeRoles = ['rt_admin', 'rw_admin']) {
  return async function handler(req, res) {
    try {
      const user = verifyToken(req);
      const scopeFilter = (data) => {
        if (user.role === 'rw_admin') return data; // difilter lebih lanjut per RT jika perlu
        return data.filter(d => d.id_rt === user.id_rt);
      };

      if (req.method === 'GET') {
        const data = scopeFilter(await getRows(sheetName));
        return res.status(200).json(data);
      }
      if (req.method === 'POST') {
        requireRole(user, writeRoles);
        assertScope(user, req.body.id_rt, null);
        const created = await addRow(sheetName, { [idField]: crypto.randomUUID(), ...req.body });
        return res.status(201).json(created);
      }
      // PUT/DELETE bisa ditangani dengan query ?id=
      return res.status(405).json({ error: 'Method tidak diizinkan' });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  };
}
```
Lalu tiap file modul cukup:
```js
// api/aset/index.js
import { createCrudHandler } from '../_lib/crudFactory.js';
export default createCrudHandler('Aset', 'id');
```

---

## 9. Modul Keuangan (6 Laporan)

Karena strukturnya seragam, gunakan **dynamic route** `[jenis]` agar 1 file backend melayani 6 laporan.

**Mapping jenis → nama sheet:**
```js
const SHEET_MAP = {
  'global': 'Keuangan_Global',
  'sampah': 'Keuangan_Sampah',
  'keamanan': 'Keuangan_Keamanan',
  'dana-sosial': 'Keuangan_DanaSosial',
  'dana-kematian': 'Keuangan_DanaKematian',
  'kompensasi': 'Keuangan_Kompensasi',
};
```

**api/keuangan/[jenis]/index.js**
```js
import { getRows, addRow } from '../../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../../_lib/auth.js';

const SHEET_MAP = {
  global: 'Keuangan_Global', sampah: 'Keuangan_Sampah', keamanan: 'Keuangan_Keamanan',
  'dana-sosial': 'Keuangan_DanaSosial', 'dana-kematian': 'Keuangan_DanaKematian',
  kompensasi: 'Keuangan_Kompensasi',
};

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    if (!sheetName) return res.status(400).json({ error: 'Jenis laporan tidak valid' });

    if (req.method === 'GET') {
      let data = await getRows(sheetName);
      if (user.role !== 'rw_admin') data = data.filter(d => d.id_rt === user.id_rt || d.id_rt === 'ALL');
      // Semua warga BISA lihat (transparansi), tapi tidak bisa tulis
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      assertScope(user, req.body.id_rt, null);
      const created = await addRow(sheetName, {
        id: crypto.randomUUID(),
        dicatat_oleh: user.id,
        created_at: new Date().toISOString(),
        ...req.body,
      });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}
```

**api/keuangan/[jenis]/summary.js** — rekap saldo (dipakai untuk kartu ringkasan & grafik)
```js
import { getRows } from '../../_lib/sheets.js';
import { verifyToken } from '../../_lib/auth.js';

const SHEET_MAP = { /* sama seperti di atas */ };

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    let data = await getRows(sheetName);
    if (user.role !== 'rw_admin') data = data.filter(d => d.id_rt === user.id_rt || d.id_rt === 'ALL');

    const masuk = data.filter(d => d.tipe === 'masuk').reduce((s, d) => s + Number(d.jumlah), 0);
    const keluar = data.filter(d => d.tipe === 'keluar').reduce((s, d) => s + Number(d.jumlah), 0);

    res.status(200).json({
      total_masuk: masuk,
      total_keluar: keluar,
      saldo: masuk - keluar,
      jumlah_transaksi: data.length,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
```

**PENTING — soal transparansi:** karena tujuan sistem adalah *transparansi keuangan*, endpoint `GET` laporan keuangan sengaja dibuka untuk role `warga` (read-only), sedangkan `POST`/`PUT`/`DELETE` tetap dikunci hanya untuk admin. Jangan sampai warga bisa mengedit data keuangan.

---

## 10. Frontend — Autentikasi & Routing

**src/api/client.js**
```js
import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('simas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

**src/context/AuthContext.jsx**
```jsx
import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('simas_user');
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('simas_token', data.token);
    localStorage.setItem('simas_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('simas_token');
    localStorage.removeItem('simas_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**src/routes/ProtectedRoute.jsx**
```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
```

**src/App.jsx** (routing inti)
```jsx
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
```

### 10.1 Contoh Halaman Generic — Tabel Data (dipakai ulang untuk semua modul)

**src/components/common/DataTable.jsx**
```jsx
export default function DataTable({ columns, data, onEdit, onDelete, canWrite }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          {columns.map(col => <th key={col.key} className="p-2 border-b">{col.label}</th>)}
          {canWrite && <th className="p-2 border-b">Aksi</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={row.id || i} className="hover:bg-gray-50">
            {columns.map(col => <td key={col.key} className="p-2 border-b">{row[col.key]}</td>)}
            {canWrite && (
              <td className="p-2 border-b space-x-2">
                <button onClick={() => onEdit(row)} className="text-blue-600">Edit</button>
                <button onClick={() => onDelete(row)} className="text-red-600">Hapus</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### 10.2 Contoh Halaman Laporan Keuangan (generic untuk 6 jenis)

**src/pages/keuangan/LaporanKeuangan.jsx**
```jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const LABEL = {
  global: 'Kas Global', sampah: 'Iuran Sampah', keamanan: 'Iuran Keamanan',
  'dana-sosial': 'Dana Sosial', 'dana-kematian': 'Dana Kematian', kompensasi: 'Dana Kompensasi',
};

export default function LaporanKeuangan() {
  const { jenis } = useParams();
  const { user } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [summary, setSummary] = useState(null);
  const canWrite = user.role === 'rt_admin' || user.role === 'rw_admin';

  useEffect(() => {
    client.get(`/keuangan/${jenis}`).then(r => setTransaksi(r.data));
    client.get(`/keuangan/${jenis}/summary`).then(r => setSummary(r.data));
  }, [jenis]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Laporan Keuangan — {LABEL[jenis]}</h1>

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Masuk" value={summary.total_masuk} color="green" />
          <StatCard label="Total Keluar" value={summary.total_keluar} color="red" />
          <StatCard label="Saldo" value={summary.saldo} color="blue" />
        </div>
      )}

      {canWrite && <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">
        + Catat Transaksi
      </button>}

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Tanggal</th>
            <th className="p-2 text-left">Tipe</th>
            <th className="p-2 text-left">Kategori</th>
            <th className="p-2 text-right">Jumlah</th>
            <th className="p-2 text-left">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {transaksi.map(t => (
            <tr key={t.id} className="border-b">
              <td className="p-2">{t.tanggal}</td>
              <td className={`p-2 ${t.tipe === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>{t.tipe}</td>
              <td className="p-2">{t.kategori}</td>
              <td className="p-2 text-right">Rp {Number(t.jumlah).toLocaleString('id-ID')}</td>
              <td className="p-2">{t.keterangan}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-lg border-l-4 border-${color}-500 bg-white shadow-sm`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">Rp {Number(value).toLocaleString('id-ID')}</p>
    </div>
  );
}
```

> Buat 1 route `/keuangan/:jenis` di sidebar dengan 6 link (global, sampah, keamanan, dana-sosial, dana-kematian, kompensasi) — tidak perlu 6 halaman terpisah karena komponennya generic.

---

## 11. Deployment ke Vercel

**vercel.json** (root project)
```json
{
  "version": 2,
  "framework": "vite",
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "api/**/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```
> Catatan: pada project Vite modern, Vercel biasanya auto-detect tanpa perlu `builds` manual — cukup pastikan folder `api/` ada di root. Jika auto-detect gagal, gunakan konfigurasi eksplisit di atas.

Langkah deploy:
```bash
# Dari root project
vercel link              # hubungkan folder ke project Vercel
vercel env add GOOGLE_CLIENT_EMAIL production
vercel env add GOOGLE_PRIVATE_KEY production
vercel env add SPREADSHEET_ID production
vercel env add JWT_SECRET production

# Deploy preview dulu untuk cek
vercel

# Deploy production
vercel --prod
```

Untuk `GOOGLE_PRIVATE_KEY`, tempel isi private key apa adanya termasuk `-----BEGIN PRIVATE KEY-----` — Vercel env var mendukung multiline, tidak perlu manual escape `\n` (kode di `sheets.js` sudah menangani `.replace(/\\n/g, '\n')` untuk jaga-jaga).

---

## 12. Pertimbangan Penting & Batasan Google Sheets sebagai Database

1. **Rate limit**: Google Sheets API dibatasi ~300 read request/menit/project & 60/menit/user. Untuk RT/RW dengan ratusan warga dan banyak admin buka bersamaan, pertimbangkan:
   - Cache hasil `getRows()` di memory selama 15–30 detik (per sheet).
   - Gunakan `sheet.getRows({ limit, offset })` untuk pagination, jangan tarik semua data sekaligus di tabel besar.
2. **Concurrency**: Sheets bukan database transaksional — race condition mungkin terjadi jika 2 admin edit baris sama bersamaan. Untuk RT/RW skala kecil biasanya aman, tapi beri catatan ke user.
3. **Struktur ID**: gunakan `crypto.randomUUID()` (Node 18+, tersedia native di Vercel) agar ID unik tanpa perlu auto-increment.
4. **Migrasi masa depan**: desain skema di atas (1 tabel = 1 sheet, kolom konsisten) memudahkan migrasi ke PostgreSQL/Supabase nanti jika sistem berkembang besar — cukup mapping sheet → tabel SQL.
5. **Backup**: karena "database"-nya adalah 1 file Spreadsheet, aktifkan Google Drive version history dan pertimbangkan export terjadwal (mis. Apps Script trigger harian → simpan snapshot CSV ke Drive folder lain).

---

## 13. Roadmap Pengerjaan Bertahap (disarankan)

| Tahap | Fokus |
|---|---|
| 1 | Setup project, Google Sheets, auth login + RBAC dasar |
| 2 | Modul Sensus (CRUD) + dashboard RT/RW/Warga kosong |
| 3 | Modul Jompo, Anak, Inklusi (reuse `crudFactory`) |
| 4 | Modul Perusahaan, Lingkungan, Infrastruktur, Aset |
| 5 | 6 Modul Keuangan + summary + grafik (recharts) |
| 6 | Polish UI (Tailwind), role-based sidebar, export laporan (PDF/Excel) |
| 7 | Testing role permission edge case + deploy production |

---

Selamat membangun SIMAS! Jika Anda ingin, langkah selanjutnya saya bisa bantu buatkan **file skema lengkap Google Sheet siap-pakai (header semua sheet)** atau **generate kode awal project ini langsung sebagai file yang bisa diunduh**.