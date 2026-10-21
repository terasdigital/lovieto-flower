import Link from "next/link";
import CopyrightYear from "./copyright-year";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center max-md:text-center">
          <div>
            <h3 className="text-lg font-bold mb-4">Lovieto Flower</h3>
            <p className="text-sm text-muted-foreground">
              Toko bunga online dengan pengiriman cepat ke seluruh Indonesia
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Katalog</h4>
            <ul className="space-y-4-2 text-sm">
              <li>
                <Link href="/katalog?kategori=Bouquet">Bouquet</Link>
              </li>
              <li>
                <Link href="/katalog?kategori=Tanaman">Tanaman</Link>
              </li>
              <li>
                <Link href="/katalog?kategori=Bunga Potong">Bunga Potong</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#">Cara Pesan</Link>
              </li>
              <li>
                <Link href="#">Pengiriman</Link>
              </li>
              <li>
                <Link href="#">FAQ</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; <CopyrightYear /> Lovieto Flower. All rights reserved
        </div>
      </div>
    </footer>
  );
}
