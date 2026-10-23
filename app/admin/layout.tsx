import { LogoutButton } from "@/components/admin/logout-button";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg">
              🌸 Lovieto Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/admin/pesanan"
                className="text-muted-foreground hover:text-foreground"
              >
                Pesanan
              </Link>
              <Link
                href="/admin/produk"
                className="text-muted-foreground hover:text-foreground"
              >
                Produk
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Ke Toko
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
