import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemState {
  productId: string;
  quantity: number;
}

interface CartStore {
  items: CartItemState[];
  addItem: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [
        { productId: 'prod-101', quantity: 2 },
        { productId: 'prod-103', quantity: 1 },
      ],

      addItem: (productId: string, quantity: number = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.productId === productId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          set({ items: updated });
        } else {
          set({ items: [...currentItems, { productId, quantity }] });
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const updated = get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i));
        set({ items: updated });
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'kafaas_cart_items',
      version: 0,
      onRehydrateStorage: () => (state) => {
        console.log('[cartStore] Rehydrated state:', state);
      },
    }
  )
);