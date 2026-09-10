import { getRows, addRow } from '../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);

    if (req.method === 'GET') {
      // warga & rt_admin hanya lihat RT sendiri; rw_admin lihat semua RT di RW-nya
      let data = await getRows('Infrastruktur');
      if (user.role !== 'rw_admin' && user.id_rt != null) {
        data = data.filter(d => Number(d.id_rt) === Number(user.id_rt));
      } else if (user.role === 'rw_admin' && user.id_rw != null) {
        const rtList = await getRows('RT', rt => Number(rt.id_rw) === Number(user.id_rw));
        const rtIds = new Set(rtList.map(rt => Number(rt.id_rt)));
        data = data.filter(d => Number(d.id_rw) === Number(user.id_rw) || rtIds.has(Number(d.id_rt)));
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']); // warga tidak boleh input
      const payload = req.body;
      assertScope(user, payload.id_rt, payload.id_rw);
      const created = await addRow('Infrastruktur', { id: crypto.randomUUID(), ...payload });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}