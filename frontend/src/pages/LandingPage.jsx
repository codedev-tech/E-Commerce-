import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import LoginModal from '../components/LoginModal';
import useShopStore from '../store/shopStore';

const FEATURES = [
  { icon: '📱', title: 'Brand New + Ref Units', desc: 'Grade A, B, and C ref units available — all inspected and quality-checked.' },
  { icon: '💳', title: 'GCash / COD Accepted', desc: 'Flexible payment options. GCash or cash on delivery — your choice.' },
  { icon: '🚚', title: 'Pickup or Delivery', desc: 'Same-day pickup available at our store. We also deliver to your door.' },
  { icon: '🛡️', title: 'Warranty Included', desc: 'All brand new units come with official warranty. Ref units include shop warranty.' },
];

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const { featuredProducts, fetchFeatured } = useShopStore();

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);

  // Placeholder products for when API is not connected yet
  const DEMO_PRODUCTS = [
    { id: 1, name: 'Samsung Galaxy A55', brand: 'Samsung', type: 'new', condition: null, price: 18990, stock: 5, images: [] },
    { id: 2, name: 'iPhone 15 (128GB)', brand: 'Apple', type: 'new', condition: null, price: 49995, stock: 2, images: [] },
    { id: 3, name: 'Vivo Y35 (Ref)', brand: 'Vivo', type: 'secondhand', condition: 'Grade A', price: 7500, stock: 3, images: [] },
    { id: 4, name: 'Phone Case Bundle', brand: null, type: 'accessory', condition: null, price: 299, stock: 20, images: [] },
  ];

  const displayProducts = (featuredProducts?.length ?? 0) > 0 ? featuredProducts : DEMO_PRODUCTS;

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <p className="hero__eyebrow">📱 Philippines' Trusted Cellphone Shop</p>
            <h1 className="hero__title">
              Your Next Phone<br /><em>Starts Here</em>
            </h1>
            <p className="hero__subtitle">
              Brand new, ref units, and accessories — all with warranty.<br />
              GCash accepted · Pickup or delivery available.
            </p>
            <div className="hero__ctas">
              <Link to="/shop" className="btn btn-primary btn-lg">Shop Now →</Link>
              <Link to="/shop?type=secondhand" className="btn btn-outline-white btn-lg">View Ref Units</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Buy From Us?</h2>
          <p className="section-subtitle">Everything you need, all in one shop.</p>
          <div className="features__grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__text">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="featured">
        <div className="container">
          <div className="featured__header">
            <h2 className="featured__title">Latest Arrivals</h2>
            <Link to="/shop" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="products-grid">
            {displayProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onLoginRequired={() => setShowLogin(true)} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── MODALS / DRAWERS ── */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} onLoginRequired={() => { setShowCart(false); setShowLogin(true); }} />}
    </div>
  );
};

export default LandingPage;
