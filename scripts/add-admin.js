import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ROLE = 'rw_admin', ADMIN_RW, ADMIN_RT } = process.env;
const idRw = ADMIN_RW === undefined ? null : Number(ADMIN_RW);
const idRt = ADMIN_RT === undefined || ADMIN_RT === '' ? null : Number(ADMIN_RT);

function fail(message) {
  console.error(`Gagal: ${message}`);
  process.exit(1);
}

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) fail('ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD wajib diisi.');
if (!['rw_admin', 'rt_admin'].includes(ADMIN_ROLE)) fail('ADMIN_ROLE harus rw_admin atau rt_admin.');
if (ADMIN_PASSWORD.length < 8) fail('ADMIN_PASSWORD minimal 8 karakter.');
if (!Number.isInteger(idRw) || idRw < 1) fail('ADMIN_RW harus nomor RW positif.');
if (ADMIN_ROLE === 'rt_admin' && (!Number.isInteger(idRt) || idRt < 1)) fail('ADMIN_RT wajib diisi untuk rt_admin.');
if (ADMIN_ROLE === 'rw_admin' && idRt !== null) fail('Admin RW tidak boleh memiliki ADMIN_RT.');

const connectionString = process.env.POSTGRES_URL;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '');
const pool = new Pool({ connectionString, ssl: isLocalDb ? false : { rejectUnauthorized: false } });

try {
  await pool.query('BEGIN');
  const rw = await pool.query('SELECT id_rw FROM rw WHERE id_rw = $1', [idRw]);
  if (rw.rowCount === 0) fail(`RW ${idRw} belum tersedia di tabel rw.`);

  if (ADMIN_ROLE === 'rt_admin') {
    const rt = await pool.query('SELECT id_rt FROM rt WHERE id_rt = $1 AND id_rw = $2', [idRt, idRw]);
    if (rt.rowCount === 0) fail(`RT ${idRt} tidak ditemukan di RW ${idRw}.`);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (id_user, nama, email, password_hash, role, id_rt, id_rw, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'aktif')`,
    [randomUUID(), ADMIN_NAME, ADMIN_EMAIL, passwordHash, ADMIN_ROLE, idRt, idRw]
  );
  await pool.query('COMMIT');
  console.log(`Admin ${ADMIN_ROLE} berhasil dibuat untuk RW ${idRw}${idRt === null ? '' : ` RT ${idRt}`}.`);
} catch (error) {
  await pool.query('ROLLBACK').catch(() => {});
  if (error.code === '23505') fail('Email sudah digunakan.');
  fail(error.message);
} finally {
  await pool.end();
}
