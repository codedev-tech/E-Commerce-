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

const validateProduct = [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('model').optional().trim().isLength({ max: 100 }),
  body('type').isIn(['new', 'secondhand', 'accessory']),
  body('condition').optional().isIn(['Grade A', 'Grade B', 'Grade C']),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  body('description').optional().trim(),
  body('images').optional().isArray(),
  body('is_active').optional().isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const { type, brand, condition, min_price, max_price, search, sort = 'newest', page = 1, limit = 20 } = req.query;

    const snap = await db.collection('products').where('is_active', '==', true).get();
    let products = snap.docs.map(toObj);

    if (type) products = products.filter(p => p.type === type);
    if (brand) products = products.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
    if (condition) products = products.filter(p => p.condition === condition);
    if (min_price) products = products.filter(p => p.price >= parseFloat(min_price));
    if (max_price) products = products.filter(p => p.price <= parseFloat(max_price));
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.model?.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    else products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = products.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    products = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await db.collection('products').doc(req.params.id).get();
    if (!doc.exists || !doc.data().is_active) return next(new AppError('Product not found.', 404));
    res.json({ success: true, product: toObj(doc) });
  } catch (err) {
    next(err);
  }
});

// POST /api/products (admin only)
router.post('/', verifyToken, requireAdmin, validateProduct, async (req, res, next) => {
  const { name, brand, model, type, condition, price, stock, description, images, is_active } = req.body;
  try {
    const ref = await db.collection('products').add({
      name, brand: brand || null, model: model || null,
      type, condition: condition || null,
      price: parseFloat(price), stock: parseInt(stock) || 0,
      description: description || null,
      images: Array.isArray(images) ? images : [],
      is_active: is_active !== false,
      created_at: new Date(),
    });
    const doc = await ref.get();
    res.status(201).json({ success: true, product: toObj(doc) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (admin only)
router.put('/:id', verifyToken, requireAdmin, validateProduct, async (req, res, next) => {
  try {
    const ref = db.collection('products').doc(req.params.id);
    const existing = await ref.get();
    if (!existing.exists) return next(new AppError('Product not found.', 404));

    const { name, brand, model, type, condition, price, stock, description, images, is_active } = req.body;
    await ref.update({
      name, brand: brand || null, model: model || null,
      type, condition: condition || null,
      price: parseFloat(price), stock: parseInt(stock),
      description: description || null,
      images: Array.isArray(images) ? images : [],
      is_active: is_active !== false,
    });
    const updated = await ref.get();
    res.json({ success: true, product: toObj(updated) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id (admin only — soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const ref = db.collection('products').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return next(new AppError('Product not found.', 404));
    await ref.update({ is_active: false });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
