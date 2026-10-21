import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
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
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="bg-muted h-48 flex items-center justify-center relative">
          {product.images?.[0] ? (
            // sementara pakai <img>; upgrade ke next/image di pass optimasi
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-sm">[Foto Produk]</span>
          )}
          {product.is_featured && (
            <Badge className="absolute top-3 left-3">Popular</Badge>
          )}
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                {rupiah(Number(product.base_price))}
              </p>
              <span className="text-xs text-muted-foreground">
                {gram(product.weight_grams)}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
