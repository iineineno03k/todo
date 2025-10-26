import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone build for Docker optimization
  output: 'standalone',
};

export default nextConfig;
