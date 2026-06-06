import { useState, useEffect } from 'react';
import api from '../../lib/axios';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState(null); // { product }
  const [form, setForm] = useState({ quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(Array.isArray(res.data?.inventory) ? res.data.inventory : []);
    } catch {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleStockIn = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/inventory/stock-in', {
        product_id: stockModal.product.id,
        quantity: parseInt(form.quantity),
        notes: form.notes,
      });
      setStockModal(null);
      setForm({ quantity: '', notes: '' });
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to log stock.');
    } finally {
      setSaving(false);
    }
  };

  const stockColor = (stock) => {
    if (stock === 0) return 'stock-out';
    if (stock <= 3) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <span className="admin-card__title">📋 Inventory ({inventory.length} products)</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click "Stock In" to log incoming units
          </span>
        </div>

        {loading && <div className="page-loading" style={{ minHeight: 200 }}><span className="spinner spinner-lg" /></div>}
        {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th><th>Type</th><th>Condition</th>
                  <th>Stock</th><th>Level</th><th>Active</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty"><div className="admin-empty__icon">📋</div><p>No products found</p></div></td></tr>
                ) : inventory.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-table__name">{p.name}</div>
                      <div className="admin-table__sub">{p.brand}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                      {p.type === 'new' ? '🆕 New' : p.type === 'secondhand' ? '♻️ Ref' : '🎧 Accessory'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.condition || '—'}</td>
                    <td style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                      <span className={stockColor(p.stock)}>{p.stock}</span>
                    </td>
                    <td>
                      <div style={{ width: 80, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, width: `${Math.min(p.stock * 10, 100)}%`, background: p.stock === 0 ? 'var(--danger)' : p.stock <= 3 ? '#eab308' : 'var(--success)' }} />
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${p.is_active ? 'status-confirmed' : 'status-cancelled'}`}>
                        {p.is_active ? 'Active' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline"
                        onClick={() => { setStockModal({ product: p }); setForm({ quantity: '', notes: '' }); }}>
                        + Stock In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock In Modal */}
      {stockModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setStockModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 420 }}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">+ Stock In</h2>
              <button className="admin-modal__close" onClick={() => setStockModal(null)}>×</button>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '0.75rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700 }}>{stockModal.product.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current stock: {stockModal.product.stock} units</p>
            </div>
            <form onSubmit={handleStockIn}>
              <div className="form-group">
                <label className="form-label">Quantity to Add *</label>
                <input className="form-input" type="number" min="1" required
                  value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  placeholder="e.g. 5" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
                <input className="form-input" value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Restocked from supplier" />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setStockModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Log Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
