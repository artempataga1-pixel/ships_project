import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'

interface CasePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return CASE_STUDIES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params
  const item = CASE_STUDIES.find((c) => c.slug === slug)
  if (!item) return {}
  return {
    title: `${item.title} — Шумская и Партнёры`,
    description: item.summary,
  }
}

/* Контурная лого-скобка — тот же декор фона, что в CasesSection/Practices
   (угловые border-рамки + три бара, ~16% opacity). */
function LogoOutline({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute hidden h-[230px] w-[230px] opacity-[0.16] lg:block ${className ?? ''}`}
    >
      <span
        className="absolute bottom-0 left-0 h-[136px] w-[86px] border-b border-l"
        style={{ borderColor: '#bfdc54' }}
      />
      <span
        className="absolute right-0 top-0 h-[136px] w-[86px] border-r border-t"
        style={{ borderColor: '#bfdc54' }}
      />
      {[76, 124, 170].map((left) => (
        <span
          key={left}
          className="absolute bottom-[66px] h-[118px] w-[28px] border"
          style={{ left, borderColor: '#bfdc54' }}
        />
      ))}
    </div>
  )
}

export default async function CaseStudyPage({ params }: CasePageProps) {
  const { slug } = await params
  const item = CASE_STUDIES.find((c) => c.slug === slug)
  if (!item) notFound()

  return (
    <main
      className="relative min-h-svh lg:min-h-dvh overflow-hidden bg-[var(--color-bg)]"
      style={{
        background:
          'radial-gradient(circle at 74% 30%, rgba(201,255,31,.09), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 58%,#f7f7f5 100%)',
      }}
    >
      <ScrollTopOnLoad />
      <CaseBackground />
      {/* --- Фоновый декор: эллиптические орбиты + лайм-точки + контурная скобка --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[560px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
        style={{ borderColor: 'rgba(201,255,31,.34)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[8deg]"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}
      />
      {[
        'left-[8%] top-[30%]',
        'right-[10%] top-[20%]',
        'left-[16%] bottom-[16%]',
        'right-[13%] bottom-[24%]',
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`pointer-events-none absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
          style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
        />
      ))}
      <LogoOutline className="right-[6%] top-[16%]" />

      <div className="relative z-10 mx-auto max-w-[1120px] px-6 pb-28 pt-36 md:pt-44">
        {/* Возврат ровно к карточке этого кейса в блоке «Кейсы».
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow. */}
        {/* scroll={false} — свой скролл к карточке делает HomeAnchorScroll на
            главной (с повторными попытками, пока раскладка не устаканится);
            встроенный hash-scroll Next.js делает это одним ранним прыжком и
            гонится с ним, из-за чего страница иногда оставалась в самом верху. */}
        <Link
          href={`/#case-${item.slug}`}
          scroll={false}
          className="btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          ← Все кейсы
        </Link>

        {/* --- Герой: слева мета+заголовок, справа панель с суммой --- */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Левая колонка */}
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Плашка категории — пилюля с лайм-квадратиком (как в архиве) */}
              <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
                {item.category}
                <i
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                />
              </span>
              <span aria-hidden className="text-[var(--color-muted)]">
                ·
              </span>
              <span className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                {item.desc}
              </span>
            </div>

            <h1 className="mt-8 font-heading text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.03] tracking-[-0.03em] text-[var(--color-text)]">
              {item.title}
            </h1>
          </div>

          {/* Правая колонка — белая панель с суммой и лайм-полосой справа */}
          <div
            className="relative flex min-h-[260px] flex-col justify-center gap-7 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-gradient-to-b from-white to-[var(--color-surface-soft)] p-8"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Мягкий лайм-glow из нижнего правого угла */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2"
              style={{
                background:
                  'radial-gradient(circle, rgba(201,255,31,.28), transparent 62%)',
              }}
            />
            {/* Лайм-полоса у правого края + glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-[10%] h-[80%] w-[5px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 34px var(--color-lime-glow)' }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                Сумма спора
              </span>
              <span className="font-heading text-base font-bold text-[var(--color-muted)]">
                {item.year}
              </span>
            </div>

            <span className="whitespace-nowrap font-heading text-[clamp(2.5rem,6vw,4.25rem)] font-black tracking-[-0.03em] text-[var(--color-text)]">
              {item.amount}
            </span>
          </div>
        </div>

        {/* --- Результат: ghost-panel с лайм-полосой слева (паттерн из About) --- */}
        <div
          className="relative mt-12 overflow-hidden rounded-[var(--radius-xl)] border p-8 md:p-11"
          style={{
            background: 'rgba(255,255,255,.64)',
            borderColor: 'rgba(255,255,255,.85)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Лайм-полоса слева + glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
            Результат
          </p>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--color-text)] md:text-xl">
            {item.summary}
          </p>
        </div>

        {/* CTA под рамкой результата — обычный <a>, не next/link: переход на
            главную с якорем на блок контактов. handleStoryAwareAnchorClick
            здесь не нужен — story-режим есть только на главной (см. отчёт
            исследования компонента Header). .btn-lime-breathe добавляет
            пульсацию свечения в покое поверх .btn-lime-fill. */}
        <a
          href="/#contacts"
          className="btn-lime-fill btn-lime-breathe mt-8 inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          Оставить заявку
        </a>
      </div>
    </main>
  )
}
