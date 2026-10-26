import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const instant = false;

export default async function EditProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [supabase, categories] = await Promise.all([
    createClient(),
    getCategories(),
  ]);

  const { data: product } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Edit: {product.name}</h1>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category,
          description: product.description,
          base_price: Number(product.base_price),
          weight_grams: product.weight_grams,
          stock: product.stock,
          tags: product.tags,
          is_active: product.is_active,
          is_featured: product.is_featured,
          images: product.images,
          variants: product.variants ?? [],
        }}
        categories={categories}
      />
    </div>
  );
}
