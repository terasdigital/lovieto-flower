"use client";

import { type CartItem, useCart } from "@/stores/cart";
import { useSyncExternalStore } from "react";

// Konstanta stabil — referensi tidak boleh berubah antar render
const EMPTY_ITEMS: CartItem[] = [];

/**
 * Baca items cart dengan aman untuk SSR:
 * - server render → EMPTY_ITEMS (server tidak punya localStorage)
 * - client setelah hydration → items asli dari Zustand/persist
 */
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(
    useCart.subscribe,
    () => useCart.getState().items,
    () => EMPTY_ITEMS,
  );
}
