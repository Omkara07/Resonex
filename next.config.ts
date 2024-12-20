import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**', // Matches all paths under the domain
      },
    ],
    domains: ['images.pexels.com'], // Add your allowed image domains here
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
