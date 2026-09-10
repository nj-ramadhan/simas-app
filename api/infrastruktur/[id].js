import { getRows, updateRowById, deleteRowById } from '../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { id } = req.query;

    if (req.method === 'PUT') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      const existing = (await getRows('Infrastruktur', d => d.id === id))[0];
      if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });
      assertScope(user, existing.id_rt, null);
      const updated = await updateRowById('Infrastruktur', 'id', id, req.body);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      const existing = (await getRows('Infrastruktur', d => d.id === id))[0];
      if (!existing) return res.status(404).json({ error: 'Data tidak ditemukan' });
      assertScope(user, existing.id_rt, null);
      await deleteRowById('Infrastruktur', 'id', id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}