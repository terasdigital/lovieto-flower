// formatter pesan whatsapp

import type { CartItem } from "@/stores/cart";
import { rupiah } from "./format";

export interface OrderData {
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  shippingDate?: string; // ISO date string (YYYY-MM-DD)
  messageText?: string;
  courierName?: string;
  courierCost: number;
  totalWeight: number;
}

export function buildOrderMessage(order: OrderData): string {
  const {
    customerName,
    items,
    shippingDate,
    messageText,
    courierName,
    courierCost,
    totalWeight,
  } = order;

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const totalAmount = subtotal + courierCost;

  const itemLines = items
    .map((i) => {
      const lineTotal = i.price * i.qty;
      const variantStr = i.variant ? `(${i.variant})` : "";
      return `- ${i.name}${variantStr} x ${i.qty} = ${rupiah(lineTotal)}`;
    })
    .join("\n");

  const courierLine = courierName
    ? `\n ${courierName} : ${rupiah(courierCost)}`
    : "";

  const dateLine = shippingDate
    ? `\n Tanggal Kirim: ${new Date(shippingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
    : "";

  const messageLine = messageText ? `\n Pesan: ${messageText}` : "";
  const weightLine = `\n Berat Total: ${totalWeight} gram`;

  return `🌸 *LOVIETO FLOWER ORDER*

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
