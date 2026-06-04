import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Mongoose and Node-only packages out of the Edge Runtime bundle.
  // Without this, Vercel can accidentally tree-shake them into middleware.
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      }
    ]
  }
};

export default nextConfig;
