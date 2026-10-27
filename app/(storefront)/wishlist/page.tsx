import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-1 text-3xl font-bold">Wishlist</h1>
      <p className="mb-6 text-muted-foreground">
        Produk favorit yang kamu simpan — tersimpan di perangkat ini saja
      </p>
      <WishlistView />
    </div>
  );
}
