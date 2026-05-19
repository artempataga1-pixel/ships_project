import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "static-maps.yandex.ru" },
    ],
  },
};

export default nextConfig;
