import { createClient } from "@supabase/supabase-js";

/**
 * Client ANON tanpa cookie — khusus data publik (produk & varian).
 *
 * Sengaja TIDAK membaca cookies() (bandingkan dengan supabase/server.ts):
 * fungsi yang memakai "use cache" tidak boleh menyentuh request-time API,
 * jadi query produk publik harus lewat client ini supaya hasilnya bisa
 * di-cache dan ikut ter-prerender ke static shell.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
