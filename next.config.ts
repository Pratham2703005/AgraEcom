import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Add other domains if needed
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/banners/new',
        destination: '/admin/banners/new',
      },
      {
        source: '/admin/brands/new',
        destination: '/admin/brands/new',
      },
      {
        source: '/admin/brands/view-all',
        destination: '/admin/brands/view-all',
      },
    ];
  },
};

export default nextConfig;
