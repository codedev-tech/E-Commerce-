import { useLocation, useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import LoginModal from '../components/LoginModal';

const GCASH_NUMBER = '09XX XXX XXXX'; // Replace with real GCash number before launch

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  const order = location.state?.order;
  const paymentMethod = location.state?.paymentMethod || order?.payment_method;
  const fulfillment = location.state?.fulfillment || order?.fulfillment;

  return (
    <div>
      <Navbar onLoginClick={() => setShowLogin(true)} onCartClick={() => {}} />

      <div className="page-top">
        <div className="container" style={{ paddingBottom: '3rem' }}>
          <div className="confirmation-card">
            {/* Header */}
            <div className="confirmation-header">
              <div className="confirmation-icon">✅</div>
              <h1 className="confirmation-title">Order Placed!</h1>
              <p className="confirmation-order-id">
                Order <strong>#{id}</strong> has been received and is now pending confirmation.
              </p>
            </div>

            {/* Payment Instructions */}
            {paymentMethod === 'gcash' && (
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>💙 GCash Payment Instructions</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Please send the exact amount to our GCash number:
                </p>
                <div className="gcash-box">
                  <p className="gcash-box__title">Send to this GCash number:</p>
                  <p className="gcash-box__number">{GCASH_NUMBER}</p>
                  <p style={{ fontWeight: 700, marginTop: '0.75rem', color: 'var(--text)' }}>
                    Amount: ₱{Number(order?.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="gcash-box__note">
                    ⚠️ <strong>Important:</strong> Include your order number <strong>#{id}</strong> in the GCash reference/note field.
                    Your order will be confirmed once we verify your payment.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="info-box">
                <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>💵 Cash on Delivery</p>
                <p>Please prepare the exact amount of <strong>₱{Number(order?.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>. Pay the rider when your order arrives.</p>
              </div>
            )}

            {paymentMethod === 'pay_in_store' && (
              <div className="info-box">
                <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>🏪 Pay in Store</p>
                <p>Please bring <strong>₱{Number(order?.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong> when you pick up your order at our store.</p>
                <p style={{ marginTop: '0.5rem' }}>📍 [Store address here] · 🕐 Mon–Sat, 9AM–6PM</p>
              </div>
            )}

            {/* Fulfillment info */}
            <div className="info-box" style={{ marginTop: '1rem' }}>
              <p>
                {fulfillment === 'pickup'
                  ? '🏪 You selected store pickup. We\'ll notify you when your order is ready.'
                  : '🚚 You selected delivery. We\'ll contact you to confirm your delivery schedule.'}
              </p>
            </div>

            {/* Order items */}
            {order?.items && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Items Ordered</h3>
                {order.items.map((item, i) => (
                  <div key={i} className="order-summary-item">
                    <div>
                      <p className="order-summary-item__name">{item.name}</p>
                      <p className="order-summary-item__qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="order-summary-item__price">
                      ₱{(Number(item.price) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div className="order-total">
                  <span className="order-total__label">Total</span>
                  <span className="order-total__amount">
                    ₱{Number(order.total).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <Link to="/account" className="btn btn-outline" style={{ flex: 1 }}>📦 Track My Orders</Link>
              <Link to="/shop" className="btn btn-primary" style={{ flex: 1 }}>🛍️ Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default OrderConfirmationPage;
