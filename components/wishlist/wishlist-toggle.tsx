"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist, type WishlistItem } from "@/stores/wishlist";
import { useIsWishlisted } from "@/hooks/use-wishlist";

/**
 * Tombol hati favorit — aman dipakai di dalam kartu produk yang
 * dibungkus <Link> (preventDefault mencegah navigasi saat klik hati).
 */
export function WishlistToggle({
  item,
  className = "",
}: {
  item: WishlistItem;
  className?: string;
}) {
  const inList = useIsWishlisted(item.productId);
  const toggle = useWishlist((s) => s.toggle);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(item);
    if (added) {
      toast.success(`${item.name} disimpan ke wishlist`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={inList ? "Hapus dari wishlist" : "Simpan ke wishlist"}
      className={`flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          inList ? "fill-red-500 stroke-red-500" : "stroke-gray-400"
        }`}
      />
    </button>
  );
}
