import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  basePrice: number;
  weightGrams: number;
}

interface WishlistStore {
  items: WishlistItem[];
  /** Toggle favorit; return true jika jadi masuk wishlist */
  toggle: (item: WishlistItem) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set({
            items: get().items.filter((i) => i.productId !== item.productId),
          });
          return false;
        }
        set({ items: [...get().items, item] });
        return true;
      },

      remove: (productId) =>
        set({
          items: get().items.filter((i) => i.productId !== productId),
        }),

      clear: () => set({ items: [] }),
    }),
    { name: "lovieto-wishlist" }
  )
);
