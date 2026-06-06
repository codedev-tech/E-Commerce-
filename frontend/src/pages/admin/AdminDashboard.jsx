import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_PILL = {
  pending: 'status-pill status-pending',
  confirmed: 'status-pill status-confirmed',
  ready: 'status-pill status-ready',
  out_for_delivery: 'status-pill status-out_for_delivery',
  completed: 'status-pill status-completed',
  cancelled: 'status-pill status-cancelled',
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><span className="spinner spinner-lg" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { stats, lowStock, recentOrders } = data;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontWeight: 900, fontSize: '1.35rem' }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/products" className="btn btn-primary btn-sm">+ Add Product</Link>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card__icon">💰</div>
          <div className="stat-card__label">Today's Sales</div>
          <div className="stat-card__value">{fmt(stats.todaySales)}</div>
          <div className="stat-card__sub">{stats.todayOrders} order{stats.todayOrders !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">📅</div>
          <div className="stat-card__label">This Week</div>
          <div className="stat-card__value">{fmt(stats.weekSales)}</div>
          <div className="stat-card__sub">{stats.weekOrders} orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">📆</div>
          <div className="stat-card__label">This Month</div>
          <div className="stat-card__value">{fmt(stats.monthSales)}</div>
          <div className="stat-card__sub">{stats.monthOrders} orders</div>
        </div>
        <div className={`stat-card${stats.pendingOrders > 0 ? ' warning' : ''}`}>
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__label">Pending Orders</div>
          <div className="stat-card__value">{stats.pendingOrders}</div>
          <div className="stat-card__sub">{stats.pendingOrders > 0 ? 'Need attention' : 'All clear!'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">Recent Orders</span>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders yet</td></tr>
                ) : recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                    <td>{o.customer_name || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                      {o.payment_method === 'gcash' ? '💙 GCash' : o.payment_method === 'cod' ? '💵 COD' : '🏪 In Store'}
                    </td>
                    <td><span className={STATUS_PILL[o.status] || 'status-pill'}>{o.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="admin-card">
          <div className="admin-card__header">
            <span className="admin-card__title">⚠️ Low Stock</span>
            <Link to="/admin/inventory" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.5rem' }}>✅</div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>All stock levels OK</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Stock</th></tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-table__name" style={{ fontSize: '0.8rem' }}>{p.name}</div>
                        <div className="admin-table__sub">{p.brand}</div>
                      </td>
                      <td>
                        <span className={p.stock === 0 ? 'stock-out' : 'stock-low'}>
                          {p.stock === 0 ? 'Out' : p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
