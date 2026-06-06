const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../firebase');
const AppError = require('../utils/AppError');
const verifyToken = require('../middleware/auth');

// Firestore doc → plain object with ISO date strings
const toObj = (doc) => {
  const d = doc.data();
  const r = { id: doc.id };
  for (const [k, v] of Object.entries(d)) {
    r[k] = v?.toDate ? v.toDate().toISOString() : v;
  }
  return r;
};
const toTs = (v) => (v?.toDate ? v.toDate() : new Date(v));

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').optional().trim().isLength({ max: 20 }),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, phone } = req.body;
  try {
    const existing = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existing.empty) return next(new AppError('Email already registered.', 409));

    const password_hash = await bcrypt.hash(password, 12);
    const ref = await db.collection('users').add({
      name, email, password_hash, phone: phone || null,
      role: 'customer', created_at: new Date(),
    });
    res.status(201).json({ success: true, user: { id: ref.id, name, email, role: 'customer' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, device_id } = req.body;
  try {
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return next(new AppError('Invalid credentials.', 401));

    const userDoc = snap.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    if (!(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError('Invalid credentials.', 401));
    }

    // Enforce max 3 active sessions — revoke oldest if needed
    const now = new Date();
    const tokenSnap = await db.collection('refresh_tokens').where('user_id', '==', user.id).get();
    const active = tokenSnap.docs
      .filter(d => !d.data().is_revoked && toTs(d.data().expires_at) > now)
      .sort((a, b) => toTs(a.data().last_used_at) - toTs(b.data().last_used_at));
    if (active.length >= 3) await active[0].ref.update({ is_revoked: true });

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });
    const token_hash = await bcrypt.hash(refreshToken, 10);

    await db.collection('refresh_tokens').add({
      user_id: user.id, token_hash, device_id: device_id || null,
      last_used_at: now, expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      is_revoked: false,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError('Please log in to continue.', 401));

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const now = new Date();
    const snap = await db.collection('refresh_tokens').where('user_id', '==', decoded.id).get();
    const valid = snap.docs.filter(d => !d.data().is_revoked && toTs(d.data().expires_at) > now);

    let matchedDoc = null;
    for (const doc of valid) {
      if (await bcrypt.compare(token, doc.data().token_hash)) { matchedDoc = doc; break; }
    }
    if (!matchedDoc) return next(new AppError('Please log in to continue.', 401));

    await matchedDoc.ref.update({ last_used_at: now });
    const userDoc = await db.collection('users').doc(decoded.id).get();
    if (!userDoc.exists) return next(new AppError('User not found.', 401));
    const u = { id: userDoc.id, ...userDoc.data() };
    const accessToken = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, accessToken });
  } catch {
    return next(new AppError('Please log in to continue.', 401));
  }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
      const snap = await db.collection('refresh_tokens').where('user_id', '==', decoded.id).get();
      for (const doc of snap.docs) {
        if (!doc.data().is_revoked && await bcrypt.compare(token, doc.data().token_hash)) {
          await doc.ref.update({ is_revoked: true });
          break;
        }
      }
    } catch { /* ignore */ }
  }
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

module.exports = router;
