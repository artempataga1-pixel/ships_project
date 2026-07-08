'use client'

import { Fragment, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import {
  PRACTICE_AREAS,
  PRACTICE_QUOTES,
  PRACTICES_SLOGAN,
} from '@/constants/content/practice'
import type { PracticeArea } from '@/types/content'

/* Референс — landonorris.com (reference 2/praktiki.mp4): сначала экран-заголовок,
   затем секция прилипает и вертикальный скролл превращается в горизонтальный
   проезд коллажа: фото разных размеров на разной высоте, подписи-ярлыки над ними,
   между карточками — цитаты. Когда коллаж доехал до конца, пин отпускает
   страницу и вертикальный скролл плавно продолжается к следующему блоку. */

interface CardVariant {
  /* вертикальная посадка в коллаже: верх / центр / низ со сдвигами */
  align: string
  width: string
  ratio: string
  /* приглушённая карточка — как тонированные мелкие фото в референсе */
  muted: boolean
}

const CARD_VARIANTS: CardVariant[] = [
  { align: 'self-center', width: 'w-[24vw] min-w-[280px]', ratio: 'aspect-[3/4]', muted: false },
  { align: 'self-start mt-[10dvh]', width: 'w-[34vw] min-w-[360px]', ratio: 'aspect-[16/10]', muted: false },
  { align: 'self-end mb-[14dvh]', width: 'w-[18vw] min-w-[240px]', ratio: 'aspect-square', muted: true },
  { align: 'self-start mt-[8dvh]', width: 'w-[27vw] min-w-[320px]', ratio: 'aspect-[4/5]', muted: false },
  { align: 'self-center', width: 'w-[17vw] min-w-[230px]', ratio: 'aspect-[3/4]', muted: true },
  { align: 'self-end mb-[12dvh]', width: 'w-[36vw] min-w-[380px]', ratio: 'aspect-[16/9]', muted: false },
]

function PracticeCard({ item, variant }: { item: PracticeArea; variant: CardVariant }) {
  return (
    <figure className={`shrink-0 ml-[5vw] ${variant.align} ${variant.width}`}>
      {/* Ярлык над фото — как «QATAR, 2024» в референсе */}
      <figcaption className="mb-3 text-xs tracking-[0.25em] uppercase text-white/50">
        {item.num} / {item.label}
      </figcaption>

      <div className={`relative overflow-hidden ${variant.ratio} ${variant.muted ? 'opacity-75' : ''}`}>
        {/* Заглушка вместо фото — потом заменим на реальные изображения.
            Растянута шире рамки, чтобы параллакс не оголял края */}
        <div
          data-parallax
          className="absolute inset-y-0 -inset-x-[8%] bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900"
        >
          <span className="absolute inset-0 flex items-center justify-center font-hero text-[clamp(3rem,6vw,5.5rem)] text-bronze-solid">
            {item.num}
          </span>
        </div>
      </div>

      <h3 className="mt-5 font-heading text-xl md:text-2xl font-extrabold leading-snug">
        {item.title}
      </h3>
      <p className="mt-2 text-sm text-white/50">
        {item.desc}
      </p>
    </figure>
  )
}

function QuoteBlock({ text }: { text: string }) {
  return (
    <div className="shrink-0 self-center ml-[7vw] w-[26vw] min-w-[300px]">
      <p className="font-hero-italic italic text-bronze-solid text-[clamp(1.25rem,1.8vw,1.75rem)] leading-snug">
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

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const dist = () => track.scrollWidth - window.innerWidth

        // Вертикальный скролл конвертируется в горизонтальный сдвиг трека;
        // когда трек доехал до конца — пин отпускает и страница едет дальше вниз
        const scrollTween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
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
      mm.add('(prefers-reduced-motion: reduce)', () => {
        pinWrap.classList.add('overflow-x-auto')
        return () => pinWrap.classList.remove('overflow-x-auto')
      })
    },
    { scope: sectionRef },
  )

  return (
    <section id="practices" ref={sectionRef} className="relative bg-black">
      {/* Экран-заголовок: уезжает вверх обычным скроллом, как интро в референсе */}
      <div className="flex h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
        <span className="text-sm md:text-base tracking-[0.3em] uppercase text-hero-bronze">
          ( 06 направлений )
        </span>
        <h2
          className="
            font-heading font-extrabold uppercase
            text-[clamp(3rem,9vw,8.5rem)] leading-[0.98]
          "
        >
          Наши
          <br />
          практики
        </h2>
        <p className="max-w-3xl font-hero-italic italic text-hero-bronze text-[clamp(1.25rem,2vw,1.9rem)]">
          {PRACTICES_SLOGAN}
        </p>
      </div>

      {/* Пин-экран: коллаж карточек, едущий горизонтально */}
      <div ref={pinRef} className="relative h-dvh overflow-hidden">
        <div ref={trackRef} className="flex h-full w-max items-stretch py-[6dvh]">
          {/* Отступ старта: первая карточка входит из-за правого края не впритык */}
          <div className="w-[6vw] shrink-0" aria-hidden="true" />

          {PRACTICE_AREAS.map((item, i) => (
            <Fragment key={item.num}>
              {/* Цитаты — перед 3-й и 5-й карточками, как реплики в референсе */}
              {i === 2 && <QuoteBlock text={PRACTICE_QUOTES[0]} />}
              {i === 4 && <QuoteBlock text={PRACTICE_QUOTES[1]} />}
              <PracticeCard item={item} variant={CARD_VARIANTS[i % CARD_VARIANTS.length]} />
            </Fragment>
          ))}

          {/* Хвост: последняя карточка останавливается не у самого края */}
          <div className="w-[10vw] shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
