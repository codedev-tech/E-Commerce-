import { useState, useEffect } from 'react';
import api from '../../lib/axios';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?days=${days}`);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [days]); // eslint-disable-line

  const totalRevenue = data?.dailySales?.reduce((s, d) => s + Number(d.revenue), 0) || 0;
  const totalOrders = data?.dailySales?.reduce((s, d) => s + Number(d.orders), 0) || 0;

  const typeLabel = { new: '🆕 Brand New', secondhand: '♻️ Ref Units', accessory: '🎧 Accessories' };
  const payLabel = { gcash: '💙 GCash', cod: '💵 COD', pay_in_store: '🏪 Pay in Store' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontWeight: 900, fontSize: '1.1rem' }}>📈 Sales Reports</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Period:</span>
          {[7, 30, 90].map((d) => (
            <button key={d} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDays(d)}>
              {d === 7 ? '7 days' : d === 30 ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="page-loading"><span className="spinner spinner-lg" /></div>}

      {!loading && data && (
        <>
          {/* Summary */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card primary">
              <div className="stat-card__icon">💰</div>
              <div className="stat-card__label">Total Revenue</div>
              <div className="stat-card__value">{fmt(totalRevenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">🛒</div>
              <div className="stat-card__label">Total Orders</div>
              <div className="stat-card__value">{totalOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">📦</div>
              <div className="stat-card__label">Units Sold</div>
              <div className="stat-card__value">{data.bestSellers?.reduce((s, p) => s + Number(p.units_sold), 0) || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">📊</div>
              <div className="stat-card__label">Avg Order Value</div>
              <div className="stat-card__value">{fmt(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</div>
            </div>
          </div>

          <div className="reports-grid">
            {/* Daily Sales */}
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title">Daily Revenue</span></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.dailySales.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No sales data</td></tr>
                    ) : data.dailySales.map((d) => (
                      <tr key={d.date}>
                        <td>{new Date(d.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</td>
                        <td>{d.orders}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Best Sellers */}
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title">🏆 Top Products</span></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.bestSellers.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No sales yet</td></tr>
                    ) : data.bestSellers.map((p, i) => (
                      <tr key={p.id}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <div className="admin-table__name" style={{ fontSize: '0.82rem' }}>{p.name}</div>
                          <div className="admin-table__sub">{p.brand}</div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{p.units_sold}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title">Sales by Category</span></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Category</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.categoryBreakdown.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No data</td></tr>
                    ) : data.categoryBreakdown.map((c) => (
                      <tr key={c.type}>
                        <td>{typeLabel[c.type] || c.type}</td>
                        <td>{c.orders}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="admin-card">
              <div className="admin-card__header"><span className="admin-card__title">Payment Methods</span></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Method</th><th>Count</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.paymentBreakdown.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No data</td></tr>
                    ) : data.paymentBreakdown.map((p) => (
                      <tr key={p.payment_method}>
                        <td>{payLabel[p.payment_method] || p.payment_method}</td>
                        <td style={{ fontWeight: 700 }}>{p.count}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="alert alert-error">Failed to load report data.</div>
      )}
    </div>
  );
};

export default AdminReports;
