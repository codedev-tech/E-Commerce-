import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoginModal from '../components/LoginModal';
import CartDrawer from '../components/CartDrawer';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import api from '../lib/axios';

const GCASH_NUMBER = '09XX XXX XXXX'; // Replace with real GCash number before launch

const CheckoutPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState(1); // 1=info, 2=fulfillment, 3=payment, 4=review

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    fulfillment: '',
    address: '',
    payment_method: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const total = getTotal();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div>
        <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />
        <div className="page-top">
          <div className="container" style={{ maxWidth: 480, paddingBottom: '3rem' }}>
            <div className="checkout-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                You need to be logged in to place an order.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowLogin(true)}>
                Log In / Register
              </button>
            </div>
          </div>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />
        <div className="page-top">
          <div className="container" style={{ maxWidth: 480, paddingBottom: '3rem' }}>
            <div className="checkout-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Your cart is empty</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add products before checking out.</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>Browse Products</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required.';
    if (!form.customer_phone.trim()) e.customer_phone = 'Phone number is required.';
    if (!form.fulfillment) e.fulfillment = 'Please select delivery or pickup.';
    if (form.fulfillment === 'delivery' && !form.address.trim()) e.address = 'Delivery address is required.';
    if (!form.payment_method) e.payment_method = 'Please select a payment method.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        fulfillment: form.fulfillment,
        address: form.fulfillment === 'delivery' ? form.address : undefined,
        payment_method: form.payment_method,
      };
      const res = await api.post('/orders', payload);
      clearCart();
      navigate(`/order/${res.data.order.id}`, { state: { order: res.data.order, paymentMethod: form.payment_method, fulfillment: form.fulfillment } });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions = form.fulfillment === 'delivery'
    ? [
        { value: 'gcash', icon: '💙', title: 'GCash', desc: 'Send exact amount after placing order. GCash number will be shown.' },
        { value: 'cod', icon: '💵', title: 'Cash on Delivery (COD)', desc: 'Pay the rider when your order arrives.' },
      ]
    : form.fulfillment === 'pickup'
    ? [
        { value: 'gcash', icon: '💙', title: 'GCash', desc: 'Send payment before coming to store. GCash number will be shown.' },
        { value: 'pay_in_store', icon: '💵', title: 'Pay in Store', desc: 'Pay cash when you pick up your order.' },
      ]
    : [];

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />

      <div className="page-top">
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1.5rem' }}>Checkout</h1>

          {serverError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{serverError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="checkout-layout">
              {/* Left column */}
              <div>
                {/* Step 1 — Customer Info */}
                <div className="checkout-card">
                  <h3 className="checkout-card__title">
                    <span>1</span> Customer Information
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className={`form-input${errors.customer_name ? ' error' : ''}`}
                      type="text" placeholder="Juan dela Cruz"
                      value={form.customer_name} onChange={(e) => setField('customer_name', e.target.value)} />
                    {errors.customer_name && <span className="form-error">{errors.customer_name}</span>}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input className={`form-input${errors.customer_phone ? ' error' : ''}`}
                      type="tel" placeholder="09XX XXX XXXX"
                      value={form.customer_phone} onChange={(e) => setField('customer_phone', e.target.value)} />
                    {errors.customer_phone && <span className="form-error">{errors.customer_phone}</span>}
                  </div>
                </div>

                {/* Step 2 — Fulfillment */}
                <div className="checkout-card">
                  <h3 className="checkout-card__title"><span>2</span> How would you like to receive your order?</h3>
                  {errors.fulfillment && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{errors.fulfillment}</div>}
                  <div className="fulfillment-options">
                    <div className={`fulfillment-option${form.fulfillment === 'delivery' ? ' selected' : ''}`}
                      onClick={() => { setField('fulfillment', 'delivery'); setField('payment_method', ''); }}>
                      <div className="fulfillment-option__title">🚚 Delivery</div>
                      <p className="fulfillment-option__desc">We deliver to your address. Delivery fee applies.</p>
                    </div>
                    <div className={`fulfillment-option${form.fulfillment === 'pickup' ? ' selected' : ''}`}
                      onClick={() => { setField('fulfillment', 'pickup'); setField('address', ''); setField('payment_method', ''); }}>
                      <div className="fulfillment-option__title">🏪 Pickup</div>
                      <p className="fulfillment-option__desc">Pick up at our store. No delivery fee.</p>
                    </div>
                  </div>

                  {form.fulfillment === 'delivery' && (
                    <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
                      <label className="form-label">Delivery Address</label>
                      <textarea className={`form-input${errors.address ? ' error' : ''}`}
                        rows={3} placeholder="Street, Barangay, City, Province"
                        value={form.address} onChange={(e) => setField('address', e.target.value)} />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                  )}

                  {form.fulfillment === 'pickup' && (
                    <div className="info-box" style={{ marginTop: '1rem' }}>
                      <p>📍 <strong>Store Address:</strong> [Your store address here]</p>
                      <p style={{ marginTop: '0.3rem' }}>🕐 <strong>Hours:</strong> Mon–Sat, 9AM–6PM</p>
                    </div>
                  )}
                </div>

                {/* Step 3 — Payment */}
                {form.fulfillment && (
                  <div className="checkout-card">
                    <h3 className="checkout-card__title"><span>3</span> Payment Method</h3>
                    {errors.payment_method && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{errors.payment_method}</div>}
                    <div className="payment-options">
                      {paymentOptions.map((opt) => (
                        <div key={opt.value}
                          className={`payment-option${form.payment_method === opt.value ? ' selected' : ''}`}
                          onClick={() => setField('payment_method', opt.value)}>
                          <span className="payment-option__icon">{opt.icon}</span>
                          <div>
                            <p className="payment-option__title">{opt.title}</p>
                            <p className="payment-option__desc">{opt.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column — Order Summary */}
              <div className="order-summary-sticky">
                <div className="checkout-card">
                  <h3 className="checkout-card__title" style={{ marginBottom: '0.75rem' }}>
                    <span>📋</span> Order Summary
                  </h3>
                  {items.map((item) => (
                    <div key={item.product.id} className="order-summary-item">
                      <div>
                        <p className="order-summary-item__name">{item.product.name}</p>
                        <p className="order-summary-item__qty">Qty: {item.quantity}</p>
                      </div>
                      <span className="order-summary-item__price">
                        ₱{(Number(item.product.price) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                  <div className="order-total">
                    <span className="order-total__label">Total</span>
                    <span className="order-total__amount">
                      ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button className="btn btn-primary btn-full btn-lg" type="submit"
                    disabled={submitting} style={{ marginTop: '1.25rem' }}>
                    {submitting ? <><span className="spinner" /> Placing Order…</> : 'Place Order →'}
                  </button>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                    By placing your order you agree to our terms and policies.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showCart && <CartDrawer onClose={() => setShowCart(false)} />}
    </div>
  );
};

export default CheckoutPage;
