'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SectionComingSoon } from '@/components/sections/SectionComingSoon'
import { PUBLICATION_AUTHORS } from '@/constants/content/publication-meta'
import type { Publication } from '@/types/content'

/* Референс — dizain7/8.jpg + 04_article_card_01/05_article_card_02 (одна и та же
   карточка с разным контентом). Секция пинится: первая карточка въезжает снизу
   вверх и занимает экран. Дальше все следующие карточки уже лежат статично друг
   под другом (стопкой), и при скролле верхняя улетает вверх с лёгким поворотом,
   открывая под собой следующую — та никуда не едет, просто открывается.
   На мобильных пин отключён — карточки идут обычным вертикальным списком.
   Механика пина/скраба/прогресса сохранена с тёмной версии — меняется только
   палитра/структура карточки под лайм-редизайн (единый лайм-акцент, без
   чередования цвета). */

// Каждая следующая карточка в стопке чуть смещена вниз-вправо — веером,
// чтобы её край выглядывал из-под текущей, а не пряталась ровно под ней
const PEEK_STEPS = [
  '',
  'xl:motion-safe:translate-x-3 xl:motion-safe:translate-y-3',
  'xl:motion-safe:translate-x-6 xl:motion-safe:translate-y-6',
  'xl:motion-safe:translate-x-9 xl:motion-safe:translate-y-9',
]

