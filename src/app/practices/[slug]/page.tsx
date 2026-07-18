import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PRACTICE_AREAS } from '@/constants/content/practice'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'

interface PracticePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PRACTICE_AREAS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { slug } = await params
  const item = PRACTICE_AREAS.find((p) => p.slug === slug)
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

export default async function PracticePage({ params }: PracticePageProps) {
  const { slug } = await params
  const item = PRACTICE_AREAS.find((p) => p.slug === slug)
  if (!item) notFound()

  // Портретные кадры (10/13, 9/16) при полной ширине колонки выше левого
  // текстового блока и утягивают «Результат» вниз — им нужна явная (не max-)
  // высота, чтобы aspect-ratio считал ширину от неё, а не наоборот. Альбомные
  // кадры (3/2, 4/3) уже вписываются в колонку по высоте — их не трогаем.
  const [ratioW, ratioH] = item.imageRatio.split('/').map(Number)
  const isPortraitImage = ratioW < ratioH

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]"
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
        {/* Возврат ровно к карточке этой практики в горизонтальном коллаже.
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow. */}
        <Link
          href={`/#practice-${item.slug}`}
          className="btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          ← Все практики
        </Link>

        {/* --- Герой: слева мета+заголовок, справа фото практики --- */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Левая колонка */}
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Плашка направления — пилюля с лайм-квадратиком (как в архиве) */}
              <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
                {item.label}
                <i
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                />
              </span>
            </div>

            <h1 className="mt-8 font-heading text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.03] tracking-[-0.03em] text-[var(--color-text)]">
              {item.title}
            </h1>

            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              {item.desc}
            </p>
          </div>

          {/* Правая колонка — фото практики в рамке с лайм-полосой.
              aspect повторяет реальную пропорцию снимка (imageRatio), иначе
              object-cover обрезает портретные кадры (corporate-law, criminal-defense).
              Портретным кадрам вдобавок задаём явную высоту (свою на мобиле и
              на lg) — иначе при полной ширине колонки/экрана они значительно
              выше левого текста и утягивают «Результат» вниз; justify-self-center
              снимает grid-stretch на всех брейкпоинтах (grid остаётся
              однoколоночным и на мобиле), чтобы ширина посчиталась из
              aspect-ratio и явной высоты, а не наоборот. */}
          <div
            className={`relative aspect-[${item.imageRatio}] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] ${isPortraitImage ? 'h-[320px] justify-self-center lg:h-[420px]' : ''}`}
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 1023px) 92vw, 44vw"
              className="object-cover"
            />
            {/* Лайм-полоса у правого края + glow — тот же паттерн, что у панели кейса */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-[10%] h-[80%] w-[5px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 34px var(--color-lime-glow)' }}
            />
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
