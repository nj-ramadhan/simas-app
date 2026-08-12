import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  const { rows } = await pool.query('SELECT NOW() as time, current_database() as db');
  console.log('✅ Koneksi berhasil:', rows[0]);

  const users = await pool.query('SELECT count(*) FROM users');
  console.log('✅ Tabel users terbaca, jumlah baris:', users.rows[0].count);
} catch (err) {
  console.error('❌ Gagal:', err.message);
} finally {
  await pool.end();
}