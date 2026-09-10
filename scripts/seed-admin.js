// Script sekali-jalan untuk membuat akun rw_admin PERTAMA.
// Ini perlu karena api/auth/register.js sengaja mensyaratkan sudah ada
// admin yang login (supaya tidak sembarang orang bisa daftar sendiri) —
// jadi untuk akun paling pertama, harus di-insert langsung ke database.
//
// CARA PAKAI:
//   1. Pastikan .env.local sudah berisi POSTGRES_URL (hasil `vercel env pull .env.local`)
//   2. npm install pg bcryptjs dotenv   (kalau belum ada)
//   3. GANTI password di bawah sebelum menjalankan
//   4. node scripts/seed-admin.js

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

async function main() {
  const EMAIL = 'admin@simdes.local';   // <-- ganti sesuai keinginan
  const PASSWORD = 'admin'; // <-- WAJIB ganti sebelum run

  const idRw = 1;
  const idRt = 1;
  const idUser = randomUUID();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await pool.query('INSERT INTO rw (id_rw, nama_rw) VALUES ($1, $2)', [idRw, 'RW Contoh']);
  await pool.query('INSERT INTO rt (id_rt, id_rw, nama_rt) VALUES ($1, $2, $3)', [idRt, idRw, 'RT 01']);
  await pool.query(
    `INSERT INTO users (id_user, nama, email, password_hash, role, id_rt, id_rw, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [idUser, 'Admin RW', EMAIL, passwordHash, 'rw_admin', null, idRw, 'aktif']
  );

  console.log('✅ Berhasil membuat akun admin pertama:');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('   id_rw   :', idRw, '  id_rt (contoh):', idRt);
  console.log('\nSilakan login dengan akun ini, lalu buat akun rt_admin/warga lain lewat fitur register di aplikasi.');

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Gagal membuat akun admin:', err.message);
  process.exit(1);
});
