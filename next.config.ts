import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  /* Шаг 1.5: раздел «Практики» переехал с шести выдуманных направлений на пять
     реальных практик заказчика. Старые слаги проиндексированы и могут быть в
     чужих ссылках — отдаём 301 на ближайшее по смыслу новое направление.
     Уголовная защита и IP отдельными практиками у фирмы не идут — эти два
     ведём на раздел «Практики» целиком. */
  async redirects() {
    return [
      { source: '/practices/bankruptcy', destination: '/practices/bankrotstvo', permanent: true },
      { source: '/practices/corporate-law', destination: '/practices/korporativnoe-pravo', permanent: true },
      { source: '/practices/arbitration', destination: '/practices/sudebnye-spory', permanent: true },
      { source: '/practices/tax', destination: '/practices/sudebnye-spory', permanent: true },
      { source: '/practices/criminal-defense', destination: '/#practices', permanent: true },
      { source: '/practices/ip-brands', destination: '/#practices', permanent: true },
    ]
  },
};

export default nextConfig;
