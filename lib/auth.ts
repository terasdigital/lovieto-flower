import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Varian non-redirect untuk API route: mengembalikan user admin atau null.
 */
export async function getAdminUser() {
  // Admin = selalu request-time. Tanpa ini, prerender shell di dev akan
  // menjalankan internals auth Supabase (yang memanggil Date.now) dan
  // memicu error "unstable value while prerendering".
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return null;
  }

  return user;
}

/**
 * Pastikan requester adalah admin (login + email cocok dengan ADMIN_EMAIL).
 * Panggil di awal setiap halaman /admin — murah dan menggandakan
 * perlindungan di balik guard proxy.ts.
 */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
