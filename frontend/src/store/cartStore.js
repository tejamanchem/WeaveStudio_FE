'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      giftWrap: false,
      giftNote: '',

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      setGiftWrap: (val) => set({ giftWrap: val }),
      setGiftNote: (note) => set({ giftNote: note }),

      addItem: (product) => {
        const items = get().items;
        const existing = items.find((item) => item._id === product._id);

        if (existing) {
          set({
            items: items.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item._id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], giftWrap: false, giftNote: '' }),

      getTotal: () => {
        const itemsTotal = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const giftWrapFee = get().giftWrap ? 49 : 0;
        return itemsTotal + giftWrapFee;
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'weavestudio-cart-v1',
      partialize: (state) => ({
        items: state.items,
        giftWrap: state.giftWrap,
        giftNote: state.giftNote,
      }),
    }
  )
);

export default useCartStore;
