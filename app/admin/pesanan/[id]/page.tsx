import { OrderStatusControl } from "@/components/admin/order-status-control";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { gram, rupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

interface OrderItemRow {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number | string; // NUMERIC dari Postgres bisa string
  line_weight_grams: number;
}

export const instant = false;

export default async function PesananDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/admin/pesanan" className="hover:underline">
              ← Semua Pesanan
            </Link>
          </p>
          <h1 className="text-2xl font-bold font-mono mt-1">
            {order.external_id}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        {/* Status control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubah Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusControl orderId={order.id} current={order.status} />
          </CardContent>
        </Card>

        {/* Pelanggan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pelanggan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <strong>{order.customer_name}</strong>
            </p>
            <p className="text-muted-foreground">
              📱 {order.customer_phone} • Pesan{" "}
              {new Date(order.created_at).toLocaleString("id-ID")}
            </p>
            {order.shipping_date && (
              <p className="text-muted-foreground">
                📅 Tgl kirim diminta: {order.shipping_date}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Item pesanan (snapshot saat order) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Item Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2">Produk</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Harga</th>
                  <th className="py-2">Berat baris</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((oi: OrderItemRow) => (
                  <tr key={oi.id} className="border-b last:border-b-0">
                    <td className="py-2">
                      {oi.product_name}
                      {oi.variant_name && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({oi.variant_name})
                        </span>
                      )}
                    </td>
                    <td className="py-2">{oi.quantity}</td>
                    <td className="py-2">{rupiah(Number(oi.unit_price))}</td>
                    <td className="py-2">{oi.line_weight_grams} g</td>
                    <td className="py-2 text-right font-semibold">
                      {rupiah(Number(oi.unit_price) * oi.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Pengiriman & ringkasan biaya */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengiriman & Biaya</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{rupiah(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kurir</span>
              <span>{order.courier_name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ongkir</span>
              <span>{rupiah(Number(order.courier_cost))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Berat total</span>
              <span>{gram(order.total_weight_grams)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2 text-base">
              <span>Total</span>
              <span className="text-primary">
                {rupiah(Number(order.total_amount))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Kartu ucapan */}
        {order.message_text && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">💬 Pesan Kartu Ucapan</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="italic text-muted-foreground border-l-2 border-primary/40
                "
              >
                {order.message_text}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
