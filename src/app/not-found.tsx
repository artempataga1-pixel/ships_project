import type { Metadata } from 'next'
import Link from 'next/link'

/* Страница «не найдено» — для любого несуществующего адреса и для notFound()
   на страницах кейсов, практик и партнёров. Next отдаёт её с кодом 404, так
   что поисковик видит отсутствие страницы, а человек — куда идти дальше
   (аудит 05.11.2026, раздел 13). */

export const metadata: Metadata = {
  title: 'Страница не найдена — Шумская и партнёры',
  robots: { index: false },
}

const LINKS = [
  { href: '/', label: 'На главную' },
  { href: '/cases', label: 'Кейсы' },
  { href: '/publications', label: 'Публикации' },
  { href: '/contacts', label: 'Контакты' },
]

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80svh] items-center bg-[var(--color-bg)]">
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-24 pt-28 sm:px-8">
        <p className="font-heading text-sm font-black uppercase tracking-[0.12em] text-[var(--color-lime-ink)]">
          Ошибка 404
        </p>
        <h1 className="mt-5 max-w-[18ch] font-heading text-[clamp(2.2rem,6vw,4rem)] font-black leading-[1.04] tracking-[-0.03em] text-[var(--color-text)]">
          Такой страницы на сайте нет
        </h1>
        <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-[var(--color-text)] opacity-80">
          Возможно, адрес набран с ошибкой или страница переехала. Откройте нужный раздел или
          свяжитесь с нами.
        </p>
        <nav aria-label="Разделы сайта" className="mt-10 flex flex-wrap gap-3">
          {LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-semibold ${
                i === 0
                  ? 'btn-lime-fill'
                  : 'border border-[var(--color-line)] bg-white text-[var(--color-text)] transition-colors hover:border-[var(--color-lime-ink)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
