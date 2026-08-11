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