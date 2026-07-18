'use client'

import { Fragment, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import {
  PRACTICE_AREAS,
  PRACTICE_QUOTES,
  PRACTICES_SLOGAN,
} from '@/constants/content/practice'
import type { PracticeArea } from '@/types/content'

/* Референс — dizain5.jpg + 03_practices_intro (заголовочный экран). Сначала
   светлый экран-заголовок с ghost-panel, орбитами и лайм-glow; затем секция
   прилипает и вертикальный скролл превращается в горизонтальный проезд коллажа:
   карточки разных размеров на разной высоте, подписи-ярлыки над ними, между
   карточками — цитаты. Когда коллаж доехал до конца, пин отпускает и
   вертикальный скролл плавно продолжается к следующему блоку.
   Механика скролла/пина/параллакса сохранена с тёмной версии — меняется
   только палитра/шрифт под лайм-редизайн. */

interface CardVariant {
  /* вертикальная посадка в коллаже: верх / центр / низ со сдвигами */
  align: string
  width: string
  ratio: string
  /* приглушённая карточка — как тонированные мелкие фото в референсе */
  muted: boolean
}

/* ratio каждой карточки совпадает с пропорцией её фото (practice-1..6),
   чтобы object-cover не резал кадр — форма рамки повторяет форму снимка */
const CARD_VARIANTS: CardVariant[] = [
  { align: 'lg:self-center', width: 'w-full lg:w-[24vw] lg:min-w-[280px]', ratio: 'aspect-[2/3]', muted: false },   // practice-1 · 1024×1536
  { align: 'lg:self-start lg:mt-[10dvh]', width: 'w-full lg:w-[34vw] lg:min-w-[360px]', ratio: 'aspect-[3/2]', muted: false }, // practice-2 · 1536×1024
  { align: 'lg:self-end lg:mb-[14dvh]', width: 'w-full lg:w-[18vw] lg:min-w-[240px]', ratio: 'aspect-[10/13]', muted: true },  // practice-3 · 1100×1430
  { align: 'lg:self-start lg:mt-[8dvh]', width: 'w-full lg:w-[27vw] lg:min-w-[320px]', ratio: 'aspect-[4/3]', muted: false },  // practice-4 · 1448×1086
  { align: 'lg:self-center', width: 'w-full lg:w-[17vw] lg:min-w-[230px]', ratio: 'aspect-[9/16]', muted: true },   // practice-5 · 941×1672
  { align: 'lg:self-end lg:mb-[12dvh]', width: 'w-full lg:w-[30vw] lg:min-w-[360px]', ratio: 'aspect-[4/3]', muted: false },   // practice-6 · 1448×1086
]

/* Контурный логотип-скобка (декор фона заголовочного экрана, ~16% opacity) —
   угловые border-рамки + три бара, как .logo-outline в референс-коде. */
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

function PracticeCard({ item, variant }: { item: PracticeArea; variant: CardVariant }) {
  return (
    <Link
      id={`practice-${item.slug}`}
      href={`/practices/${item.slug}`}
      aria-label={`Практика «${item.title}» — узнать подробнее`}
      className={`group block scroll-mt-[30dvh] shrink-0 lg:ml-[5vw] ${variant.align} ${variant.width}`}
    >
      <figure>
        {/* Ярлык над фото — как «QATAR, 2024» в референсе */}
        <figcaption className="mb-3 text-xs tracking-[0.25em] uppercase text-[var(--color-muted)]">
          {item.num} / {item.label}
        </figcaption>

        {/* Внешняя рамка — держит hover-scale отдельно от внутреннего
            data-parallax-слоя, который GSAP уже двигает инлайн-стилем
            (xPercent): два независимых transform-слоя не конфликтуют. */}
        <div
          className={`relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] transition-transform duration-500 ease-out group-hover:scale-[1.02] ${variant.ratio} ${variant.muted ? 'opacity-80' : ''}`}
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* Фото направления. Пропорция рамки = пропорция фото, поэтому кадр
              садится целиком; лёгкий зум (scale-112) даёт запас, чтобы
              горизонтальный параллакс не оголял края при сдвиге */}
          <div data-parallax className="absolute inset-0">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 1023px) 92vw, 36vw"
              className="scale-[1.12] object-cover"
            />
          </div>

          {/* Затемнение снизу — контраст для лайм-текста «Узнать подробнее» */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent"
          />

          {/* Лайм-полоса у правого края — общая схема карточки редизайна */}
          <span
            className="pointer-events-none absolute right-0 top-0 h-full w-[3px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 22px var(--color-lime-glow)' }}
          />

          {/* Ссылка на страницу практики — правый нижний угол фото */}
          <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-lime)]">
            Узнать подробнее
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>

        <h3 className="mt-5 font-heading text-xl md:text-2xl font-extrabold leading-snug text-[var(--color-text)]">
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {item.desc}
        </p>
      </figure>
    </Link>
  )
}

