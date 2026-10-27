import { LogoutButton } from "@/components/admin/logout-button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { rupiah } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Halaman admin membaca session (request-time) → tidak bisa prerender
export const instant = false;

export const metadata = {
  title: "Admin Dashboard — Lovieto Flower",
};

interface SoldRow {
  product_name: string;
  quantity: number;
  orders: { status: string } | null;
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // ── Statistik paralel ──
  const [monthOrdersRes, pendingRes, recentRes, soldRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount, status")
      .gte("created_at", startOfMonth),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id, external_id, customer_name, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("order_items")
      .select("product_name, quantity, orders!inner(status)")
      .gte("orders.created_at", startOfMonth)
      .neq("orders.status", "cancelled"),
  ]);

  const monthOrders = monthOrdersRes.data ?? [];
  const billable = monthOrders.filter((o) => o.status !== "cancelled");
  const revenue = billable.reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrder = billable.length > 0 ? revenue / billable.length : 0;

  const topProducts = (() => {
    const map = new Map<string, number>();
    // Embedding many-to-one → objek, tapi inference tanpa schema types
    // menebak array; runtime yang menentukan, jadi cast via unknown.
    for (const row of (soldRes.data ?? []) as unknown as SoldRow[]) {
      map.set(row.product_name, (map.get(row.product_name) ?? 0) + row.quantity);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();
  const maxSold = topProducts.length > 0 ? topProducts[0][1] : 1;

  const stats: Array<{
    label: string;
    value: string;
    href: string;
    accent?: boolean;
  }> = [
    { label: "Pesanan Bulan Ini", value: String(monthOrders.length), href: "/admin/pesanan" },
    { label: "Pendapatan Bulan Ini", value: rupiah(revenue), href: "/admin/pesanan" },
    { label: "Menunggu Konfirmasi", value: String(pendingRes.count ?? 0), href: "/admin/pesanan?status=pending", accent: true },
    { label: "Rata-rata Nilai Order", value: rupiah(Math.round(avgOrder)), href: "/admin/pesanan" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Masuk sebagai: {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Kartu statistik */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className={`${s.accent && (Number(s.value) > 0) ? "border-orange-300 bg-orange-50/50" : ""} hover:shadow-md`}>
              <CardContent>
                <p className="mb-1 text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold lg:text-2xl">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pesanan terbaru */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
            <Link href="/admin/pesanan" className="text-sm text-primary hover:underline">
              Semua →
            </Link>
          </CardHeader>
          <CardContent>
            {(recentRes.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada pesanan.
              </p>
            ) : (
              <div className="divide-y">
                {(recentRes.data ?? []).map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/pesanan/${o.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-primary">
                        {o.external_id}
                      </p>
                      <p className="truncate text-sm">{o.customer_name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold">
                        {rupiah(Number(o.total_amount))}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Produk terlaris bulan ini */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏆 Terlaris Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada penjualan terhitung bulan ini.
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([name, qty]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="truncate pr-2">{name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {qty}× terjual
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.max(8, (qty / maxSold) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
