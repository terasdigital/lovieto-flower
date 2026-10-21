"use client";

import { useCartItems } from "@/hooks/use-cart-item";
import { useCart } from "@/stores/cart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { gram, rupiah } from "@/lib/format";
import { toast } from "sonner";
import { Separator } from "../ui/separator";

export function CartView() {
  const items = useCartItems();
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  // Nilai turunan dihitung saat render (bukan di dalam snapshot hook)
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + i.weightGrams * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const weightFormula = items
    .map((i) => `(${i.qty}×${i.weightGrams}g)`)
    .join(" + ");

  // ── Keadaan kosong ──
  if (items.length === 0) {
    return (
      <Card className="p-16 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-semibold">Keranjangmu masih kosong</p>
          <p className="text-sm text-muted-foreground">
            Yuk pilih bunga favoritmu, jangan lupa ada varian ukuran juga lho
          </p>
          <Button
            className="mt-2"
            nativeButton={false}
            render={<Link href="/katalog" />}
          >
            Belanja Sekarang →
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Keadaan berisi ──
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
      {/* Daftar item */}
      <Card>
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variant ?? ""}`}
            className="flex gap-4 p-4 border-b last:border-b-0"
          >
            {/* Gambar */}
            <div className="size-24 shrink-0 rounded-lg bg-muted flex items-center jusn">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">[Foto]</span>
              )}
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.name}</p>
              {item.variant && (
                <p className="text-sm text-muted-foreground">
                  Ukuran: {item.variant}
                </p>
              )}
              <p className="text-primary font-bold mt-1">
                {rupiah(item.price)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ⚖ {item.weightGrams} g/item
              </p>
            </div>

            {/* Qty & hapus */}
            <div className="flex flex-col items-end justify-between">
              <button
                type="button"
                onClick={() => {
                  removeItem(item.productId, item.variant);
                  toast(`${item.name} dihapus dari keranjang`, {
                    description: "Ongkir & total otomatis diperbarui.",
                  });
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Hapus ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="flex items-center rounded-md border">
                <button
                  type="button"
                  className="px-2.5 py-1"
                  onClick={() =>
                    updateQty(item.productId, item.variant, item.qty - 1)
                  }
                >
                  −
                </button>
                <span className="px-3 py-1 text-sm font-semibold border-x">
                  {item.qty}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1"
                  onClick={() =>
                    updateQty(item.productId, item.variant, item.qty + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Ringkasan */}
      <aside className="lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Subtotal ({totalQty} item)
              </span>
              <span className="font-semibold">{rupiah(subtotal)}</span>
            </div>

            {/* ⭐ Berat total — otomatis, rumus ditampilkan seperti wireframe */}
            <div className="rounded-md bg-muted/50 border p-3 my-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>⚖ Berat total (otomatis)</span>
                <strong className="text-foreground">{gram(totalWeight)}</strong>
              </div>
              <p className="text-xs text-muted-foreground mt-1 break-words">
                {weightFormula} = {totalWeight.toLocaleString("id-ID")} g
              </p>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between items-center">
              <span className="font-semibold">Total sementara</span>
              <span className="text-2xl font-bold text-primary">
                {rupiah(subtotal)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Ongkir ditambahkan setelah kamu pilih kota & kurir di checkout.
            </p>

            <Button
              size="lg"
              className="w-full mt-4"
              nativeButton={false}
              render={<Link href="/checkout" />}
            >
              Lanjut ke Checkout →
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-1"
              nativeButton={false}
              render={<Link href="/katalog" />}
            >
              ← Lanjut Belanja
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
