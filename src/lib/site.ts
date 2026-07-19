// Домен ещё не выбран заказчиком — до подтверждения используем адрес
// текущего Vercel-деплоя, переопределить можно через NEXT_PUBLIC_SITE_URL.
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://project-yuriki.vercel.app').replace(/\/$/, '')
