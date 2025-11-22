import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  images: {
    // Allow public icons to be served for manifest references
    remotePatterns: [],
  },
};

export default nextConfig;
