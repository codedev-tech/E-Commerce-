import { useNavigate } from 'react-router-dom';
import ProductImage from './ProductImage';
import useCartStore from '../store/cartStore';

const CartDrawer = ({ onClose, onLoginRequired }) => {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getTotal = useCartStore((s) => s.getTotal);
  const navigate = useNavigate();

  const total = getTotal();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="overlay" style={{ zIndex: 299 }} onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">🛒 My Cart</h2>
          <button className="btn-icon" onClick={onClose} style={{ fontSize: '1.4rem' }}>×</button>
        </div>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <div className="cart-drawer__empty-icon">🛒</div>
              <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Add some products to get started!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <ProductImage
                  src={item.product.images?.[0]}
                  name={item.product.name}
                  className="cart-item__img"
                />
                <div className="cart-item__info">
                  <p className="cart-item__name">{item.product.name}</p>
                  <p className="cart-item__price">
                    ₱{(Number(item.product.price) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="cart-item__qty">
                    <button className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, Math.min(item.quantity + 1, item.product.stock))}
                      disabled={item.quantity >= item.product.stock}>+</button>
                  </div>
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item.product.id)}>🗑</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total__amount">
                ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
