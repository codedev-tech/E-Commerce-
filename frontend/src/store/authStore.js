import { create } from 'zustand';
import api, { setAccessToken, clearAccessToken } from '../lib/axios';
import useCartStore from './cartStore';

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password, device_id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password, device_id });
      setAccessToken(res.data.accessToken);
      useCartStore.getState().clearCart();
      set({ user: res.data.user, loading: false });
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      set({ loading: false });
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    clearAccessToken();
    useCartStore.getState().clearCart();
    set({ user: null });
  },

  refreshUser: async () => {
    try {
      const res = await api.post('/auth/refresh');
      setAccessToken(res.data.accessToken);
      // Optionally fetch user profile here
    } catch {
      clearAccessToken();
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
