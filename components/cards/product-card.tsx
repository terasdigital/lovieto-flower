import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { WishlistToggle } from "../wishlist/wishlist-toggle";
import { gram, rupiah } from "@/lib/format";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  base_price: number;
  weight_grams: number;
  images: string[] | null;
  is_featured: boolean;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link className="block h-full" href={`/produk/${product.slug}`}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative h-48 bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              [Foto Produk]
            </div>
          )}
          {product.is_featured && (
            <Badge className="absolute left-3 top-3">Popular</Badge>
          )}
          <WishlistToggle
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0],
              basePrice: Number(product.base_price),
              weightGrams: product.weight_grams,
            }}
            className="absolute right-3 top-3"
          />
        </div>
        <CardContent className="p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mb-2 line-clamp-1 font-semibold">{product.name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              {rupiah(Number(product.base_price))}
            </p>
            <span className="text-xs text-muted-foreground">
              {gram(product.weight_grams)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
