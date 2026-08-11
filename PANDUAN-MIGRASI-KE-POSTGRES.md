# Migrasi SIMAS: Google Sheets → Neon Postgres (via Vercel Marketplace)

Kabar baik: karena arsitektur project ini sengaja dipisah (semua akses "database"
lewat `api/_lib/sheets.js`), migrasi ini **hanya butuh mengganti 1 file backend**
ditambah setup database baru. Tidak ada file frontend maupun endpoint modul lain
yang perlu diubah.

---

## 1. Buat Database Neon lewat Vercel Dashboard

1. Buka [vercel.com/dashboard](https://vercel.com/dashboard) → pilih project `simas-app`
2. Masuk tab **Storage** → **Create Database** (atau **Marketplace Database**)
3. Pilih provider **Neon** (Postgres)
4. Ikuti wizard — pilih region terdekat (mis. Singapore untuk latency terbaik dari Indonesia)
5. Setelah selesai, Vercel otomatis menghubungkan database ini ke project dan mengisi environment variable secara otomatis (biasanya `POSTGRES_URL`, `DATABASE_URL`, dll — nama pastinya bisa dicek di tab **Settings → Environment Variables**)

## 2. Buat Semua Tabel

1. Di halaman database Neon (bisa diakses lewat tab Storage tadi, atau langsung ke [console.neon.tech](https://console.neon.tech)), buka **SQL Editor**
2. Copy seluruh isi file `scripts/schema.sql` dari paket ini, paste, lalu jalankan (**Run**)
3. Pastikan tidak ada error — akan muncul 17 tabel: `rw`, `rt`, `users`, `sensus`, `jompo`, `anak`, `inklusi`, `perusahaan`, `lingkungan`, `infrastruktur`, `aset`, dan 6 tabel `keuangan_*`

## 3. Tarik Environment Variable ke Lokal

Di terminal VSCode, dalam folder project:
```powershell
vercel link      # kalau belum pernah
vercel env pull .env.local
```
Ini akan menambahkan `POSTGRES_URL` (dan variabel lain dari Neon) ke `.env.local` Anda secara otomatis — tidak perlu copy-paste manual.

**Hapus** baris `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SPREADSHEET_ID` dari `.env.local` — sudah tidak dipakai lagi. `JWT_SECRET` tetap dipertahankan (jangan hapus, jangan generate ulang, supaya token lama masih valid selama development).

## 4. Install Package & Buang yang Tidak Perlu

```powershell
npm install pg dotenv
npm uninstall google-spreadsheet google-auth-library
```

## 5. Timpa File `api/_lib/sheets.js`

Ganti seluruh isi `api/_lib/sheets.js` di project Anda dengan isi file `api/_lib/sheets.js` dari paket ini. **Nama file dan nama semua fungsi ekspor (`getRows`, `addRow`, `updateRowById`, `deleteRowById`) sengaja dibuat identik** dengan versi Google Sheets sebelumnya — jadi `crudFactory.js`, `api/warga/*`, `api/keuangan/*`, dan seluruh modul lain **tidak perlu disentuh sama sekali**.

## 6. Buat Akun Admin Pertama

Ini menyelesaikan masalah "belum ada akun untuk login" yang Anda alami:

1. Copy `scripts/seed-admin.js` ke folder `scripts/` di project Anda
2. **Buka file itu, ganti `PASSWORD`** ke password pilihan Anda (jangan pakai contoh bawaan)
3. Jalankan:
```powershell
node scripts/seed-admin.js
```
4. Kalau berhasil, akan muncul email & password yang bisa langsung dipakai login sebagai **rw_admin**

Setelah berhasil login sebagai rw_admin, Anda bisa membuat akun rt_admin dan warga lewat fitur register di dalam aplikasi (endpoint `/api/auth/register` yang sudah ada) — tidak perlu insert manual lagi untuk akun selanjutnya.

## 7. Jalankan & Test

```powershell
npm run dev
```
Login dengan akun hasil seed tadi, coba explore semua modul.

---

## Catatan Penting

- **Deploy ke Vercel**: environment variable Postgres sudah otomatis ada di production karena disetup lewat Marketplace langsung dari dashboard project — tidak perlu `vercel env add` manual seperti dulu untuk Google credentials.
- **`id_rt` dan `id_rw`** di tabel-tabel modul (Jompo, Anak, dst) sekarang berupa `TEXT` bebas — pastikan nilai yang diisi cocok dengan `id_rt` yang ada di tabel `rt`, supaya nanti kalau mau ditambahkan foreign key constraint bisa konsisten.
- **Kolom tanggal** (`tgl_lahir`, `tanggal`, dll) sekarang bertipe `DATE` di Postgres — pastikan format yang dikirim dari form frontend adalah `YYYY-MM-DD` (default `<input type="date">` sudah otomatis begitu).
- Data yang sudah sempat Anda input manual di Google Sheets (kalau ada) **tidak otomatis pindah** — kalau ada data penting yang mau dipindah, beri tahu saya, saya bisa bantu buatkan script import CSV ke Postgres.
