import { getRows, addRow } from '../../_lib/sheets.js';
import { verifyToken, requireRole, assertScope } from '../../_lib/auth.js';

const SHEET_MAP = {
  global: 'Keuangan_Global', sampah: 'Keuangan_Sampah', keamanan: 'Keuangan_Keamanan',
  'dana-sosial': 'Keuangan_DanaSosial', 'dana-kematian': 'Keuangan_DanaKematian',
  kompensasi: 'Keuangan_Kompensasi',
};
const LEDGER_TYPES = Object.keys(SHEET_MAP);

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    if (!sheetName) return res.status(400).json({ error: 'Jenis laporan tidak valid' });

    if (req.method === 'GET') {
      let data = jenis === 'global'
        ? (await Promise.all(LEDGER_TYPES.map(async (type) => (await getRows(SHEET_MAP[type])).map((row) => ({ ...row, sumber: type })))))
          .flat()
        : await getRows(sheetName);
      if (user.role !== 'rw_admin' && user.id_rt != null) data = data.filter(d => d.id_rt == null || Number(d.id_rt) === Number(user.id_rt));
      if (user.role === 'rw_admin' && user.id_rw != null) data = data.filter(d => d.id_rw == null || Number(d.id_rw) === Number(user.id_rw));
      // Semua warga BISA lihat (transparansi), tapi tidak bisa tulis
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      requireRole(user, ['rt_admin', 'rw_admin']);
      assertScope(user, req.body.id_rt, req.body.id_rw);
      const created = await addRow(sheetName, {
        id: crypto.randomUUID(),
        dicatat_oleh: user.id,
        created_at: new Date().toISOString(),
        ...req.body,
        id_rw: req.body.id_rw === '' ? null : req.body.id_rw,
        id_rt: req.body.id_rt === '' || req.body.id_rt === 'ALL' ? null : req.body.id_rt,
      });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: 'Method tidak diizinkan' });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}