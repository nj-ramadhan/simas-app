import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const email = process.env.RESET_EMAIL;
const password = process.env.RESET_PASSWORD;

if (!email || !password) {
  console.error('Gunakan RESET_EMAIL dan RESET_PASSWORD sebagai environment variable.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Password minimal 8 karakter.');
  process.exit(1);
}

const connectionString = process.env.POSTGRES_URL;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '');
const pool = new Pool({
  connectionString,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email',
    [passwordHash, email]
  );

  if (result.rowCount === 0) {
    throw new Error(`Akun dengan email ${email} tidak ditemukan`);
  }

  console.log(`Password berhasil diubah untuk ${result.rows[0].email}`);
} catch (error) {
  console.error(`Gagal mengubah password: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
