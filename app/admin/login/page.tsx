import { LoginForm } from "@/components/admin/login-form";

export const metadata = {
  title: "Login Admin — Lovieto Flower",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-3xl mb-2">🌸</p>
          <h1 className="text-2xl font-bold">Lovieto Admin</h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk mengelola produk & pesanan
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
