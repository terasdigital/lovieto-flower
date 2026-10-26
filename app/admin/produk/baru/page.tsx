import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/products";

export const instant = false;

export const metadata = { title: "Tambah Produk" };

export default async function BaruProdukPage() {
  await requireAdmin();
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tambah Produk</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
