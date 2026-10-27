"use client";

import { useSyncExternalStore } from "react";
import { useWishlist, type WishlistItem } from "@/stores/wishlist";

// Konstanta stabil untuk server snapshot (lihat pola use-cart-items)
const EMPTY: WishlistItem[] = [];

export function useWishlistItems(): WishlistItem[] {
  return useSyncExternalStore(
    useWishlist.subscribe,
    () => useWishlist.getState().items,
    () => EMPTY
  );
}

export function useWishlistCount(): number {
  return useSyncExternalStore(
    useWishlist.subscribe,
    () => useWishlist.getState().items.length,
    () => 0
  );
}

export function useIsWishlisted(productId: string): boolean {
  return useSyncExternalStore(
    useWishlist.subscribe,
    () => useWishlist.getState().items.some((i) => i.productId === productId),
    () => false
  );
}
