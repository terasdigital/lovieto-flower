"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { useWishlistItems } from "@/hooks/use-wishlist";
import { rupiah } from "@/lib/format";

export function WishlistView() {
  const items = useWishlistItems();
  const remove = useWishlist((s) => s.remove);
  const clearAll = useWishlist((s) => s.clear);
  const addToCart = useCart((s) => s.addItem);
  const router = useRouter();

  function orderAll() {
    items.forEach((i) =>
      addToCart({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        image: i.image,
        variant: undefined, // varian dasar: harga & berat tanpa penyesuaian
        price: i.basePrice,
        weightGrams: i.weightGrams,
        qty: 1,
      })
    );
    toast.success(`${items.length} produk masuk ke keranjang`);
    router.push("/keranjang");
  }

  if (items.length === 0) {
    return (
      <Card className="p-16 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">Wishlist masih kosong</p>
          <p className="text-sm text-muted-foreground">
            Klik tombol ♡ pada produk favoritmu untuk menyimpannya di sini.
          </p>
          <Button nativeButton={false} render={<Link href="/katalog" />}>
            Jelajahi Katalog →
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} produk tersimpan
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => {
              clearAll();
              toast("Wishlist dikosongkan");
            }}
          >
            Kosongkan
          </Button>
          <Button size="sm" onClick={orderAll}>
            🛒 Pesan Semua
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.productId} className="overflow-hidden">
            <Link href={`/produk/${item.slug}`} className="block">
              <div className="relative h-40 bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    [Foto Produk]
                  </div>
                )}
              </div>
            </Link>
            <CardContent className="p-3">
              <p className="mb-1 truncate text-sm font-semibold">
                {item.name}
              </p>
              <p className="mb-3 text-sm font-bold text-primary">
                {rupiah(item.basePrice)}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    addToCart({
                      productId: item.productId,
                      slug: item.slug,
                      name: item.name,
                      image: item.image,
                      price: item.basePrice,
                      weightGrams: item.weightGrams,
                      qty: 1,
                    })
                  }
                >
                  + Keranjang
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Hapus ${item.name} dari wishlist`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    remove(item.productId);
                    toast(`${item.name} keluar dari wishlist`);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
