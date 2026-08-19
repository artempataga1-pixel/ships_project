import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  /* Кеш для тяжёлой статики.

     По умолчанию Next отдаёт файлы из public/ с «Cache-Control: public,
     max-age=0». На видео это стоит дорого: <video preload="auto"> шлёт два
     параллельных range-запроса (замер: story1/2/3 уходят по два раза в ОДНУ
     миллисекунду, оба «206 bytes=0-»), и второй, не имея права взяться из
     кеша, качает файл целиком повторно. На главной это 4 731 КБ впустую при
     каждом заходе.

     Не immutable и не год: ролики на проекте переснимают, не меняя имени
     файла (story1.mp4 переснят 18.08.2026) — вечный кеш оставил бы у людей
     старую версию. Сутки жёсткого кеша + неделя stale-while-revalidate:
     дубль уходит, повторный заход бесплатен, обновление доезжает за день. */
  async headers() {
    return [
      {
        source: '/video/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/contact-assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
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
