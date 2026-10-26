import type { Metadata } from 'next'
import Link from 'next/link'
import type { Publication } from '@/types/content'
import {
  PROBANKROTSTVO_PROFILE_URL,
  PUBLICATION_TOPICS,
  PUBLICATIONS,
} from '@/constants/content/publications'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { WordReveal } from '@/components/ui/WordReveal'
import { BlurText } from '@/components/ui/BlurText'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { PublicationsLibrary } from '@/components/publications/PublicationsLibrary'
import { ProbankrotstvoSection } from '@/components/publications/ProbankrotstvoSection'

/* Страница «Публикации и аналитика» — по ТЗ заказчика (new/01_ТЗ_страницы).
   Не архив ссылок, а редакционно отобранная библиотека: избранное с
   обложками → каталог → комментарии на PROбанкротство → обращение.

   Страница серверная; клиентский только блок с фильтрами
   (PublicationsLibrary). Скрытые материалы (hidden) отсеиваются здесь, до
   передачи на клиент, порядок — по ручному полю order. */

const INTRO_LEAD =
  'Мы регулярно анализируем судебную практику, изменения законодательства и правовые риски бизнеса для федеральных, региональных и профессиональных СМИ.'
const INTRO_REST =
  'Здесь собраны публикации и экспертные комментарии, наиболее точно отражающие направления нашей работы.'

export const metadata: Metadata = {
  title: 'Публикации и аналитика — Шумская и Партнёры',
  description: INTRO_LEAD,
}

const byOrder = (a: Publication, b: Publication) => a.order - b.order
const visible = PUBLICATIONS.filter((item) => !item.hidden)

const FEATURED = visible.filter((item) => item.kind === 'main' && item.featured).sort(byOrder)
const CATALOG = visible.filter((item) => item.kind === 'main' && !item.featured).sort(byOrder)
const PROBANKROTSTVO = visible.filter((item) => item.kind === 'probankrotstvo').sort(byOrder)

/* Та же плотная белая панель, что у CTA страницы практики */
const PANEL_STYLE = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-line)',
  boxShadow: 'var(--shadow-card)',
} as const

/* Декор героя — облегчённая версия HeroDecor страницы практики: орбиты и
   лайм-точки. Точки только с md — на узком экране они ложились бы на текст. */
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
      {['right-[6%] top-[18%]', 'left-[10%] bottom-[14%]', 'right-[12%] bottom-[22%]'].map((pos) => (
        <span
          key={pos}
          className={`absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] md:block`}
          style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
        />
      ))}
    </div>
  )
}

export default function PublicationsPage() {
  return (
    <main className="relative min-h-svh bg-[var(--color-bg)]">
      <ScrollTopOnLoad />

      {/* ── Герой ──
          Конструкция задника — как на странице практики: clip-path: inset(0)
          делает секцию containing block для fixed-задника, он стоит на месте,
          но обрезан границами героя. */}
      <section className="relative overflow-hidden" style={{ clipPath: 'inset(0)' }}>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <CaseBackground />
        </div>
        <HeroDecor />

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-20 pt-24 sm:px-8 md:pb-24">
          {/* Возврат — на блок публикаций главной. scroll={false}: доводку до
              якоря делает HomeAnchorScroll главной (см. страницу практики). */}
          <Link
            href="/#articles"
            scroll={false}
            className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
          >
            ← На главную
          </Link>

          <div className="mt-12 flex flex-wrap items-center gap-4 md:mt-14">
            <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
              Экспертная библиотека
              <i
                aria-hidden
                className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
              />
            </span>
          </div>

          {/* waitForIntro — при прямом заходе герой стоит под оверлеем
              лого-интро, без ожидания анимация прошла бы за занавесом. */}
          <WordReveal delay={0.3} waitForIntro>
            <h1 className="mt-8 max-w-[18ch] font-heading text-[clamp(2.1rem,5vw,4rem)] font-black leading-[1.04] tracking-[-0.03em] text-[var(--color-text)]">
              Публикации и аналитика
            </h1>
          </WordReveal>

          {/* Вводный текст — дословно из раздела 3 ТЗ. Белая панель с
              лайм-полосой: поверх живого задника голый текст терял контраст. */}
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
              {INTRO_LEAD} {INTRO_REST}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 md:h-36"
          style={{ background: 'linear-gradient(180deg, transparent 0%, var(--color-bg) 100%)' }}
        />
      </section>

      {/* ── Фильтры + избранные + каталог ── */}
      <div className="relative mx-auto max-w-[1280px] px-6 pb-24 sm:px-8 md:pb-32">
        <PublicationsLibrary featured={FEATURED} catalog={CATALOG} topics={PUBLICATION_TOPICS} />
      </div>

      {/* ── Комментарии PROбанкротство (вне фильтров) ── */}
      <div className="relative mx-auto max-w-[1280px] px-6 pb-24 sm:px-8 md:pb-32">
        <ProbankrotstvoSection items={PROBANKROTSTVO} profileUrl={PROBANKROTSTVO_PROFILE_URL} />
      </div>

      {/* ── Обращение — как блок 8 страницы практики ── */}
      <section className="relative mx-auto max-w-[1280px] px-6 pb-28 sm:px-8 md:pb-36">
        <div
          className="relative overflow-hidden rounded-[var(--radius-xl)] border p-9 md:p-12"
          style={PANEL_STYLE}
        >
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
              Узнали свою ситуацию в одном из материалов? Опишите её — оценим риски и предложим
              порядок действий.
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
