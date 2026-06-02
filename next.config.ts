import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Mongoose and Node-only packages out of the Edge Runtime bundle.
  // Without this, Vercel can accidentally tree-shake them into middleware.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
