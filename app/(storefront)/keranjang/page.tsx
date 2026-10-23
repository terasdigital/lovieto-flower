import { CartView } from "@/components/cart/cart-view";

export const metadata = {
  title: "Keranjang — Lovieto Flower",
};

export default function KeranjangPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1">Keranjang Belanja</h1>
      <p className="text-muted-foreground mb-6">
        Review pesananmu sebelum dikirim via WhatsApp
      </p>
      <CartView />
    </div>
  );
}
