import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/ws',
        destination: 'http://server:4000/ws',
      },
      {
        source: '/ws-p2p',
        destination: 'http://server:4000/ws-p2p',
      },
      {
        source: '/api/:path*',
        destination: 'http://server:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
