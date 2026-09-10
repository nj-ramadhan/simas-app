import { getRows } from '../../_lib/sheets.js';
import { verifyToken } from '../../_lib/auth.js';

const SHEET_MAP = {
  global: 'Keuangan_Global',
  sampah: 'Keuangan_Sampah',
  keamanan: 'Keuangan_Keamanan',
  'dana-sosial': 'Keuangan_DanaSosial',
  'dana-kematian': 'Keuangan_DanaKematian',
  kompensasi: 'Keuangan_Kompensasi',
};
const LEDGER_TYPES = Object.keys(SHEET_MAP);

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    if (!sheetName) return res.status(400).json({ error: 'Jenis laporan tidak valid' });
    let data = jenis === 'global'
      ? (await Promise.all(LEDGER_TYPES.map((type) => getRows(SHEET_MAP[type])))).flat()
      : await getRows(sheetName);
    if (user.role !== 'rw_admin' && user.id_rt != null) data = data.filter(d => d.id_rt == null || Number(d.id_rt) === Number(user.id_rt));
    if (user.role === 'rw_admin' && user.id_rw != null) data = data.filter(d => d.id_rw == null || Number(d.id_rw) === Number(user.id_rw));

    const masuk = data.filter(d => d.tipe === 'masuk').reduce((s, d) => s + Number(d.jumlah), 0);
    const keluar = data.filter(d => d.tipe === 'keluar').reduce((s, d) => s + Number(d.jumlah), 0);

    res.status(200).json({
      total_masuk: masuk,
      total_keluar: keluar,
      saldo: masuk - keluar,
      jumlah_transaksi: data.length,
    });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}