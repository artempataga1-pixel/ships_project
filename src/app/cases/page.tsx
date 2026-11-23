import type { Metadata } from 'next'
import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { getPracticesSorted } from '@/lib/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { WordReveal } from '@/components/ui/WordReveal'
import { BlurText } from '@/components/ui/BlurText'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CasesLibrary } from '@/components/cases/CasesLibrary'
import { byPractices } from '@/lib/ruNumbers'

/* Каталог кейсов — все дела практик карточками с фильтром по практикам.
   Блок «Кейсы» на главной теперь только переход сюда. Конструкция героя —
   как у /publications: fixed-задник, обрезанный clip-path героя. */

const INTRO = `Обезличенные описания дел ${byPractices(getPracticesSorted().length)} фирмы: отрасли, суммы и результаты.`

export const metadata: Metadata = {
  title: 'Кейсы — Шумская и партнёры',
  description: INTRO,
}

/* Та же плотная белая панель, что у вводного текста /publications */
const PANEL_STYLE = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-line)',
  boxShadow: 'var(--shadow-card)',
} as const

function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
      <div
        className="absolute left-1/2 top-1/2 h-[520px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rotate-[4deg] rounded-[50%] border"
        style={{ borderColor: 'rgba(168,204,51,.34)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[380px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-[46%] rotate-[8deg] rounded-[50%] border"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}
      />
      {/* Точки — только с xl и у самого края, как на остальных страницах */}
      {['right-[1%] top-[18%]', 'left-[1%] bottom-[14%]', 'right-[1%] bottom-[22%]'].map((pos) => (
        <span
          key={pos}
          className={`absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] xl:block`}
          style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
        />
      ))}
    </div>
  )
}

/* Практика из ?practice= читается на сервере: страница сразу приходит
   отфильтрованной. Раньше фильтр ставился эффектом после гидрации — на
   переходе с главной мелькали все дела, а «Назад» в отфильтрованный список
   сначала докручивал до места карточки в полном списке. */
export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const practices = getPracticesSorted().map((p) => ({ id: p.id, slug: p.slug, label: p.label }))
  const requested = (await searchParams).practice
  const initialPractice = practices.find((p) => p.slug === requested)?.id

  return (
    <main className="relative min-h-svh bg-[var(--color-bg)]">
      <ScrollTopOnLoad />

      <section className="relative overflow-hidden" style={{ clipPath: 'inset(0)' }}>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <CaseBackground />
        </div>
        <HeroDecor />

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-20 pt-24 sm:px-8 md:pb-24">
          {/* scroll={false}: доводку до якоря делает HomeAnchorScroll главной */}
          <Link
            href="/#cases"
            scroll={false}
            className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
          >
            ← На главную
          </Link>

          <div className="mt-12 flex flex-wrap items-center gap-4 md:mt-14">
            <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
              Архив избранных дел
              <i
                aria-hidden
                className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
              />
            </span>
          </div>

          <WordReveal delay={0.3} waitForIntro>
            <h1 className="mt-8 font-heading text-[clamp(2.4rem,6vw,4.5rem)] font-black leading-[1.02] tracking-[-0.03em] text-[var(--color-text)]">
              Кейсы
            </h1>
          </WordReveal>

          <div
            className="relative mt-10 max-w-[760px] overflow-hidden rounded-[var(--radius-xl)] border p-6 sm:p-7 md:p-9"
            style={PANEL_STYLE}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-[14%] h-[72%] w-[3px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
            />
            <p className="text-[1.05rem] leading-relaxed text-[var(--color-text)] sm:text-lg md:text-xl md:leading-relaxed">
              {INTRO}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 md:h-36"
          style={{ background: 'linear-gradient(180deg, transparent 0%, var(--color-bg) 100%)' }}
        />
      </section>

      <div className="relative mx-auto max-w-[1280px] px-6 pb-24 pt-6 sm:px-8 md:pb-32">
        <CasesLibrary cases={CASE_STUDIES} practices={practices} initialPractice={initialPractice} />
      </div>

      <section className="relative mx-auto max-w-[1280px] px-6 pb-28 sm:px-8 md:pb-36">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border p-9 md:p-12" style={PANEL_STYLE}>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[14%] h-[72%] w-[4px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 30px var(--color-lime-glow)' }}
          />
          <BlurText delay={0.1}>
            <h2 className="max-w-[24ch] font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-black leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]">
              Обсудим вашу задачу
            </h2>
          </BlurText>
          <RevealOnScroll delay={0.45} y={20} duration={0.7} blur={10}>
            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Узнали свою ситуацию в одном из дел? Опишите её — оценим риски и предложим порядок действий.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={0.65} y={20} duration={0.7} blur={10}>
            <Link
              href="/contacts"
              className="btn-lime-fill btn-lime-breathe mt-9 inline-flex h-12 items-center justify-center rounded-md px-7 text-sm font-semibold"
            >
              Обсудить задачу
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  )
}
