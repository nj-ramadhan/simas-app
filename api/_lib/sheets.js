import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL;
    const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString || '');
    pool = new Pool({
      connectionString,
      ssl: isLocalDb ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

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