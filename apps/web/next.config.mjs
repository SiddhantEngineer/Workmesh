/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workmesh/shared"],
  // Proxy /api requests to Hono backend during local development or production
  async rewrites() {
    const apiUrl =
      process.env.API_URL ||
      `http://localhost:${process.env.API_PORT || 3001}`;
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
