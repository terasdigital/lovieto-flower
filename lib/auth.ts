import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Pastikan requester adalah admin (login + email cocok dengan ADMIN_EMAIL).
 * Panggil di awal setiap halaman /admin — murah dan menggandakan
 * perlindungan di balik guard proxy.ts.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/admin/login");
  }

  return user;
}
