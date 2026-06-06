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

const validateOrder = [
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isString().trim().notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('customer_name').trim().notEmpty().isLength({ max: 100 }),
  body('customer_phone').trim().notEmpty().isLength({ max: 20 }),
  body('fulfillment').isIn(['pickup', 'delivery']),
  body('address').custom((value, { req }) => {
    if (req.body.fulfillment === 'delivery' && !value) {
      throw new Error('Delivery address is required.');
    }
    return true;
  }),
  body('payment_method').custom((value, { req }) => {
    const allowed = { delivery: ['gcash', 'cod'], pickup: ['gcash', 'pay_in_store'] };
    if (!allowed[req.body.fulfillment]?.includes(value)) {
      throw new Error('Invalid payment method for selected fulfillment type.');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// POST /api/orders
router.post('/', verifyToken, validateOrder, async (req, res, next) => {
  const { items, customer_name, customer_phone, fulfillment, address, payment_method } = req.body;
  try {
    let orderData;
    await db.runTransaction(async (t) => {
      const productRefs = items.map(item => db.collection('products').doc(String(item.product_id)));
      const productDocs = await Promise.all(productRefs.map(ref => t.get(ref)));

      let total = 0;
      const orderItems = [];
      for (let i = 0; i < items.length; i++) {
        const doc = productDocs[i];
        if (!doc.exists || !doc.data().is_active) throw new AppError('Product not found.', 404);
        const product = doc.data();
        const qty = parseInt(items[i].quantity);
        if (product.stock < qty) throw new AppError(`Insufficient stock for ${product.name}.`, 422);
        t.update(productRefs[i], { stock: product.stock - qty });
        orderItems.push({ product_id: doc.id, name: product.name, quantity: qty, price: product.price });
        total += product.price * qty;
      }

      const orderRef = db.collection('orders').doc();
      const now = new Date();
      orderData = {
        user_id: req.user.id,
        customer_name, customer_phone,
        total, fulfillment,
        address: address || null,
        payment_method, payment_status: 'unpaid',
        status: 'pending',
        items: orderItems,
        created_at: now,
      };
      t.set(orderRef, orderData);
      orderData = { id: orderRef.id, ...orderData, created_at: now.toISOString() };
    });
    res.status(201).json({ success: true, order: orderData });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/my (customer's own orders)
router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const snap = await db.collection('orders').where('user_id', '==', req.user.id).get();
    const orders = snap.docs.map(toObj).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return next(new AppError('Order not found.', 404));
    const order = toObj(doc);
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return next(new AppError('You do not have permission to do this.', 403));
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders (admin only — all orders)
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { status, fulfillment } = req.query;
    const snap = await db.collection('orders').get();
    let orders = snap.docs.map(toObj).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (status) orders = orders.filter(o => o.status === status);
    if (fulfillment) orders = orders.filter(o => o.fulfillment === fulfillment);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', verifyToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'ready', 'out_for_delivery', 'completed', 'cancelled']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
], async (req, res, next) => {
  try {
    const ref = db.collection('orders').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return next(new AppError('Order not found.', 404));
    await ref.update({ status: req.body.status });
    res.json({ success: true, order: toObj(await ref.get()) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/payment (admin only — mark as paid)
router.put('/:id/payment', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const ref = db.collection('orders').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return next(new AppError('Order not found.', 404));
    await ref.update({ payment_status: 'paid' });
    res.json({ success: true, order: toObj(await ref.get()) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
