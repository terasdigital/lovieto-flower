"use client";

import Image from "next/image";
import type { VariantInput } from "@/lib/product-input";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import Link from "next/link";

interface FormProductData {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  base_price: number;
  weight_grams: number;
  stock: number;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  images: string[] | null;
  variants: VariantInput[];
}

export function ProductForm({
  product,
  categories,
}: {
  product?: FormProductData | null;
  categories: string[];
}) {
  const isEdit = !!product;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product?.base_price ?? ""));
  const [weight, setWeight] = useState(String(product?.weight_grams ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [tags, setTags] = useState((product?.tags ?? []).join(", "));
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantInput[]>(
    product?.variants ?? [],
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Upload foto ──
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload gagal");
        setImages((prev) => [...prev, data.url]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal upload foto");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Varian rows ──
  function updateVariant(i: number, patch: Partial<VariantInput>) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    );
  }

  // ── Simpan ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      slug,
      category,
      description,
      base_price: Number(basePrice),
      weight_grams: Number(weight),
      stock: Number(stock),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: isActive,
      is_featured: isFeatured,
      images,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        price_adjustment: Number(v.price_adjustment) || 0,
        weight_adjustment: Number(v.weight_adjustment) || 0,
        stock: Number(v.stock) || 0,
      })),
    };

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/produk/${product.id}` : "/api/admin/produk",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");

      toast.success(isEdit ? "Produk diperbarui" : "Produk dibuat");
      router.push("/admin/produk");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Data utama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Produk *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. Rose Classic Bouquet"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kosongkan = otomatis dari nama"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Kategori *</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="kategori-list"
                placeholder="mis. Bouquet"
                required
              />
              <datalist id="kategori-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Harga Dasar (Rp) *</Label>
              <Input
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                inputMode="numeric"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stok</Label>
              <Input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* BERAT — field kunci untuk ongkir otomatis */}
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5 max-w-40">
                <Label>Berat (gram) *</Label>
                <Input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  inputMode="numeric"
                  placeholder="mis. 350"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ⚖ Nilai ini dipakai untuk{" "}
                <strong>otomatis menghitung ongkir</strong>. Pelanggan tidak
                bisa mengubah berat — timbang produkmu & isi sekali saja.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tags (pisahkan koma)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mawar, romantis, ulang tahun"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Aktif (tampil di katalog)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Unggulan (home page)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Foto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div
                key={url}
                className="relative size-24 rounded-lg overflow-hidden border"
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white text-xs"
                  aria-label="Hapus foto"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="size-24 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-primary"
            >
              {uploading ? "Uploading..." : "+ Foto"}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* Varian */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Varian Ukuran (opsional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tanpa varian: pelanggan beli harga & berat dasar.
            </p>
          )}
          {variants.map((v, i) => (
            <div
              key={v.id ?? `new-${i}`}
              className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end"
            >
              <div className="space-y-1">
                <Label className="text-xs">Nama (S/M/L)</Label>
                <Input
                  value={v.name}
                  onChange={(e) => updateVariant(i, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Δ Harga (Rp)</Label>
                <Input
                  value={String(v.price_adjustment)}
                  onChange={(e) =>
                    updateVariant(i, {
                      price_adjustment: Number(e.target.value) || 0,
                    })
                  }
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Δ Berat (g)</Label>
                <Input
                  value={String(v.weight_adjustment)}
                  onChange={(e) =>
                    updateVariant(i, {
                      weight_adjustment: Number(e.target.value) || 0,
                    })
                  }
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stok</Label>
                <Input
                  value={String(v.stock)}
                  onChange={(e) =>
                    updateVariant(i, { stock: Number(e.target.value) || 0 })
                  }
                  inputMode="numeric"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setVariants((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-muted-foreground hover:text-destructive px-2 py-2"
                aria-label="Hapus varian"
              >
                🗑
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  name: "",
                  price_adjustment: 0,
                  weight_adjustment: 0,
                  stock: 0,
                },
              ])
            }
          >
            + Tambah Varian
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving
            ? "Menyimpan..."
            : isEdit
              ? "Simpan Perubahan"
              : "Buat Produk"}
        </Button>
        <Button
          variant="ghost"
          type="button"
          nativeButton={true}
          onClick={() => router.push("/admin/produk")}
        >
          Batal
        </Button>
        {isEdit && (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/produk/${product.slug}`} target="_blank" />}
          >
            Lihat di Toko ↗
          </Button>
        )}
      </div>
    </form>
  );
}
