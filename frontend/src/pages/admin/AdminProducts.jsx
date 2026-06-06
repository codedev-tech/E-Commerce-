import { useState, useEffect } from 'react';
import ProductImage from '../../components/ProductImage';
import api from '../../lib/axios';

const EMPTY_FORM = {
  name: '', brand: '', model: '', type: 'new', condition: '',
  price: '', stock: '', description: '', images: '', is_active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', product? }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      params.append('limit', '100');
      // Admin needs to see inactive too - use a separate flag
      const res = await api.get(`/products?${params}&includeInactive=true`);
      setProducts(Array.isArray(res.data?.products) ? res.data.products : []);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [search, typeFilter]); // eslint-disable-line

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ mode: 'add' });
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      type: product.type || 'new',
      condition: product.condition || '',
      price: product.price || '',
      stock: product.stock ?? '',
      description: product.description || '',
      images: (product.images || []).join('\n'),
      is_active: product.is_active !== false,
    });
    setFormError('');
    setModal({ mode: 'edit', product });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        condition: form.type === 'secondhand' ? form.condition : null,
      };
      if (modal.mode === 'add') {
        await api.post('/products', payload);
      } else {
        await api.put(`/products/${modal.product.id}`, payload);
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      alert('Delete failed.');
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <span className="admin-card__title">📦 Products ({products.length})</span>
          <div className="admin-card__actions">
            <div className="admin-toolbar">
              <input className="admin-search" placeholder="🔍 Search products…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="new">Brand New</option>
                <option value="secondhand">Second-hand</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        {loading && <div className="page-loading" style={{ minHeight: 200 }}><span className="spinner spinner-lg" /></div>}
        {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th><th>Name / Brand</th><th>Type</th>
                  <th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty"><div className="admin-empty__icon">📦</div><p>No products found</p></div></td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    <td><ProductImage src={p.images?.[0]} name={p.name} className="admin-table__img" /></td>
                    <td>
                      <div className="admin-table__name">{p.name}</div>
                      <div className="admin-table__sub">{p.brand} {p.model}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {p.type === 'new' ? '🆕 Brand New' : p.type === 'secondhand' ? `♻️ ${p.condition || 'Ref'}` : '🎧 Accessory'}
                    </td>
                    <td style={{ fontWeight: 700 }}>₱{Number(p.price).toLocaleString('en-PH')}</td>
                    <td>
                      <span className={p.stock === 0 ? 'stock-out' : p.stock <= 3 ? 'stock-low' : 'stock-ok'}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${p.is_active ? 'status-confirmed' : 'status-cancelled'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1.5px solid var(--danger)' }}
                          onClick={() => setDeleteConfirm(p)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{modal.mode === 'add' ? '+ Add Product' : '✏️ Edit Product'}</h2>
              <button className="admin-modal__close" onClick={() => setModal(null)}>×</button>
            </div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleSave}>
              <div className="admin-form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Samsung Galaxy A55" />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input className="form-input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Samsung" />
                </div>
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input className="form-input" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. SM-A556" />
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select className="form-input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                    <option value="new">Brand New</option>
                    <option value="secondhand">Second-hand / Ref</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
                {form.type === 'secondhand' && (
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select className="form-input" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                      <option value="">Select grade</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Grade C">Grade C</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Price (₱) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="18990" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Qty *</label>
                  <input className="form-input" type="number" min="0" required value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Image URLs <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(one per line)</span></label>
                  <textarea className="form-input" rows={3} value={form.images} onChange={(e) => set('images', e.target.value)} placeholder="https://res.cloudinary.com/..." />
                  <span className="form-hint">Paste Cloudinary URLs. Leave blank to use placeholder image.</span>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Product details, specs, warranty info…" />
                </div>
                <div className="form-group full-width">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                    <span className="form-label" style={{ margin: 0 }}>Active (visible in store)</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : modal.mode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }}>
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">🗑 Remove Product</h2>
              <button className="admin-modal__close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Mark <strong>{deleteConfirm.name}</strong> as inactive? It will be hidden from the store but not permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
