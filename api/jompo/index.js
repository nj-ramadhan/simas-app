import { getRows, addRow } from '../_lib/sheets.js';
import { verifyToken, requireRole, assertScope, AuthError } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);

    if (req.method === 'GET') {
      // warga & rt_admin hanya lihat RT sendiri; rw_admin lihat semua RT di RW-nya
      let data = await getRows('Sensus');
      if (user.role !== 'rw_admin') {
        data = data.filter(d => d.id_rt === user.id_rt);
      } else {
        const rtList = await getRows('RT', rt => rt.id_rw === user.id_rw);
        const rtIds = rtList.map(rt => rt.id_rt);
        data = data.filter(d => rtIds.includes(d.id_rt));
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']); // warga tidak boleh input
      const payload = req.body;
      assertScope(user, payload.id_rt, null);
      const created = await addRow('Sensus', { id_warga: crypto.randomUUID(), ...payload });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
}