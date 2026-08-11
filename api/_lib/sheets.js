import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

let cachedDoc = null;

export async function getDoc() {
  if (cachedDoc) return cachedDoc;

  const jwt = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, jwt);
  await doc.loadInfo();
  cachedDoc = doc;
  return doc;
}

export async function getSheet(sheetName) {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) throw new Error(`Sheet "${sheetName}" tidak ditemukan`);
  return sheet;
}

// Helper generic CRUD
export async function getRows(sheetName, filterFn = null) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const data = rows.map(r => r.toObject());
  return filterFn ? data.filter(filterFn) : data;
}

export async function addRow(sheetName, rowData) {
  const sheet = await getSheet(sheetName);
  const row = await sheet.addRow(rowData);
  return row.toObject();
}

export async function updateRowById(sheetName, idField, idValue, newData) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get(idField) === String(idValue));
  if (!row) throw new Error('Data tidak ditemukan');
  Object.entries(newData).forEach(([k, v]) => row.set(k, v));
  await row.save();
  return row.toObject();
}

export async function deleteRowById(sheetName, idField, idValue) {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get(idField) === String(idValue));
  if (!row) throw new Error('Data tidak ditemukan');
  await row.delete();
  return true;
}