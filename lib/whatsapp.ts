// formatter pesan whatsapp

import type { CartItem } from "@/stores/cart";
import { rupiah } from "./format";

export interface OrderData {
  externalId?: string;
  customerName: string;
  items: CartItem[];
  shippingDate?: string; // ISO date string (YYYY-MM-DD)
  messageText?: string;
  courierName?: string;
  courierCost: number;
  totalWeight: number;
  totals?: { subtotal: number; totalAmount: number };
}

export function buildOrderMessage(order: OrderData): string {
  const {
    externalId,
    customerName,
    items,
    shippingDate,
    messageText,
    courierName,
    courierCost,
    totalWeight,
    totals,
  } = order;

  const subtotal =
    totals?.subtotal ?? items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalAmount = totals?.totalAmount ?? subtotal + courierCost;

  const itemLines = items
    .map((i) => {
      const lineTotal = i.price * i.qty;
      const variantStr = i.variant ? `(${i.variant})` : "";
      return `• ${i.name}${variantStr} x ${i.qty} = ${rupiah(lineTotal)}`;
    })
    .join("\n");

  const idLine = externalId ? `\n🧾 Kode Pesanan: ${externalId}` : "";
  const courierLine = courierName
    ? `\n📦 ${courierName} : ${rupiah(courierCost)}`
    : "";

  const dateLine = shippingDate
    ? `\n📅 Tanggal Kirim: ${new Date(shippingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
    : "";

  const messageLine = messageText ? `\n💬 Pesan: ${messageText}` : "";
  const weightLine = `\n⚖ Berat Total: ${totalWeight.toLocaleString("id-ID")} gram`;

  return `🌸 *LOVIETO FLOWER ORDER*${idLine}

👤 Nama: ${customerName}
💐 Pesanan:
${itemLines}${weightLine}${courierLine}
💰 Total: ${rupiah(totalAmount)}${dateLine}${messageLine}

Terima kasih! 🙏`;
}

export function buildWaLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, ""); //menghilangkan karakter non-digit dari nomor telepon
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
