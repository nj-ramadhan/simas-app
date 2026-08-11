// =============================================================
// FILE INI MENGGANTIKAN api/_lib/sheets.js VERSI GOOGLE SHEETS.
// Nama file & nama fungsi SENGAJA DIBUAT SAMA PERSIS supaya semua
// file lain (crudFactory.js, api/warga/*, api/keuangan/*, dll)
// TIDAK PERLU DIUBAH SAMA SEKALI — cukup timpa file ini.
// =============================================================

import { Pool } from 'pg';

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Nama "sheet" (mis. "Sensus", "Jompo", "Keuangan_DanaSosial") dipetakan
// ke nama tabel Postgres dengan cara di-lowercase-kan.
// Pastikan nama tabel di schema.sql memang huruf kecil semua.
function toTableName(sheetName) {
  return sheetName.toLowerCase();
}

export async function getRows(sheetName, filterFn = null) {
  const db = getPool();
  const { rows } = await db.query(`SELECT * FROM ${toTableName(sheetName)}`);
  return filterFn ? rows.filter(filterFn) : rows;
}

export async function addRow(sheetName, rowData) {
  const db = getPool();
  const keys = Object.keys(rowData);
  const values = Object.values(rowData);
  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await db.query(
    `INSERT INTO ${toTableName(sheetName)} (${columns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return rows[0];
}

export async function updateRowById(sheetName, idField, idValue, newData) {
  const db = getPool();
  const keys = Object.keys(newData);
  if (keys.length === 0) throw new Error('Tidak ada data untuk diupdate');
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = [...Object.values(newData), idValue];
  const { rows } = await db.query(
    `UPDATE ${toTableName(sheetName)} SET ${setClause} WHERE ${idField} = $${keys.length + 1} RETURNING *`,
    values
  );
  if (rows.length === 0) throw new Error('Data tidak ditemukan');
  return rows[0];
}

export async function deleteRowById(sheetName, idField, idValue) {
  const db = getPool();
  const result = await db.query(
    `DELETE FROM ${toTableName(sheetName)} WHERE ${idField} = $1`,
    [idValue]
  );
  if (result.rowCount === 0) throw new Error('Data tidak ditemukan');
  return true;
}
