// khusus API route insert pesanan (bisa tembus RLS)

import { createClient } from "@supabase/supabase-js";

// hanya boleh di pakai di server (API route / server action)
// service role key men-bypass semua RLS policy

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
