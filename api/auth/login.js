import bcrypt from 'bcryptjs';
import { getRows } from '../_lib/sheets.js';
import { signToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' });

  const { email, password } = req.body;
  try {
    const users = await getRows('Users', u => u.email === email);
    if (users.length === 0) return res.status(401).json({ error: 'Email atau password salah' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

    const token = signToken(user);
    const safeUser = { ...user };
    delete safeUser.password_hash;
    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}