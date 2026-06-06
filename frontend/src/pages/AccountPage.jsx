import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import CartDrawer from '../components/CartDrawer';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';

const statusLabel = {
  pending: { label: 'Pending', color: '#ca8a04', bg: '#fef9c3' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#dbeafe' },
  ready: { label: 'Ready for Pickup', color: '#16a34a', bg: '#dcfce7' },
  out_for_delivery: { label: 'Out for Delivery', color: '#7c3aed', bg: '#ede9fe' },
  completed: { label: 'Completed', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
};

const AccountPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    api.get('/orders/my')
      .then((r) => setOrders(r.data.orders))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div>
        <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />
        <div className="page-top">
          <div className="container" style={{ maxWidth: 480, paddingBottom: '3rem' }}>
            <div className="checkout-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Log in to view your account and order history.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowLogin(true)}>Log In / Register</button>
            </div>
          </div>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />

      <div className="page-top">
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <div className="account-layout">
            {/* Sidebar */}
            <aside className="account-nav">
              <div style={{ padding: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700 }}>👤 {user.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
              <Link to="/account" className="account-nav__link active">📦 My Orders</Link>
              <Link to="/shop" className="account-nav__link">🛍️ Shop</Link>
              <button className="account-nav__link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                onClick={() => { logout(); navigate('/'); }}>
                🚪 Logout
              </button>
            </aside>

            {/* Main */}
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.35rem', marginBottom: '1.25rem' }}>My Orders</h2>

              {loading && <div className="page-loading"><span className="spinner spinner-lg" /></div>}
              {error && <div className="alert alert-error">{error}</div>}

              {!loading && orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📦</div>
                  <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No orders yet</p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Start shopping to see your orders here.</p>
                  <Link to="/shop" className="btn btn-primary">Browse Products</Link>
                </div>
              )}

              {orders.map((order) => {
                const status = statusLabel[order.status] || { label: order.status, color: '#64748b', bg: '#f1f5f9' };
                return (
                  <div key={order.id} className="order-history-item">
                    <div className="order-history-item__header">
                      <div>
                        <p className="order-history-item__id">Order #{order.id}</p>
                        <p className="order-history-item__date">
                          {new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: status.bg, color: status.color, padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {status.label}
                        </span>
                        <span style={{ background: order.payment_status === 'paid' ? '#dcfce7' : '#fee2e2', color: order.payment_status === 'paid' ? '#16a34a' : '#dc2626', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {order.fulfillment === 'pickup' ? '🏪 Store Pickup' : '🚚 Delivery'} ·{' '}
                        {order.payment_method === 'gcash' ? '💙 GCash' : order.payment_method === 'cod' ? '💵 COD' : '🏪 Pay in Store'}
                      </p>
                      <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                        ₱{Number(order.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </div>
  );
};

export default AccountPage;
