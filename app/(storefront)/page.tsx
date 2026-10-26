import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rupiah } from "@/lib/format";
import { getFeatured } from "@/lib/products";
import { CreditCard, MessageCircle, Shield, Truck } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const featuredProducts = await getFeatured(4);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Bunga segar untuk momen spesial anda
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Pilih rangkaian bunga terbaik dari koleksi kami, pesan via
                Whatsapp tanpa perlu registrasi.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/katalog"
                  className={`${buttonVariants({ size: "lg" })}`}
                >
                  Belanja Sekarang
                </Link>
                <Link
                  href="/katalog"
                  className={`${buttonVariants({ size: "lg", variant: "ghost" })}`}
                >
                  Lihat Katalog
                </Link>
              </div>
            </div>
            <div className="bg-muted rounded-lg h-80 flex items-center justify-center">
              <span className="text-muted-foreground">[Ilustrasi Hero]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <Truck className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Pengiriman Cepat</h3>
                <p className="text-sm text-muted-foreground">
                  Same-day delivery tersedia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <CreditCard className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Ongkir Terukur</h3>
                <p className="text-sm text-muted-foreground">
                  Otomatis berdasarkan berat
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Checkout via Whatsapp</h3>
                <p className="text-sm text-muted-foreground">
                  Tanpa perlu login
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center text-center p-6">
                <Shield className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Pembayaran Aman</h3>
                <p className="text-sm text-muted-foreground">Midtrans/Xendit</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Produk Populer</h2>
            <Link className="text-primary hover:underline" href="/katalog">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/produk/${product.slug}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="bg-muted h-48 flex items-center justify-center">
                    <span className="text-muted-foreground">[Foto Produk]</span>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">
                      {rupiah(product.base_price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Promo Valentine 2026</h3>
              <p>
                Diskon 15% untuk semua bouquet premium. Berlaku sampai 14
                Februari
              </p>
            </div>
            <Link
              href="/katalog"
              className={`${buttonVariants({ variant: "secondary" })}`}
            >
              Lihat Promo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
