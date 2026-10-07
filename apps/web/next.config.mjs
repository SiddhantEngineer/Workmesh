/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workmesh/shared"],
  // Proxy /api requests to Hono backend during local development
  async rewrites() {
    const apiPort = process.env.API_PORT || 3001;
    return [
      {
        source: "/api/:path*",
        destination: `http://localhost:${apiPort}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
