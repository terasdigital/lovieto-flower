import Image from "next/image";
import { ProductCard, ProductCardData } from "@/components/cards/product-card";
import { ProductPurchase } from "@/components/products/product-purchase";
import { Badge } from "@/components/ui/badge";
import { gram, rupiah } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import Link from "next/link";
import { notFound } from "next/navigation";

type VariantRow = {
  id: string;
  name: string;
  price_adjustment: number | string;
  weight_adjustment: number | null;
  stock: number | null;
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 16: params adalah Promise → wajib di-await
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const variants: VariantRow[] = product.variants ?? [];
  const related = await getRelatedProducts(product.category, product.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary">
          Beranda
        </Link>{" "}
        /{" "}
        <Link
          href={`/katalog?kategori=${encodeURIComponent(product.category)}`}
          className="hover:text-primary"
        >
          {product.category}
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Galeri */}
        <div className="relative bg-muted rounded-lg h-[480px]">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-lg object-cover"
              priority
            />
          ) : (
            <span className="text-muted-foreground">[Foto Utama Produk]</span>
          )}
        </div>

        {/* Info produk */}
        <div>
          <Badge variant="secondary" className="mb-3">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mb-4">
            {rupiah(Number(product.base_price))}
          </p>

          {/* Berat produk — read-only dari DB */}
          <div className="rounded-md bg-muted/50 border p-3 mb-4 text-sm text-muted-foreground">
            ⚖ Berat produk: <strong>{gram(product.weight_grams)}</strong> —
            otomatis dipakai untuk menghitung ongkir
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Varian + qty + add to cart (client component) */}
          <ProductPurchase
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              base_price: Number(product.base_price),
              weight_grams: product.weight_grams,
              images: product.images,
            }}
            variants={variants.map((v) => ({
              id: v.id,
              name: v.name,
              price_adjustment: Number(v.price_adjustment),
              weight_adjustment: v.weight_adjustment ?? 0,
              stock: v.stock ?? 0,
            }))}
          />
        </div>
      </div>

      {/* Produk terkait */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Produk Terkait</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p as ProductCardData} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
