// Script untuk menambah multiple test users
// CARA PAKAI:
//   node scripts/seed-users.js

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

// Users yang akan dibuat
const testUsers = [
  {
    nama: 'Budi Santoso',
    email: 'budi@simas.local',
    password: 'budi123',
    role: 'rt_admin',
    rt: 'RT 01',
  },
  {
    nama: 'Siti Nurhaliza',
    email: 'siti@simas.local',
    password: 'siti123',
    role: 'rt_admin',
    rt: 'RT 02',
  },
  {
    nama: 'Ahmad Wijaya',
    email: 'ahmad@simas.local',
    password: 'ahmad123',
    role: 'warga',
    rt: 'RT 01',
  },
  {
    nama: 'Dewi Lestari',
    email: 'dewi@simas.local',
    password: 'dewi123',
    role: 'warga',
    rt: 'RT 01',
  },
  {
    nama: 'Rudi Hermawan',
    email: 'rudi@simas.local',
    password: 'rudi123',
    role: 'warga',
    rt: 'RT 02',
  },
  {
    nama: 'Admin Pusat',
    email: 'admin@simas.local',
    password: 'GantiPasswordIni123',
    role: 'rw_admin',
    rt: null,
  },
];

async function main() {
  try {
    console.log('📝 Mulai menambah test users...\n');

    // Get atau buat RW
    let rwResult = await pool.query('SELECT id_rw FROM rw LIMIT 1');
    let idRw = rwResult.rows[0]?.id_rw;

    if (!idRw) {
      idRw = randomUUID();
      await pool.query('INSERT INTO rw (id_rw, nama_rw) VALUES ($1, $2)', [idRw, 'RW Contoh']);
      console.log('✅ Membuat RW Contoh');
    }

    // Get atau buat RTs
    const rtNames = ['RT 01', 'RT 02'];
    const rtMap = {};

    for (const rtName of rtNames) {
      let rtResult = await pool.query('SELECT id_rt FROM rt WHERE nama_rt = $1', [rtName]);
      if (rtResult.rows[0]) {
        rtMap[rtName] = rtResult.rows[0].id_rt;
      } else {
        const newIdRt = randomUUID();
        await pool.query('INSERT INTO rt (id_rt, id_rw, nama_rt) VALUES ($1, $2, $3)', [
          newIdRt,
          idRw,
          rtName,
        ]);
        rtMap[rtName] = newIdRt;
        console.log(`✅ Membuat ${rtName}`);
      }
    }

    // Add users
    let successCount = 0;
    let skipCount = 0;

    for (const user of testUsers) {
      try {
        const idUser = randomUUID();
        const passwordHash = await bcrypt.hash(user.password, 10);
        const idRt = user.rt ? rtMap[user.rt] : null;

        await pool.query(
          `INSERT INTO users (id_user, nama, email, password_hash, role, id_rt, id_rw, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [idUser, user.nama, user.email, passwordHash, user.role, idRt, idRw, 'aktif']
        );

        console.log(`✅ ${user.email} (${user.role}${user.rt ? ' - ' + user.rt : ''})`);
        successCount++;
      } catch (err) {
        if (err.code === '23505') {
          // Unique constraint violation (email sudah ada)
          console.log(`⏭️  ${user.email} (sudah ada)`);
          skipCount++;
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✨ Selesai! Ditambahkan: ${successCount}, Skipped: ${skipCount}`);
    console.log('\n📋 Test Credentials:');
    testUsers.forEach((user) => {
      console.log(`   ${user.email} / ${user.password}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
