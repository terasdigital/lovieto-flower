"use client";

import { useCart } from "@/stores/cart";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "../ui/button";
import { Heart, ShoppingCart } from "lucide-react";

// Hook khusus: baca jumlah item cart dengan aman untuk SSR
// - server snapshot → selalu 0 (server tidak punya localStorage)
// - client snapshot → nilai asli dari Zustand yang sudah ter-hydrate
// React tahu dua nilai ini memang boleh beda → tidak ada hydration mismatch,
// tidak perlu useEffect/setMounted sama sekali.
function useCartItemCount() {
  return useSyncExternalStore(
    useCart.subscribe,
    () => useCart.getState().items.reduce((n, i) => n + i.qty, 0),
    () => 0,
  );
}

export function Header() {
  const itemCount = useCartItemCount();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold text-primary">
          🌸 Lovieto Flower
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Beranda
          </Link>
          <Link
            href="/katalog"
            className="text-sm font-medium hover:text-primary"
          >
            Katalog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            render={<Link href="/keranjang" className="relative" />}
            nativeButton={false}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
