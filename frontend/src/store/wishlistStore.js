'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items;
        if (!items.some((i) => i._id === product._id)) {
          set({ items: [product, ...items] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i._id !== productId) });
      },

      toggleWishlist: (product) => {
        const items = get().items;
        const exists = items.some((i) => i._id === product._id);
        if (exists) {
          set({ items: items.filter((i) => i._id !== product._id) });
          return false;
        } else {
          set({ items: [product, ...items] });
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    {
      name: 'weavestudio-wishlist-v1',
    }
  )
);

export default useWishlistStore;
