import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

const Navbar = ({ onLoginClick, onCartClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const itemCount = getItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo">
            <span>📱</span> CellShop
          </Link>

          <div className="navbar__links">
            <Link to="/" className={`navbar__link ${isActive('/')}`}>Home</Link>
            <Link to="/shop" className={`navbar__link ${isActive('/shop')}`}>Shop</Link>
            <a href="#about" className="navbar__link">About</a>
            <a href="#contact" className="navbar__link">Contact</a>
          </div>

          <div className="navbar__actions">
            <button className="cart-btn" onClick={onCartClick}>
              🛒 Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/account" className="btn btn-ghost btn-sm">
                  👤 {user.name?.split(' ')[0]}
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onLoginClick}>Login</button>
            )}

            <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="navbar__link">🏠 Home</Link>
        <Link to="/shop" className="navbar__link">🛍️ Shop</Link>
        <a href="#about" className="navbar__link">ℹ️ About</a>
        <a href="#contact" className="navbar__link">📞 Contact</a>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
        <button className="cart-btn" style={{ justifyContent: 'flex-start' }} onClick={() => { setMenuOpen(false); onCartClick(); }}>
          🛒 Cart {itemCount > 0 && `(${itemCount})`}
        </button>
        {user ? (
          <>
            <Link to="/account" className="navbar__link">👤 My Account</Link>
            <button className="btn btn-ghost btn-sm btn-full" onClick={logout}>Logout</button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm btn-full" onClick={() => { setMenuOpen(false); onLoginClick(); }}>Login / Register</button>
        )}
      </div>
    </>
  );
};

export default Navbar;
