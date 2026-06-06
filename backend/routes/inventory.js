const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../firebase');
const AppError = require('../utils/AppError');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const toObj = (doc) => {
  const d = doc.data();
  const r = { id: doc.id };
  for (const [k, v] of Object.entries(d)) { r[k] = v?.toDate ? v.toDate().toISOString() : v; }
  return r;
};

// GET /api/inventory (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const snap = await db.collection('products').get();
    const inventory = snap.docs.map(toObj).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json({ success: true, inventory });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/stock-in (admin only)
router.post('/stock-in', verifyToken, requireAdmin, [
  body('product_id').notEmpty(),
  body('quantity').isInt({ min: 1 }),
  body('notes').optional().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
], async (req, res, next) => {
  const { product_id, quantity, notes } = req.body;
  try {
    const ref = db.collection('products').doc(product_id);
    await db.runTransaction(async (t) => {
      const doc = await t.get(ref);
      if (!doc.exists) throw new AppError('Product not found.', 404);
      t.update(ref, { stock: (doc.data().stock || 0) + parseInt(quantity) });
      t.set(db.collection('inventory_log').doc(), {
        product_id, quantity: parseInt(quantity),
        notes: notes || null, logged_by: req.user.id, created_at: new Date(),
      });
    });
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
