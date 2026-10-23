import { STATUS_LABELS, StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { gram, rupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const instant = false; // baca session + DB → tidak bisa prerender

export const metadata = { title: "Pesanan" };

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const TAKE = 25;

export default async function PesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; offset?: string }>;
}) {
  await requireAdmin();
  const { status, offset } = await searchParams;
  const skip = Math.max(0, parseInt(offset || "0", 10) || 0);

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, order_items(quantity)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status && STATUSES.includes(status)) {
    query = query.eq("status", status);
  }

  const { data: orders, count } = await query.range(skip, skip + TAKE - 1);

  const total = count ?? 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Pesanan</h1>

      {/* Filter status */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/pesanan"
          className={`rounded-full px-3 py-1 text-sm ${
            !status
              ? "bg-primary text-primary-foreground font-semibold"
              : "border hover:bg-muted"
          }`}
        >
          Semua
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pesanan?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm ${
              status === s
                ? "bg-primary text-primary-foreground font-semibold"
                : "border hover:bg-muted"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {total} pesanan total
        {status ? ` (filter: ${STATUS_LABELS[status]})` : ""}
      </p>

      {!orders || orders.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foregroud">
          Belum ada pesanan.
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left [&>th]:px-3 [&>th]:py-2.5 [&>th]:font-semibold [&>th]:text-muted-foreground">
                <th>Kode</th>
                <th>Tanggal Pesan</th>
                <th>Pelanggan</th>
                <th>Item</th>
                <th>Berat</th>
                <th>Kurir</th>
                <th className="text-right">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemQty = (o.order_items ?? []).reduce(
                  (n: number, i: { quantity: number }) => n + i.quantity,
                  0,
                );
                return (
                  <tr key={o.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/pesanan/${o.id}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {o.external_id}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer_phone}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">{itemQty}</td>
                    <td className="px-3 py-2.5">
                      {gram(o.total_weight_grams)}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {o.courier_name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">
                      {rupiah(Number(o.total_amount))}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination "muat lebih banyak" */}
      {skip + TAKE < total && (
        <Link
          href={`/admin/pesanan?offset=${skip + TAKE}${
            status ? `&status=${status}` : ""
          }`}
          className="inline-block mt-4 text-sm text-primary hover:underline"
        >
          Muat lebih banyak ↓
        </Link>
      )}
    </div>
  );
}
