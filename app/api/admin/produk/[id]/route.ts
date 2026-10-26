import { getAdminUser } from "@/lib/auth";
import { validateProductInput } from "@/lib/product-input";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const { data: input, error: validation } = validateProductInput(
    await request.json(),
  );
  if (validation || !input) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error: uErr } = await admin
    .from("products")
    .update({
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (uErr) {
    if (uErr.code === "23505") {
      return NextResponse.json(
        { error: `Slug "${input.slug}" sudah dipakai produk lain` },
        { status: 400 },
      );
    }
    console.error("Update produk gagal:", uErr);
    return NextResponse.json(
      { error: "Gagal memperbarui produk" },
      { status: 500 },
    );
  }

  // Sinkron varian: hapus yang tidak ada di kirim, update yang ada id-nya,
  // sisipkan yang baru
  const keepIds = input.variants.filter((v) => v.id).map((v) => v.id!);

  if (keepIds.length > 0) {
    await admin
      .from("variants")
      .delete()
      .eq("product_id", id)
      .not("id", "in", keepIds.join(","));
  } else {
    await admin.from("variants").delete().eq("product_id", id);
  }

  for (const v of input.variants) {
    if (v.id) {
      await admin
        .from("variants")
        .update({
          name: v.name,
          price_adjustment: v.price_adjustment,
          weight_adjustment: v.weight_adjustment,
          stock: v.stock,
        })
        .eq("id", v.id)
        .eq("product_id", id);
    } else {
      const { error: insErr } = await admin.from("variants").insert({
        product_id: id,
        name: v.name,
        price_adjustment: v.price_adjustment,
        weight_adjustment: v.weight_adjustment,
        stock: v.stock,
      });
      if (insErr) console.error("Insert varian baru gagal:", insErr);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  // Rantai: order_items tidak merujuk varian (snapshot teks),
  // jadi hapus produk + varian (cascade) aman untuk riwayat pesanan
  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    console.error("Delete produk gagal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk (mungkin masih dirujuk data lain)" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
