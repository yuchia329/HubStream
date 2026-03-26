import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: `${backendUrl}/ws`,
      },
      {
        source: '/ws-p2p',
        destination: `${backendUrl}/ws-p2p`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
