const BRANDS = ['Samsung', 'Apple / iPhone', 'Vivo', 'OPPO', 'Xiaomi', 'Realme', 'Others'];
const CONDITIONS = ['Grade A', 'Grade B', 'Grade C'];

const FilterSidebar = ({ filters, onFilterChange, onClear }) => {
  const set = (key, val) => onFilterChange(key, val);

  const toggleCheckbox = (key, value) => {
    set(key, filters[key] === value ? '' : value);
  };

  return (
    <aside className="filter-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 className="filter-sidebar__title" style={{ margin: 0 }}>Filters</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClear}>Clear</button>
      </div>

      {/* Category */}
      <div className="filter-section">
        <p className="filter-section__title">Category</p>
        {[
          { value: '', label: 'All' },
          { value: 'new', label: 'Brand New' },
          { value: 'secondhand', label: 'Second-hand / Ref' },
          { value: 'accessory', label: 'Accessories' },
        ].map(({ value, label }) => (
          <label key={value} className="filter-option">
            <input type="radio" name="type" checked={filters.type === value}
              onChange={() => set('type', value)} />
            <span style={{ fontSize: '0.875rem' }}>{label}</span>
          </label>
        ))}
      </div>

      {/* Brand */}
      <div className="filter-section">
        <p className="filter-section__title">Brand</p>
        {BRANDS.map((b) => (
          <label key={b} className="filter-option">
            <input type="checkbox" checked={filters.brand === b}
              onChange={() => toggleCheckbox('brand', b)} />
            <span style={{ fontSize: '0.875rem' }}>{b}</span>
          </label>
        ))}
      </div>

      {/* Condition */}
      {(filters.type === 'secondhand' || filters.type === '') && (
        <div className="filter-section">
          <p className="filter-section__title">Condition (Ref Units)</p>
          {CONDITIONS.map((c) => (
            <label key={c} className="filter-option">
              <input type="checkbox" checked={filters.condition === c}
                onChange={() => toggleCheckbox('condition', c)} />
              <span style={{ fontSize: '0.875rem' }}>{c}</span>
            </label>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="filter-section">
        <p className="filter-section__title">Price Range (₱)</p>
        <div className="price-range">
          <input className="price-input" type="number" placeholder="Min" min={0}
            value={filters.min_price} onChange={(e) => set('min_price', e.target.value)} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>–</span>
          <input className="price-input" type="number" placeholder="Max" min={0}
            value={filters.max_price} onChange={(e) => set('max_price', e.target.value)} />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
