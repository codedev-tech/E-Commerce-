import { create } from 'zustand';
import api from '../lib/axios';

const defaultFilters = {
  type: '',
  brand: '',
  condition: '',
  min_price: '',
  max_price: '',
  search: '',
  sort: 'newest',
};

const useShopStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  loading: false,
  error: null,
  filters: { ...defaultFilters },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  clearFilters: () => set({ filters: { ...defaultFilters } }),

  fetchProducts: async (overrideFilters = null) => {
    set({ loading: true, error: null });
    const filters = overrideFilters ?? get().filters;
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
      const res = await api.get(`/products?${params}`);
      set({ products: Array.isArray(res.data?.products) ? res.data.products : [], loading: false });
    } catch {
      set({ error: 'Failed to load products.', loading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const res = await api.get('/products?sort=newest&limit=4');
      set({ featuredProducts: Array.isArray(res.data?.products) ? res.data.products : [] });
    } catch {
      // silently fail for featured section
    }
  },
}));

export default useShopStore;
