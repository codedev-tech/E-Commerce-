import { useState, useEffect } from 'react';
import api from '../../lib/axios';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (search) params.append('search', search);
      const res = await api.get(`/admin/customers?${params}`);
      setCustomers(Array.isArray(res.data?.customers) ? res.data.customers : []);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card__header">
          <span className="admin-card__title">👥 Customers ({customers.length})</span>
          <div className="admin-toolbar">
            <input className="admin-search" placeholder="🔍 Search by name, email, or phone…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading && <div className="page-loading" style={{ minHeight: 200 }}><span className="spinner spinner-lg" /></div>}
        {error && <div className="alert alert-error" style={{ margin: '1rem' }}>{error}</div>}

        {!loading && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Phone</th>
                  <th>Total Orders</th><th>Total Spent</th>
                  <th>Last Order</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={7}><div className="admin-empty"><div className="admin-empty__icon">👥</div><p>No customers found</p></div></td></tr>
                ) : customers.map((c) => (
                  <tr key={c.id}>
                    <td><div className="admin-table__name">{c.name}</div></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</td>
                    <td style={{ fontSize: '0.8rem' }}>{c.phone || '—'}</td>
                    <td style={{ fontWeight: 700, textAlign: 'center' }}>{c.total_orders}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(c.total_spent)}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {c.last_order_at ? fmtDate(c.last_order_at) : 'No orders'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