function QuoteBlock({ text }: { text: string }) {
  return (
    <div className="shrink-0 w-full lg:self-center lg:ml-[7vw] lg:w-[26vw] lg:min-w-[300px]">
      <p className="font-heading italic font-semibold text-[var(--color-lime-ink)] text-[clamp(1.25rem,1.8vw,1.75rem)] leading-snug">
        {text}
      </p>
    </div>
  )
}

export function PracticesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const pinWrap = pinRef.current
      const track = trackRef.current
      if (!pinWrap || !track) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const dist = () => track.scrollWidth - window.innerWidth

        // Вертикальный скролл конвертируется в горизонтальный сдвиг трека;
        // когда трек доехал до конца — пин отпускает и страница едет дальше вниз
        const scrollTween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            id: 'practices-collage',
            trigger: pinWrap,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Лёгкий параллакс фото внутри рамок — глубина, как в референсе
        track.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -5 },
            {
              xPercent: 5,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                containerAnimation: scrollTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })
      })

      // Reduced motion: без пина — обычная горизонтальная прокрутка коллажа
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: reduce)', () => {
        pinWrap.classList.add('overflow-x-auto')
        return () => pinWrap.classList.remove('overflow-x-auto')
      })
    },
    { scope: sectionRef },
  )

  return (
    <section id="practices" ref={sectionRef} className="relative bg-[var(--color-bg)]">
      {/* Экран-заголовок: уезжает вверх обычным скроллом, как интро в референсе */}
      <div className="relative flex min-h-svh flex-col items-center justify-start overflow-hidden px-6 pt-28 text-center lg:h-dvh lg:justify-center lg:pt-0">
        {/* Светлый градиент секции + мягкий лайм-glow за заголовком */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 52% 48%, var(--color-lime-soft), transparent 30%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
          }}
        />

        {/* Ghost-panel за заголовком — полупрозрачная скруглённая панель */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[560px] w-[min(1230px,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-[42px] lg:block"
          style={{
            background: 'rgba(255,255,255,.64)',
            border: '1px solid rgba(255,255,255,.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,.95),0 30px 90px rgba(0,0,0,.04)',
          }}
        />

        {/* Фоновые эллиптические орбиты */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[96%] max-w-[1530px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[-15deg]"
          style={{ borderColor: 'rgba(201,255,31,.42)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[510px] w-[86%] max-w-[1380px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[-11deg]"
          style={{ borderColor: 'rgba(0,0,0,.08)' }}
        />

        {/* Лайм-точки по периметру орбит */}
        {[
          'left-[10%] top-[46%]',
          'right-[11%] top-[22%]',
          'left-[38%] bottom-[8%]',
          'right-[14%] top-[56%]',
          'right-[24%] bottom-[16%]',
          'left-[16%] top-[26%]',
        ].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
        ))}

        {/* Контурные лого-скобки — декор по углам, как в референсе */}
        <LogoOutline className="bottom-[8%] left-[10%]" />
        <LogoOutline className="right-[9%] top-[24%]" />

        {/* Контент заголовочного экрана */}
        <div className="relative z-[4]">
          <h2
            className="
              mt-8 font-heading font-black uppercase
              text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] tracking-[-0.06em]
              text-[var(--color-text)]
            "
          >
            Наши
            <br />
            практики
          </h2>
          <p className="mx-auto mt-10 max-w-3xl font-heading italic text-[var(--color-muted)] text-[clamp(1.25rem,2vw,1.9rem)] leading-snug">
            {PRACTICES_SLOGAN}
          </p>
        </div>
      </div>

      {/* Пин-экран: коллаж карточек, едущий горизонтально */}
      <div ref={pinRef} className="relative lg:h-dvh lg:overflow-hidden">
        <div
          ref={trackRef}
          id="practices-track"
          className="flex flex-col gap-14 px-6 py-16 lg:h-full lg:w-max lg:flex-row lg:items-stretch lg:gap-0 lg:px-0 lg:py-[6dvh]"
        >
          {/* Отступ старта: первая карточка входит из-за правого края не впритык */}
          <div className="hidden w-[6vw] shrink-0 lg:block" aria-hidden="true" />

          {PRACTICE_AREAS.map((item, i) => (
            <Fragment key={item.slug}>
              {/* Цитаты — перед 3-й и 5-й карточками, как реплики в референсе */}
              {i === 2 && <QuoteBlock text={PRACTICE_QUOTES[0]} />}
              {i === 4 && <QuoteBlock text={PRACTICE_QUOTES[1]} />}
              <PracticeCard item={item} variant={CARD_VARIANTS[i % CARD_VARIANTS.length]} />
            </Fragment>
          ))}

          {/* Хвост: последняя карточка останавливается не у самого края */}
          <div className="hidden w-[10vw] shrink-0 lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
