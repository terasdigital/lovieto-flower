import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { gram, rupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const instant = false;

export const metadata = { title: "Kelola Produk" };

export default async function ProdukAdminPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, variants(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Kelola Produk</h1>
        <Button nativeButton={false} render={<Link href="/admin/produk/baru" />}>
          + Tambah Produk
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left [&>th]:px-3 [&>th]:py-2.5 [&>th]:font-semibold [&>th]:text-muted-foreground">
              <th>Foto</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Berat</th>
              <th>Stok</th>
              <th>Varian</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  <div className="size-12 rounded bg-muted overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "—"
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {p.category}
                </td>
                <td className="px-3 py-2">{rupiah(Number(p.base_price))}</td>
                <td className="px-3 py-2">{gram(p.weight_grams)}</td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {p.variants?.[0]?.count ?? 0}
                </td>
                <td className="px-3 py-2">
                  {!p.is_active && <Badge variant="secondary">Nonaktif</Badge>}
                  {p.is_featured && <Badge>Unggulan</Badge>}
                  {p.is_active && !p.is_featured && (
                    <span className="text-xs text-muted-foreground">Aktif</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/admin/produk/${p.id}`} />}
                  >
                    Edit
                  </Button>{" "}
                  <ProductDeleteButton productId={p.id} productName={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
