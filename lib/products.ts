import { createClient } from "@/lib/supabase/server";

// ambil semua produk (dengan filter & pagination)
export async function getProducts(params?: {
  category?: string;
  q?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createClient();
  const { category, q, page = 1, limit = 12 } = params || {};

  let query = supabase
    .from("products")
    .select("*, variants(*)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (category) {
    query = query.eq("category", category);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    products: data || [],
    count: count || 0,
    page,
    limit,
  };
}

// ambil 1 produk berdasarkan slug (untuk halaman detail)
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
}

// ambil produk featured (untuk homepage)
export async function getFeatured(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, variants(*)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ambil kategori unik (untuk filter sidebar)
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true);

  if (error) throw error;
  const unique = Array.from(new Set((data || []).map((p) => p.category)));
  return unique;
}

// produk terkait: kategori sama, kecuali produk yang sedang di buka
export async function getRelatedProducts(
  category: string,
  excludeSlug: string,
  limit = 4,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .neq("slug", excludeSlug)
    .limit(limit);

  if (error) throw error;
  return data || [];
}
