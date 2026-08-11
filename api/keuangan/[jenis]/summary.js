import { getRows } from '../../_lib/sheets.js';
import { verifyToken } from '../../_lib/auth.js';

const SHEET_MAP = { /* sama seperti di atas */ };

export default async function handler(req, res) {
  try {
    const user = verifyToken(req);
    const { jenis } = req.query;
    const sheetName = SHEET_MAP[jenis];
    let data = await getRows(sheetName);
    if (user.role !== 'rw_admin') data = data.filter(d => d.id_rt === user.id_rt || d.id_rt === 'ALL');

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