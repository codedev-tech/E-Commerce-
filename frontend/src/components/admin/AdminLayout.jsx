import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/reports', label: 'Reports', icon: '📈' },
];

const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-text">📱 CellShop</div>
          <div className="admin-sidebar__subtitle">Admin Panel</div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Main</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav-item" style={{ marginBottom: '0.25rem' }}>
            <span className="admin-nav-item__icon">🏪</span> View Store
          </NavLink>
          <button className="admin-nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
            <span className="admin-nav-item__icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar__title">
            {NAV.find((n) => location.pathname === n.to || (!n.end && location.pathname.startsWith(n.to)))?.label || 'Admin'}
          </span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            👤 {user.name}
          </span>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
