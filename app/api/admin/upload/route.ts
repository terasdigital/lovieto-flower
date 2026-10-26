import { getAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 400 },
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Format harus JPEG/PNG/WebP/GIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Maksimal 5 MB — kompres dulu fotonya" },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Upload gagal:", error);
    return NextResponse.json(
      { error: "Upload ke storage gagal: " + error.message },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("product-images").getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
