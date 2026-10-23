import { getAdminUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Gerbang 1: pastikan admin (proxy.ts sudah menjaga, ini lapis kedua)
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const status = body.status;
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json(
      { error: "Status tidak dikenal" },
      { status: 400 },
    );
  }

  // Gerbang 2: RLS — update hanya jalan untuk role authenticated
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    console.error("Update status gagal:", error);
    return NextResponse.json(
      {
        error: "Gagal mengubah status (pesanan tidak ditemukan / ditolak RLS)",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, status: data.status });
}
