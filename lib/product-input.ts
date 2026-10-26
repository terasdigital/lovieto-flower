export interface VariantInput {
  id?: string; // ada = update, tidak ada = insert baru
  name: string;
  price_adjustment: number;
  weight_adjustment: number;
  stock: number;
}

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  description: string;
  base_price: number;
  weight_grams: number;
  stock: number;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  variants: VariantInput[];
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Validasi & normalisasi body dari form; kembalikan {error} atau {data} */
export function validateProductInput(raw: unknown): {
  data?: ProductInput;
  error?: string;
} {
  const b = raw as Partial<ProductInput>;

  if (!b.name?.trim()) return { error: "Nama produk wajib diisi" };
  if (!b.category?.trim()) return { error: "Kategori wajib diisi" };

  const basePrice = Number(b.base_price);
  if (!Number.isFinite(basePrice) || basePrice < 0)
    return { error: "Harga tidak valid" };

  const weight = Number(b.weight_grams);
  if (!Number.isFinite(weight) || weight <= 0)
    return { error: "Berat (gram) wajib > 0 — dipakai untuk hitung ongkir" };

  const variants = Array.isArray(b.variants) ? b.variants : [];
  for (const v of variants) {
    if (!v.name?.trim()) return { error: "Nama varian tidak boleh kosong" };
    if (!Number.isFinite(Number(v.price_adjustment)))
      return { error: `Penyesuaian harga varian "${v.name}" tidak valid` };
    if (!Number.isFinite(Number(v.weight_adjustment)))
      return { error: `Penyesuaian berat varian "${v.name}" tidak valid` };
  }
  const seen = new Set<string>();
  for (const v of variants) {
    const key = v.name.trim().toLowerCase();
    if (seen.has(key)) return { error: `Nama varian ganda: "${v.name}"` };
    seen.add(key);
  }

  return {
    data: {
      name: b.name.trim(),
      slug: b.slug?.trim() ? slugify(b.slug) : slugify(b.name),
      category: b.category.trim(),
      description: (b.description ?? "").trim(),
      base_price: basePrice,
      weight_grams: Math.round(weight),
      stock: Math.max(0, Math.floor(Number(b.stock) || 0)),
      tags: Array.isArray(b.tags)
        ? b.tags.map((t) => String(t).trim()).filter(Boolean)
        : [],
      is_active: b.is_active !== false,
      is_featured: !!b.is_featured,
      images: Array.isArray(b.images) ? b.images.filter(Boolean) : [],
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name.trim(),
        price_adjustment: Number(v.price_adjustment) || 0,
        weight_adjustment: Math.round(Number(v.weight_adjustment) || 0),
        stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      })),
    },
  };
}
