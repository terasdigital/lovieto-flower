"use client";

import { rupiah } from "@/lib/format";
import { useCart } from "@/stores/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface Variant {
  id: string;
  name: string;
  price_adjustment: number;
  weight_adjustment: number;
  stock: number;
}

interface ProductPurchaseProps {
  product: {
    id: string;
    slug: string;
    name: string;
    base_price: number;
    weight_grams: number;
    images: string[] | null;
  };
  variants: Variant[];
}

export function ProductPurchase({ product, variants }: ProductPurchaseProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants[0] ?? null,
  );
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const router = useRouter();

  // Harga & berat final = produk + penyesuaian varian
  const price =
    Number(product.base_price) + Number(selectedVariant?.price_adjustment ?? 0);
  const weightGrams =
    product.weight_grams + (selectedVariant?.weight_adjustment ?? 0);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0],
      variant: selectedVariant?.name,
      price,
      weightGrams,
      qty,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  }

  return (
    <div>
      {/* Pilihan varian */}
      {variants.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold mb-2">Ukuran:</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  selectedVariant?.id === v.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary"
                }`}
              >
                {v.name}
                {Number(v.price_adjustment) > 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    +{rupiah(Number(v.price_adjustment))}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Berat & harga — read only, dihitung sistem */}
      <div className="rounded-md bg-muted/50 border p-3 mb-4 text-sm text-muted-foreground">
        ⚖ Berat: <strong>{weightGrams} g</strong> (otomatis untuk ongkir)
        <span className="mx-2">•</span> Harga satuan:{" "}
        <strong className="text-primary">{rupiah(price)}</strong>
      </div>

      {/* Qty + add to cart */}
      <div className="flex gap-3 items-center">
        <div className="flex items-center rounded-md border">
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => Math.max(1, n - 1))}
          >
            −
          </button>
          <span className="px-4 py-2 font-semibold border-x">{qty}</span>
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQty((n) => n + 1)}
          >
            +
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={handleAdd}>
          + Keranjang
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full mt-3"
        onClick={() => router.push("/keranjang")}
      >
        Lihat Keranjang →
      </Button>
    </div>
  );
}
