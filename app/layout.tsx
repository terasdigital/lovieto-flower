import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Lovieto Flower — Toko Bunga Online",
    template: "%s | Lovieto Flower",
  },
  description:
    "Pesan rangkaian bunga segar untuk momen spesial Anda. Checkout via WhatsApp tanpa login.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
