const express = require('express');
const router = express.Router();
const db = require('../firebase');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.use(verifyToken, requireAdmin);

const toObj = (doc) => {
  const d = doc.data();
  const r = { id: doc.id };
  for (const [k, v] of Object.entries(d)) { r[k] = v?.toDate ? v.toDate().toISOString() : v; }
  return r;
};

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [ordersSnap, productsSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('products').where('is_active', '==', true).get(),
    ]);

    const orders = ordersSnap.docs.map(toObj);
    const products = productsSnap.docs.map(toObj);

    const notCancelled = (o) => o.status !== 'cancelled';
    const d = (v) => new Date(v);
    const sum = (arr) => arr.reduce((s, o) => s + Number(o.total), 0);

    const todayOrds = orders.filter(o => notCancelled(o) && d(o.created_at) >= startOfDay);
    const weekOrds  = orders.filter(o => notCancelled(o) && d(o.created_at) >= startOfWeek);
    const monthOrds = orders.filter(o => notCancelled(o) && d(o.created_at) >= startOfMonth);

    const lowStock = products.filter(p => (p.stock || 0) <= 3)
      .sort((a, b) => a.stock - b.stock).slice(0, 10);
    const recentOrders = orders
      .sort((a, b) => d(b.created_at) - d(a.created_at)).slice(0, 10);

    res.json({
      success: true,
      stats: {
        todaySales: sum(todayOrds), todayOrders: todayOrds.length,
        weekSales: sum(weekOrds),   weekOrders: weekOrds.length,
        monthSales: sum(monthOrds), monthOrders: monthOrds.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
      },
      lowStock,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const [usersSnap, ordersSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'customer').get(),
      db.collection('orders').get(),
    ]);

    let customers = usersSnap.docs.map(toObj);
    const orders = ordersSnap.docs.map(toObj);

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q)
      );
    }

    customers = customers.map(c => {
      const userOrders = orders.filter(o => o.user_id === c.id);
      const total_spent = userOrders.filter(o => o.payment_status === 'paid')
        .reduce((s, o) => s + Number(o.total), 0);
      const last = userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      return { ...c, total_orders: userOrders.length, total_spent, last_order_at: last?.created_at || null };
    });

    const total = customers.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    customers = customers.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({ success: true, customers, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [ordersSnap, productsSnap] = await Promise.all([
      db.collection('orders').get(),
      db.collection('products').get(),
    ]);

    const allOrders = ordersSnap.docs.map(toObj);
    const productTypes = {};
    productsSnap.docs.forEach(doc => { productTypes[doc.id] = doc.data().type; });

    const paidOrders = allOrders.filter(o =>
      o.status !== 'cancelled' && o.payment_status === 'paid' && new Date(o.created_at) >= since
    );

    // Daily sales
    const dailyMap = {};
    paidOrders.forEach(o => {
      const day = o.created_at.split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, orders: 0, revenue: 0 };
      dailyMap[day].orders++;
      dailyMap[day].revenue += Number(o.total);
    });
    const dailySales = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));

    // Best sellers
    const productMap = {};
    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (!productMap[item.product_id]) productMap[item.product_id] = { id: item.product_id, name: item.name, units_sold: 0, revenue: 0 };
        productMap[item.product_id].units_sold += item.quantity;
        productMap[item.product_id].revenue += item.quantity * item.price;
      });
    });
    const bestSellers = Object.values(productMap).sort((a, b) => b.units_sold - a.units_sold).slice(0, 10);

    // Category breakdown
    const categoryMap = {};
    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const type = productTypes[item.product_id] || 'unknown';
        if (!categoryMap[type]) categoryMap[type] = { type, orders: 0, revenue: 0 };
        categoryMap[type].orders++;
        categoryMap[type].revenue += item.quantity * item.price;
      });
    });

    // Payment breakdown
    const payMap = {};
    paidOrders.forEach(o => {
      const m = o.payment_method;
      if (!payMap[m]) payMap[m] = { payment_method: m, count: 0, revenue: 0 };
      payMap[m].count++;
      payMap[m].revenue += Number(o.total);
    });

    res.json({
      success: true,
      dailySales,
      bestSellers,
      categoryBreakdown: Object.values(categoryMap),
      paymentBreakdown: Object.values(payMap),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
