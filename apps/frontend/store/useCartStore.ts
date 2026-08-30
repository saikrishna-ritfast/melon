import { create } from 'zustand';
import { CartItem } from '../types';

interface EnrichedCartItem extends CartItem {
  name?: string;
  variantName?: string;
  sku?: string;
  price?: number;
  specs?: any;
  category?: { name: string; slug: string };
  stockAvailable?: number;
}

interface CartState {
  items: EnrichedCartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: (token?: string) => Promise<void>;
  addItem: (productId: string, variantId: string, quantity: number, token?: string) => Promise<void>;
  removeItem: (variantId: string, token?: string) => Promise<void>;
  clearCart: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchCart: async (token) => {
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        set({ items: data.data.items, loading: false });
      } else {
        set({ error: data.message, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (productId, variantId, quantity, token) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((item) => item.variantId === variantId);

    const newItems = [...currentItems];
    if (existingIndex > -1) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + quantity,
      };
    } else {
      newItems.push({ productId, variantId, quantity });
    }

    // Optimistically update frontend state
    set({ items: newItems });

    if (token) {
      try {
        const payload = {
          items: newItems.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        };
        await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        // Optionally refetch to get enriched metadata
        get().fetchCart(token);
      } catch (err) {
        console.error('Failed to sync cart with backend:', err);
      }
    }
  },

  removeItem: async (variantId, token) => {
    const newItems = get().items.filter((item) => item.variantId !== variantId);
    set({ items: newItems });

    if (token) {
      try {
        const payload = {
          items: newItems.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        };
        await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('Failed to sync cart with backend:', err);
      }
    }
  },

  clearCart: () => {
    set({ items: [] });
  },
}));