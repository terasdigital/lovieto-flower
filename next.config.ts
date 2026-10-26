import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      // foto produk dari Supabase Storage (https://<ref>.supabase.co/...)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
