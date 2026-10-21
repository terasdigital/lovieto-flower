import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface OrderItemInput {
  productId: string;
  variant: string | null;
  qty: number;
}

interface OrderRequest {
  customerName: string;
  customerPhone: string;
  shippingDate?: string | null;
  messageText?: string | null;
  items: OrderItemInput[];
  courier: { code: string; name: string; service?: string; cost: number };
}

function generateExternalId(): string {
  const now = new Date();
  const yymmdd = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LVF-${yymmdd}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    // ── Validasi dasar ──
    if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
      return NextResponse.json(
        { error: "Nama dan nomor WhatsApp wajib diisi" },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }
    if (
      !body.courier ||
      typeof body.courier.cost !== "number" ||
      body.courier.cost < 0
    ) {
      return NextResponse.json(
        { error: "Pilih jasa pengiriman terlebih dahulu" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // ── Hitung ulang dari DB (JANGAN percaya angka dari client) ──
    let subtotal = 0;
    let totalWeight = 0;
    const orderItems: Array<{
      product_name: string;
      variant_name: string | null;
      quantity: number;
      unit_price: number;
      line_weight_grams: number;
    }> = [];

    for (const item of body.items) {
      const qty = Math.max(1, Math.floor(item.qty || 0));

      const { data: product, error: pErr } = await admin
        .from("products")
        .select("id, name, base_price, weight_grams, is_active")
        .eq("id", item.productId)
        .single();

      if (pErr || !product || !product.is_active) {
        return NextResponse.json(
          { error: "Ada produk yang tidak ditemukan / tidak aktif" },
          { status: 400 },
        );
      }

      let priceAdjust = 0;
      let weightAdjust = 0;
      let variantName: string | null = null;

      // Cocokkan varian berdasarkan product_id + nama varian
      if (item.variant) {
        const { data: variant } = await admin
          .from("variants")
          .select("name, price_adjustment, weight_adjustment")
          .eq("product_id", item.productId)
          .eq("name", item.variant)
          .maybeSingle();

        if (variant) {
          priceAdjust = Number(variant.price_adjustment) || 0;
          weightAdjust = variant.weight_adjustment || 0;
          variantName = variant.name;
        }
      }

      const unitPrice = Number(product.base_price) + priceAdjust;
      const lineWeight = (product.weight_grams + weightAdjust) * qty;

      subtotal += unitPrice * qty;
      totalWeight += lineWeight;

      orderItems.push({
        product_name: product.name,
        variant_name: variantName,
        quantity: qty,
        unit_price: unitPrice,
        line_weight_grams: lineWeight,
      });
    }
    const courierCost = body.courier.cost;
    const totalAmount = subtotal + courierCost;
    const externalId = generateExternalId();

    // ── Simpan pesanan ──
    const { data: order, error: oErr } = await admin
      .from("orders")
      .insert({
        external_id: externalId,
        customer_name: body.customerName.trim(),
        customer_phone: body.customerPhone.trim(),
        message_text: body.messageText?.trim() || null,
        shipping_date: body.shippingDate || null,
        courier_code: body.courier.code,
        courier_name: body.courier.service
          ? `${body.courier.name} ${body.courier.service}`
          : body.courier.name,
        courier_cost: courierCost,
        total_weight_grams: totalWeight,
        subtotal,
        total_amount: totalAmount,
        status: "pending",
      })
      .select("id")
      .single();

    if (oErr || !order) {
      console.error("Insert order gagal:", oErr);
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan" },
        { status: 500 },
      );
    }

    // ── Simpan detail item (snapshot harga & berat) ──
    const { error: iErr } = await admin
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    if (iErr) {
      console.error("Insert order_items gagal:", iErr);
      return NextResponse.json(
        { error: "Pesanan tersimpan tapi detail item gagal disimpan" },
        { status: 500 },
      );
    }

    // Kembalikan angka otoritatif untuk pesan WhatsApp
    return NextResponse.json({
      externalId,
      subtotal,
      courierCost,
      totalWeight,
      totalAmount,
    });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan" },
      { status: 500 },
    );
  }
}
