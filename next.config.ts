import type { NextConfig } from "next";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/auth/:path*", destination: `${apiUrl}/api/auth/:path*` }];
  },
};
export default nextConfig;
