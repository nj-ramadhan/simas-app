import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { id: user.id_user, role: user.role, id_rt: user.id_rt, id_rw: user.id_rw },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function verifyToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AuthError('Token tidak ada', 401);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AuthError('Token tidak valid', 401);
  }
}

export class AuthError extends Error {
  constructor(message, status = 403) {
    super(message);
    this.status = status;
  }
}

// Guard: hanya role tertentu yang boleh lanjut
export function requireRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError('Anda tidak punya akses untuk aksi ini', 403);
  }
}

// Guard: pastikan resource yang diakses ada dalam scope RT/RW milik user
export function assertScope(user, targetIdRt, targetIdRw) {
  if (user.role === 'rw_admin') {
    if (targetIdRw && targetIdRw !== user.id_rw) {
      throw new AuthError('Di luar cakupan RW Anda', 403);
    }
    return;
  }
  if (user.role === 'rt_admin' || user.role === 'warga') {
    if (targetIdRt && targetIdRt !== user.id_rt) {
      throw new AuthError('Di luar cakupan RT Anda', 403);
    }
    return;
  }
}