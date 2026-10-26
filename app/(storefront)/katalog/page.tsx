import { ProductCard } from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/products";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export const metadata = {
  title: "Katalog - Lovieto Flower",
};

const PER_PAGE = 12;

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string; halaman?: string }>;
}) {
  // Next 16: searchParams adalah Promise => wajib di-await
  const { q, kategori, halaman } = await searchParams;
  const page = Math.max(1, parseInt(halaman || "1", 10) || 1);

  const [{ products, count }, categories] = await Promise.all([
    getProducts({ category: kategori, q, page, limit: PER_PAGE }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(count / PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Katalog Bunga</h1>
      <p className="text-muted-foreground mb-6">
        Temukan rangkaian bunga sempurna untuk setiap momen spesial Anda
      </p>

      {/* Search - form GET native, tanpa JS */}
      <form method="GET" className="mb-6">
        {kategori && <input type="hidden" name="kategori" value={kategori} />}
        <div className="flex gap-2 max-w-md items-center">
          <Input
            name="q"
            defaultValue={q || ""}
            placeholder="Cari bunga, bouquet, tanaman..."
            className="border rounded-lg w-3/4 p-2"
          />
          <Button type="submit">Cari</Button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar kategori */}
        <aside className="min-w-0">
          <div className="rounded-lg border bg-card p-3 md:p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-3 hidden md:block">
              Kategori
            </h2>
            <ul className="gap-2 flex md:flex-col overflow-x-auto whitespace-nowrap md:overflow-visible">
              <li>
                <Link
                  href="/katalog"
                  className={`block rounded-md px-3 py-2 text-sm ${!kategori ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
                >
                  Semua Produk
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/katalog?kategori=${encodeURIComponent(cat)}`}
                    className={`block rounded-md px-3 py-2 text-sm ${kategori === cat ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid produk */}
        <main>
          <p className="text-sm text-muted-foreground mb-4">
            Menampilkan {products.length} dari {count} produk
          </p>
          {products.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              Tidak ada produk ditemukan. Coba kata kunci lain
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product}></ProductCard>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => +1).map((p) => (
                <Link
                  key={p}
                  href={`/katalog?halaman=${p}${kategori ? `&kategori=${encodeURIComponent(kategori)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                >
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                  />
                </Link>
              ))}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
