import { getRows, addRow, updateRowById, deleteRowById } from './sheets.js';
import { verifyToken, requireRole, assertScope } from './auth.js';

const WRITE_ROLES = ['rt_admin', 'rw_admin'];

async function scopedRows(tableName, user) {
  const rows = await getRows(tableName);
  if (user.role !== 'rw_admin' && user.id_rt != null) return rows.filter((row) => Number(row.id_rt) === Number(user.id_rt));
  if (user.role === 'rw_admin' && user.id_rw != null) return rows.filter((row) => Number(row.id_rw) === Number(user.id_rw));
  return rows;
}

export function createModuleIndexHandler(tableName, idField) {
  return async function handler(req, res) {
    try {
      const user = verifyToken(req);
      if (req.method === 'GET') return res.status(200).json(await scopedRows(tableName, user));
      if (req.method === 'POST') {
        requireRole(user, WRITE_ROLES);
        assertScope(user, req.body.id_rt, null);
        const created = await addRow(tableName, { [idField]: crypto.randomUUID(), ...req.body });
        return res.status(201).json(created);
      }
      return res.status(405).json({ error: 'Method tidak diizinkan' });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  };
}

export function createModuleItemHandler(tableName, idField) {
  return async function handler(req, res) {
    try {
      const user = verifyToken(req);
      const { id } = req.query;
      const existing = (await getRows(tableName, (row) => String(row[idField]) === String(id)))[0];
      if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });
      assertScope(user, existing.id_rt, null);
      requireRole(user, WRITE_ROLES);

      if (req.method === 'PUT') {
        return res.status(200).json(await updateRowById(tableName, idField, id, req.body));
      }
      if (req.method === 'DELETE') {
        await deleteRowById(tableName, idField, id);
        return res.status(200).json({ success: true });
      }
      return res.status(405).json({ error: 'Method tidak diizinkan' });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  };
}
