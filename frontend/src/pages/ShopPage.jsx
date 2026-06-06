import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import CartDrawer from '../components/CartDrawer';
import LoginModal from '../components/LoginModal';
import useShopStore from '../store/shopStore';

const ShopPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchParams] = useSearchParams();

  const { products, loading, error, filters, setFilter, clearFilters, fetchProducts } = useShopStore();

  // Sync URL query params to filters on mount
  useEffect(() => {
    const type = searchParams.get('type');
    if (type) setFilter('type', type);
  }, []); // eslint-disable-line

  // Debounced fetch whenever filters change
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(), 350);
    return () => clearTimeout(t);
  }, [filters]); // eslint-disable-line

  const handleFilterChange = (key, value) => setFilter(key, value);

  const handleClear = () => { clearFilters(); };

  const handleSortChange = (e) => setFilter('sort', e.target.value);
  const handleSearchChange = (e) => setFilter('search', e.target.value);

  // Demo products for when API is not connected
  const DEMO = [
    { id: 1, name: 'Samsung Galaxy A55', brand: 'Samsung', type: 'new', condition: null, price: 18990, stock: 5, images: [] },
    { id: 2, name: 'iPhone 15 (128GB)', brand: 'Apple', type: 'new', condition: null, price: 49995, stock: 2, images: [] },
    { id: 3, name: 'Vivo Y35 (Ref Grade A)', brand: 'Vivo', type: 'secondhand', condition: 'Grade A', price: 7500, stock: 3, images: [] },
    { id: 4, name: 'OPPO A78 (Ref Grade B)', brand: 'OPPO', type: 'secondhand', condition: 'Grade B', price: 5800, stock: 1, images: [] },
    { id: 5, name: 'Xiaomi Redmi 13C', brand: 'Xiaomi', type: 'new', condition: null, price: 6999, stock: 8, images: [] },
    { id: 6, name: 'Realme C55 (Ref Grade A)', brand: 'Realme', type: 'secondhand', condition: 'Grade A', price: 5200, stock: 0, images: [] },
    { id: 7, name: 'Phone Case (Universal)', brand: null, type: 'accessory', condition: null, price: 199, stock: 50, images: [] },
    { id: 8, name: 'Fast Charger 65W', brand: null, type: 'accessory', condition: null, price: 799, stock: 15, images: [] },
  ];

  const displayProducts = (products?.length ?? 0) > 0 ? products : (error ? [] : DEMO);

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />

      <div className="page-top">
        <div className="container" style={{ paddingBottom: '3rem' }}>
          {/* Page Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Shop</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Browse brand new phones, ref units, and accessories.
            </p>
          </div>

          <div className="shop-layout">
            {/* Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClear}
            />

            {/* Main Content */}
            <div className="shop-main">
              {/* Toolbar */}
              <div className="shop-toolbar">
                <input
                  className="search-input"
                  type="text"
                  placeholder="🔍  Search products..."
                  value={filters.search}
                  onChange={handleSearchChange}
                />
                <select className="sort-select" value={filters.sort} onChange={handleSortChange}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>

              {/* Results count */}
              {!loading && (
                <p className="products-count" style={{ marginBottom: '1rem' }}>
                  {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found
                </p>
              )}

              {/* Loading */}
              {loading && (
                <div className="page-loading">
                  <span className="spinner spinner-lg" />
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="alert alert-error">{error}</div>
              )}

              {/* Products Grid */}
              {!loading && displayProducts.length > 0 && (
                <div className="products-grid">
                  {displayProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onLoginRequired={() => setShowLogin(true)} />
                  ))}
                </div>
              )}

              {/* No results */}
              {!loading && displayProducts.length === 0 && !error && (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No products found</p>
                  <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or search term.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={handleClear}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} onLoginRequired={() => { setShowCart(false); setShowLogin(true); }} />}
    </div>
  );
};

export default ShopPage;
