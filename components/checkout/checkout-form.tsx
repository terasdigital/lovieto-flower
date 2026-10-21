"use client";

import { useCartItems } from "@/hooks/use-cart-item";
import { useCart } from "@/stores/cart";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { buildOrderMessage, buildWaLink } from "@/lib/whatsapp";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { gram, rupiah } from "@/lib/format";
import { Separator } from "../ui/separator";

interface ShippingRate {
  code: string;
  courier: string;
  service: string;
  cost: number;
  eta: string;
}

const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE ?? "6281200000000";

export function CheckoutForm() {
  const items = useCartItems();
  const clearCart = useCart((s) => s.clear);

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [message, setMessage] = useState("");

  // Ongkir
  const [postalCode, setPostalCode] = useState("");
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    externalId: string;
    waLink: string;
  } | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalWeight = items.reduce((s, i) => s + i.weightGrams * i.qty, 0);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const total = subtotal + (selectedRate?.cost ?? 0);

  // ── Sukses: cart sudah dikosongkan ──
  if (success) {
    return (
      <Card className="max-w-lg mx-auto p-8 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold">Pesanan Tercatat!</h2>
          <p className="text-muted-foreground">
            Kode pesanan:{" "}
            <strong className="text-foreground font-mono">
              {success.externalId}
            </strong>
          </p>
          <p className="text-sm text-muted-foreground">
            WhatsApp seharusnya sudah terbuka. Kalau belum, klik tombol di
            bawah. Setelah pesan terkirim, admin kami akan membalas untuk
            konfirmasi & pembayaran.
          </p>
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<a href={success.waLink} target="_blank" rel="noopener" />}
          >
            💬 Buka WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            nativeButton={false}
            render={<Link href="/katalog" />}
          >
            ← Belanja Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Keranjang kosong ──
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-lg font-semibold">
            Tidak ada yang bisa di-checkout
          </p>
          <p className="text-sm text-muted-foreground">
            Keranjangmu kosong. Pilih dulu produk favoritmu.
          </p>
          <Button nativeButton={false} render={<Link href="/katalog" />}>
            Ke Katalog →
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Hitung ongkir ──
  async function handleCalculateShipping() {
    if (!/^\d{5}$/.test(postalCode)) {
      toast.error("Kodepos harus 5 digit angka");
      return;
    }
    setCalculating(true);
    setShippingError(null);
    setRates(null);
    setSelectedRate(null);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationPostalCode: postalCode,
          weightGrams: totalWeight,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menghitung ongkir");
      setRates(data.rates ?? []);
      if ((data.rates ?? []).length === 0) {
        setShippingError("Tidak ada kurir tersedia untuk kodepos ini.");
      }
    } catch (err) {
      setShippingError(
        err instanceof Error ? err.message : "Gagal menghitung ongkir",
      );
    } finally {
      setCalculating(false);
    }
  }

  // ── Kirim pesanan ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Nama dan nomor WhatsApp wajib diisi");
      return;
    }
    if (!selectedRate) {
      toast.error("Pilih jasa pengiriman dulu (hitung ongkir)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          shippingDate: shippingDate || null,
          messageText: message || null,
          items: items.map((i) => ({
            productId: i.productId,
            variant: i.variant ?? null,
            qty: i.qty,
          })),
          courier: {
            code: selectedRate.code,
            name: selectedRate.courier,
            service: selectedRate.service,
            cost: selectedRate.cost,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan");

      // Pesan WhatsApp memakai angka resmi dari server
      const msg = buildOrderMessage({
        externalId: data.externalId,
        customerName: name,
        items,
        shippingDate: shippingDate || undefined,
        messageText: message || undefined,
        courierName: `${selectedRate.courier} ${selectedRate.service}`,
        courierCost: data.courierCost,
        totalWeight: data.totalWeight,
        totals: { subtotal: data.subtotal, totalAmount: data.totalAmount },
      });
      const waLink = buildWaLink(STORE_PHONE, msg);

      // Coba buka WhatsApp (popup bisa diblokir browser → ada tombol manual)
      window.open(waLink, "_blank", "noopener");

      clearCart();
      setSuccess({ externalId: data.externalId, waLink });
      toast.success("Pesanan tercatat!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  }

  // ── UI utama ──
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-6">
          {/* Info pemesan */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Informasi Pemesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">No. WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shippingDate">Tanggal Kirim (opsional)</Label>
                <Input
                  id="shippingDate"
                  type="date"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Pesan di Kartu Ucapan</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Misal: Selamat ulang tahun! ❤️"
                  maxLength={200}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ongkir */}
          <Card>
            <CardHeader>
              <CardTitle>📦 Jasa Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Berat total dihitung otomatis dari produk:{" "}
                <strong className="text-foreground">{gram(totalWeight)}</strong>
              </p>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="postal">Kodepos Tujuan *</Label>
                  <Input
                    id="postal"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="mis. 40123"
                    inputMode="numeric"
                    maxLength={5}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={handleCalculateShipping}
                  disabled={calculating}
                >
                  {calculating ? "Menghitung..." : "Hitung Ongkir →"}
                </Button>
              </div>

              {shippingError && (
                <div className="rounded-md border border-destructive/50 bg-destructivective">
                  {shippingError} — kamu tetap bisa bertanya ongkir langsung via
                  WhatsApp setelah pesan terkirim.
                </div>
              )}

              {rates && rates.length > 0 && (
                <div className="space-y-2">
                  {rates.map((rate) => (
                    <button
                      key={`${rate.code}-${rate.service}`}
                      type="button"
                      onClick={() => setSelectedRate(rate)}
                      className={`w-full flex items-center justify-between rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedRate?.code === rate.code &&
                        selectedRate?.service === rate.service
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`size-4 rounded-full border-2 flex items-center j
                            selectedRate?.code === rate.code &&
                            selectedRate?.service === rate.service
                              ? "border-primary"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selectedRate?.code === rate.code &&
                            selectedRate?.service === rate.service && (
                              <span className="size-2 rounded-full bg-primary" />
                            )}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">
                            {rate.courier}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rate.service} • {rate.eta}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-primary">
                        {rupiah(rate.cost)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ringkasan */}
        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant ?? ""}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate pr-2">
                      {item.name}
                      {item.variant ? ` (${item.variant})` : ""} × {item.qty}
                    </span>
                    <span className="font-semibold shrink-0">
                      {rupiah(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  Subtotal ({totalQty} item)
                </span>
                <span className="font-semibold">{rupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">⚖ Berat total</span>
                <span className="font-semibold">{gram(totalWeight)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Ongkir</span>
                <span className="font-semibold">
                  {selectedRate ? rupiah(selectedRate.cost) : "—"}
                </span>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {rupiah(total)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4 bg-[#25D366] hover:bg-[#20bd5a] text-white"
                disabled={submitting || !selectedRate}
              >
                {submitting ? "Memproses..." : "💬 Kirim Pesanan via WhatsApp"}
              </Button>
              {!selectedRate && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Hitung & pilih ongkir dulu untuk mengaktifkan tombol
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
