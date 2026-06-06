import { useState, useEffect } from 'react';
import api from '../../lib/axios';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUSES = ['pending','confirmed','ready','out_for_delivery','completed','cancelled'];
const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', ready:'Ready for Pickup', out_for_delivery:'Out for Delivery', completed:'Completed', cancelled:'Cancelled' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('');
  const [selected, setSelected] = useState(null); // order detail modal
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (statusFilter) params.append('status', statusFilter);
      if (fulfillmentFilter) params.append('fulfillment', fulfillmentFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, fulfillmentFilter]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      fetchOrders();
      if (selected?.id === id) setSelected((o) => ({ ...o, status }));
    } catch { alert('Update failed.'); }
    finally { setUpdatingId(null); }
  };

  const markPaid = async (id) => {
    setUpdatingId(id);
    try {
      await api.put(`/orders/${id}/payment`);
      fetchOrders();
      if (selected?.id === id) setSelected((o) => ({ ...o, payment_status: 'paid' }));
    } catch { alert('Update failed.'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <span className="admin-card__title">🛒 Orders ({orders.length})</span>
          <div className="admin-card__actions">
            <div className="admin-toolbar">
              <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <select className="admin-select" value={fulfillmentFilter} onChange={(e) => setFulfillmentFilter(e.target.value)}>
                <option value="">All Fulfillment</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <div className="page-loading" style={{ minHeight: 200 }}><span className="spinner spinner-lg" /></div>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Customer</th><th>Total</th>
                  <th>Fulfillment</th><th>Payment</th><th>Pay Status</th>
                  <th>Order Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={9}><div className="admin-empty"><div className="admin-empty__icon">🛒</div><p>No orders found</p></div></td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                    <td>
                      <div className="admin-table__name">{o.customer_name}</div>
                      <div className="admin-table__sub">{o.customer_phone}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmt(o.total)}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {o.fulfillment === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {o.payment_method === 'gcash' ? '💙 GCash' : o.payment_method === 'cod' ? '💵 COD' : '🏪 In Store'}
                    </td>
                    <td>
                      <span className={`status-pill ${o.payment_status === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {o.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        disabled={updatingId === o.id}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(o)}>View</button>
                        {o.payment_status !== 'paid' && (
                          <button className="btn btn-sm" style={{ background: '#dbeafe', color: '#1d4ed8', border: '1.5px solid #93c5fd' }}
                            onClick={() => markPaid(o.id)} disabled={updatingId === o.id}>
                            {updatingId === o.id ? '…' : '✓ Paid'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="admin-modal" style={{ maxWidth: 560 }}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">Order #{selected.id}</h2>
              <button className="admin-modal__close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {[
                ['Customer', selected.customer_name],
                ['Phone', selected.customer_phone],
                ['Fulfillment', selected.fulfillment === 'pickup' ? '🏪 Store Pickup' : '🚚 Delivery'],
                ['Payment', selected.payment_method === 'gcash' ? '💙 GCash' : selected.payment_method === 'cod' ? '💵 COD' : '🏪 In Store'],
                ['Pay Status', selected.payment_status],
                ['Order Status', STATUS_LABELS[selected.status] || selected.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{value}</p>
                </div>
              ))}
            </div>

            {selected.address && (
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                📍 {selected.address}
              </div>
            )}

            {selected.items && (
              <div>
                <p style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Items</p>
                {selected.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 700 }}>₱{(Number(item.price) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, padding: '0.75rem 0 0', fontSize: '1.05rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₱{Number(selected.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {selected.payment_status !== 'paid' && (
                <button className="btn btn-primary" onClick={() => markPaid(selected.id)} disabled={updatingId === selected.id}>
                  ✓ Mark as Paid
                </button>
              )}
              <div style={{ flex: 1 }}>
                <select className="admin-select" style={{ width: '100%' }} value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)} disabled={updatingId === selected.id}>
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
