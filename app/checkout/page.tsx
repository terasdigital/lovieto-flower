import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = {
  title: "Checkout — Lovieto Flower",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
