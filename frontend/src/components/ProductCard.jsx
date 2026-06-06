import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductImage from './ProductImage';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const conditionBadge = (type, condition) => {
  if (type === 'new') return <span className="badge badge-new">Brand New</span>;
  if (type === 'accessory') return <span className="badge badge-accessory">Accessory</span>;
  if (condition === 'Grade A') return <span className="badge badge-grade-a">Grade A</span>;
  if (condition === 'Grade B') return <span className="badge badge-grade-b">Grade B</span>;
  if (condition === 'Grade C') return <span className="badge badge-grade-c">Grade C</span>;
  return <span className="badge badge-secondhand">Ref Unit</span>;
};

const stockBadge = (stock) => {
  if (stock === 0) return <span className="badge badge-out-of-stock">Out of Stock</span>;
  if (stock <= 3) return <span className="badge badge-low-stock">Low Stock</span>;
  return <span className="badge badge-in-stock">In Stock</span>;
};

const ProductCard = ({ product, onLoginRequired }) => {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!user) {
      if (onLoginRequired) onLoginRequired();
      return;
    }
    if (product.stock === 0) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const imageUrl = product.images?.[0] || null;

  return (
    <div className="product-card">
      <div className="product-card__img">
        <ProductImage src={imageUrl} name={product.name} />
      </div>
      <div className="product-card__body">
        <div className="product-card__badges">
          {conditionBadge(product.type, product.condition)}
          {stockBadge(product.stock)}
        </div>
        <p className="product-card__name">{product.name}</p>
        {product.brand && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.brand}</p>
        )}
        <p className="product-card__price">
          ₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="product-card__footer">
        <button
          className={`btn btn-sm btn-full ${added ? 'btn-ghost' : 'btn-primary'}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          style={{ flex: 1 }}
        >
          {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
