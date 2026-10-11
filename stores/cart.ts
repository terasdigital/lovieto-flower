// zustand cart store (persist ke localStorage)

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variant?: string; // nama varian (S/M/L/XL) atau undefined
  price: number; // harga per unit (based_price + price_adjustment)
  weightGrams: number; // berat per unit (weight_grams + weight_adjustment)
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty: (
    productId: string,
    variant: string | undefined,
    qty: number,
  ) => void;
  clear: () => void;
  subtotal: () => number;
  totalWeight: () => number;
  itemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === item.productId && i.variant === item.variant,
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variant === item.variant
                ? { ...i, qty: i.qty + item.qty }
                : i,
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId, variant) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variant === variant),
          ),
        });
      },

      updateQty: (productId, variant, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, variant);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variant === variant
              ? { ...i, qty }
              : i,
          ),
        });
      },

      clear: () => set({ items: [] }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      // KEY: totalWeight dihitung otomatis, user tidak input
      totalWeight: () =>
        get().items.reduce((sum, i) => sum + i.weightGrams * i.qty, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "lovieto-cart" }, // localStorage key,
  ),
);
