import { getAdminUser } from "@/lib/auth";
import { validateProductInput } from "@/lib/product-input";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { data: input, error: validation } = validateProductInput(
    await request.json(),
  );
  if (validation || !input) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      category: input.category,
      description: input.description,
      base_price: input.base_price,
      weight_grams: input.weight_grams,
      stock: input.stock,
      tags: input.tags,
      is_active: input.is_active,
      is_featured: input.is_featured,
      images: input.images,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `Slug "${input.slug}" sudah dipakai produk lain` },
        { status: 400 },
      );
    }
    console.error("Insert produk gagal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan produk" },
      { status: 500 },
    );
  }

  if (input.variants.length > 0) {
    const { error: vErr } = await admin.from("variants").insert(
      input.variants.map((v) => ({
        product_id: product.id,
        name: v.name,
        price_adjustment: v.price_adjustment,
        weight_adjustment: v.weight_adjustment,
        stock: v.stock,
      })),
    );
    if (vErr) console.error("Insert variants gagal:", vErr);
  }

  return NextResponse.json({ id: product.id, slug: product.slug });
}
