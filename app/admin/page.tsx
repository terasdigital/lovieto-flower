import { LogoutButton } from "@/components/admin/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";

// Halaman admin membaca session (request-time) → tidak bisa prerender
export const instant = false;

export const metadata = {
  title: "Admin Dashboard — Lovieto Flower",
};

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Masuk sebagai: {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📦 Kelola Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Lihat pesanan masuk & ubah status (Fitur 2B)
            </p>
            <Link
              href="/admin/pesanan"
              className="text-primary text-sm font-medium hover:underline"
            >
              Buka →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💐 Kelola Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Tambah/edit produk, upload foto, atur berat (Fitur 2C)
            </p>
            <Link
              href="/admin/produk"
              className="text-primary text-sm font-medium hover:underline"
            >
              Buka →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
