import { useState } from 'react';
import useAuthStore from '../store/authStore';

const LoginModal = ({ onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { login, register, loading, error, clearError } = useAuthStore();

  const set = (key, val) => {
    clearError();
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.phone);
        // After register, switch to login
        setMode('login');
        setForm((f) => ({ ...f, name: '', phone: '' }));
        return;
      }
      onClose();
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>

        <h2 className="modal__title">
          {mode === 'login' ? 'Welcome back 👋' : 'Create an account'}
        </h2>
        <p className="modal__subtitle">
          {mode === 'login'
            ? 'Log in to place orders and track your purchases.'
            : 'Sign up to start shopping with us.'}
        </p>

        {error && <div className="modal__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Juan dela Cruz" required
                value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="juan@email.com" required
              value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password"
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              required minLength={mode === 'register' ? 8 : 1}
              value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" type="tel" placeholder="09XX XXX XXXX"
                value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="modal__toggle">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => { setMode('register'); clearError(); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); clearError(); }}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