function ArticleCard({ item }: { item: Publication }) {
  const authors = item.authors.map((id) => PUBLICATION_AUTHORS[id].name).join(', ')

  return (
    <article
      className="
        relative flex flex-col justify-center
        min-h-0 xl:motion-safe:h-full w-full
        rounded-2xl md:rounded-[28px]
        border border-[var(--color-line)]
        bg-[var(--color-surface)]
        overflow-hidden
      "
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Лайм-полоса слева с glow — единый акцент карточки редизайна (::before в референсе) */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-7 bottom-7 w-[4px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 42px var(--color-lime)' }}
      />

      {/* На xl карточка — 60% высоты окна с overflow-hidden, поэтому кегль
          заголовка, отступы и превью привязаны к высоте окна (dvh): на 768px
          по высоте длинные заголовки (№1, №8) иначе выталкивали кнопку «Читать». */}
      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-12 md:py-10 xl:py-[3.5dvh] grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">
        {/* Левая колонка — издание, заголовок, автор, превью */}
        <div className="min-w-0">
          <div className="mb-6 xl:mb-[2.5dvh]">
            <span className="font-heading text-xs font-black tracking-[0.22em] uppercase text-[var(--color-text)]">
              {item.publisher} · {item.year}
            </span>
          </div>

          <h3 className="font-heading text-[clamp(1.5rem,2.6vw,2.6rem)] xl:text-[clamp(1.4rem,min(2.2vw,3.6dvh),2.4rem)] font-black leading-[1.04] tracking-[-0.04em] text-[var(--color-text)]">
            {item.title}
          </h3>

          <p className="mt-5 xl:mt-[1.8dvh] text-sm md:text-base font-semibold text-[var(--color-text)]">
            {authors}
            {item.authorRole && (
              <span className="font-normal text-[var(--color-muted)]"> — {item.authorRole}</span>
            )}
          </p>

          {/* Превью — суть материала без перехода на сайт СМИ (ТЗ, раздел 8).
              На десктопе карточка ограничена высотой пина — превью режется до
              двух строк; полный текст — на странице /publications. */}
          <p className="mt-4 xl:mt-[1.5dvh] max-w-[60ch] text-sm leading-relaxed text-[var(--color-muted)] md:text-base xl:line-clamp-2">
            {item.preview}
          </p>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Читать публикацию «${item.title}» (откроется в новой вкладке)`}
            className="mt-7 xl:mt-[2dvh] inline-flex min-h-11 items-center gap-1.5 text-sm md:text-base font-extrabold text-[var(--color-lime-ink)] hover:underline underline-offset-4"
          >
            Читать публикацию{' '}
            <span aria-hidden className="text-xl">
              →
            </span>
          </a>
        </div>

        {/* Правая колонка — фирменная обложка 4:5 (PNG заказчика, текст
            впечатан). На xl высота привязана к пину, ширина — от пропорции. */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[6px] border border-[var(--color-line)] bg-[var(--color-surface-soft)] md:w-[260px] xl:h-[46dvh] xl:w-auto xl:max-w-none">
          {item.cover && (
            <Image
              src={item.cover}
              alt=""
              fill
              sizes="(max-width: 768px) 80vw, 360px"
              className="object-cover"
            />
          )}
        </div>
      </div>
    </article>
  )
}

/* Стопка — избранные публикации (№1–8 контентной таблицы заказчика) с их
   фирменными обложками; полная библиотека — на странице /publications.
   Данные приходят пропсом от серверной главной: секция клиентская, и
   прямой импорт реестра тянул бы в бандл тексты всех 25 материалов. */
export function ArticlesSection({ featured }: { featured: Publication[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const pinWrap = pinRef.current
      const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null)
      if (!pinWrap || cards.length < 2) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1280px)', () => {
        // Первая карточка стартует за нижним краем экрана. Пока она едет наверх,
        // её бокс физически ниже экрана и не закрывает карточки под собой —
        // поэтому остальные прячем (autoAlpha 0) и открываем только когда она доедет
        gsap.set(cards[0], { yPercent: 100, rotate: 0 })
        gsap.set(cards.slice(1), { yPercent: 0, rotate: 0, autoAlpha: 0 })
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: 0 })
        if (headingRef.current) gsap.set(headingRef.current, { autoAlpha: 1 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinWrap,
            start: 'top top',
            end: () => `+=${cards.length * window.innerHeight}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Последний пин по порядку страницы: практики (2) → статьи (1),
            // чем выше приоритет, тем раньше ScrollTrigger его пересчитывает
            refreshPriority: 1,
          },
        })

        // Въезд первой карточки снизу вверх, следом открываем лежащую под ней стопку
        tl.to(cards[0], { yPercent: 0, ease: 'none' }, 0)
        tl.set(cards.slice(1), { autoAlpha: 1 }, 1)

        // Заголовок секции виден только на старте (пока верх пуст). Как только
        // пошёл скролл и карточка поехала — он уходит и при прокрутке его нет.
        if (headingRef.current) {
          tl.to(headingRef.current, { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0)
        }

        // Каждая карточка, кроме последней, улетает вверх с лёгким поворотом,
        // открывая статично лежащую под ней следующую
        cards.slice(0, -1).forEach((card, i) => {
          tl.to(card, { yPercent: -120, rotate: i % 2 === 0 ? -6 : 6, ease: 'none' }, i + 1)
        })

        if (progressRef.current) {
          tl.to(progressRef.current, { scaleX: 1, ease: 'none', duration: cards.length }, 0)
        }

        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })

      // Мобильный/планшетный вариант: карточки идут обычным вертикальным
      // списком (без пина) — каждая появляется лёгким reveal при входе в вьюпорт
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 1279px)', () => {
        cards.forEach((card) => {
          gsap.from(card, {
            autoAlpha: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          })
        })
      })
    },
    { scope: sectionRef },
  )

  // Публикаций пока нет (см. publications.ts) — вместо пина показываем заглушку.
  // Хуки выше отработали вхолостую: без карточек useGSAP выходит сразу.
  if (featured.length === 0) {
    return (
      <SectionComingSoon
        id="articles"
        eyebrow="публикации"
        title="Публикации"
        text="Публикации и комментарии экспертов компании скоро появятся здесь."
      />
    )
  }

  return (
    <section id="articles" ref={sectionRef} className="relative scroll-mt-16 bg-[var(--color-bg)]">
      <div
        ref={pinRef}
        /* Раскладка стопки (экран-пин, карточки друг на друге) — только при
           motion-safe: с «уменьшить движение» GSAP-пин не создаётся, и
           прежде на ≥1280 оставалась видна лишь верхняя карточка из восьми.
           Без пина — обычный вертикальный список, как на мобиле. */
        className="relative mt-12 xl:motion-safe:mt-0 flex flex-col gap-6 xl:motion-safe:gap-0 xl:motion-safe:h-dvh xl:motion-safe:overflow-hidden"
      >
        {/* Фоновый декор экрана — светлый градиент + эллиптические орбиты и лайм-точки,
            видны в полях вокруг стопки (как в референс-коде .card-orbit/.dot) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden xl:motion-safe:block"
          style={{
            background:
              'radial-gradient(circle at 72% 42%, var(--color-lime-soft), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
          }}
        >
          <span
            className="absolute left-[-6%] top-[34%] h-[62%] w-[112%] rounded-[50%] border rotate-[-8deg]"
            style={{ borderColor: 'rgba(168,204,51,.42)' }}
          />
          <span
            className="absolute left-[2%] top-[52%] h-[52%] w-[104%] rounded-[50%] border rotate-[-6deg]"
            style={{ borderColor: 'rgba(0,0,0,.08)' }}
          />
          {['left-[9%] top-[54%]', 'right-[6%] top-[26%]', 'left-[62%] bottom-[15%]'].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
              style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
            />
          ))}
        </div>

        {featured.map((item, i) => (
          <div
            key={item.num}
            ref={(el) => {
              cardsRef.current[i] = el
            }}
            className={`relative xl:motion-safe:absolute xl:motion-safe:inset-x-[18%] xl:motion-safe:inset-y-[20%] xl:motion-reduce:mx-auto xl:motion-reduce:w-[min(1120px,90vw)] ${PEEK_STEPS[Math.min(i, PEEK_STEPS.length - 1)]}`}
            style={{ zIndex: featured.length - i }}
          >
            {/* На мобильных — заголовок секции вплотную над первой карточкой
                (без отступа). На десктопе скрыт: вместо него внутри пина
                работает вариант, оседающий в нижней полосе (см. ниже) */}
            {i === 0 && (
              <div className="xl:motion-safe:hidden max-w-[1440px] w-full mx-auto px-8">
                <SectionHeading title="Публикации" subtitle="Экспертная аналитика партнёров фирмы" />
              </div>
            )}
            <ArticleCard item={item} />
          </div>
        ))}

        {/* Заголовок секции — по центру верхней свободной зоны пина, пока снизу
            сменяются карточки. z-30 — всегда поверх стопки (карточки уезжают вверх
            за ним). Позиция фиксированная, при скролле не двигается. */}
        <div
          ref={headingRef}
          className="
            hidden xl:motion-safe:flex absolute inset-x-0 top-[8%] z-30
            flex-col items-center gap-3 text-center
          "
        >
          <h2 className="font-heading text-[clamp(2.5rem,4vw,4.25rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Публикации
          </h2>
          <p className="text-base lg:text-lg text-[var(--color-muted)]">
            Экспертная аналитика партнёров фирмы
          </p>
        </div>

        {/* Полоска прогресса пина — заполняется по мере смены карточек (только десктоп) */}
        <div className="hidden xl:motion-safe:block absolute bottom-0 inset-x-0 h-[3px] bg-[var(--color-line)] z-20">
          <div
            ref={progressRef}
            className="h-full w-full origin-left bg-gradient-to-r from-[var(--color-lime-ink)] to-[var(--color-lime)]"
          />
        </div>
      </div>

      {/* Выход в полную библиотеку — после стопки, вне пина: внутри пина
          кнопка либо пряталась бы под карточками, либо висела поверх них. */}
      <div className="flex justify-center px-8 pb-16 pt-12 xl:pt-16">
        <Link
          href="/publications"
          className="btn-lime-fill inline-flex h-12 items-center justify-center rounded-md px-7 text-sm font-semibold"
        >
          Все публикации и комментарии →
        </Link>
      </div>
    </section>
  )
}
