import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack/webpack conflict warning
  turbopack: {},
  // Disable strict mode for React Three Fiber compatibility
  reactStrictMode: false,
};

export default nextConfig;
