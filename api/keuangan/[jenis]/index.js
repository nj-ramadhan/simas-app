import { getRows, addRow } from '../../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../../_lib/auth.js';

const SHEET_MAP = {
  global: 'Keuangan_Global', sampah: 'Keuangan_Sampah', keamanan: 'Keuangan_Keamanan',
  'dana-sosial': 'Keuangan_DanaSosial', 'dana-kematian': 'Keuangan_DanaKematian',
  kompensasi: 'Keuangan_Kompensasi',
};

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    if (!sheetName) return res.status(400).json({ error: 'Jenis laporan tidak valid' });

    if (req.method === 'GET') {
      let data = await getRows(sheetName);
      if (user.role !== 'rw_admin') data = data.filter(d => d.id_rt === user.id_rt || d.id_rt === 'ALL');
      // Semua warga BISA lihat (transparansi), tapi tidak bisa tulis
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      assertScope(user, req.body.id_rt, null);
      const created = await addRow(sheetName, {
        id: crypto.randomUUID(),
        dicatat_oleh: user.id,
        created_at: new Date().toISOString(),
        ...req.body,
      });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}