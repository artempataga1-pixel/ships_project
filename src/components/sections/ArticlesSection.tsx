'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { MEDIA } from '@/constants/content/media'
import type { MediaItem } from '@/types/content'

/* Референс — hildenkaira.fi (reference 2/stati.mp4): секция пинится. Первая карточка
   въезжает снизу вверх и занимает экран. Дальше все следующие карточки уже лежат
   статично друг под другом (стопкой), и при скролле верхняя улетает вверх с лёгким
   поворотом, открывая под собой следующую — та никуда не едет, просто открывается.
   Цвета — не их (лайм/мята), а бронза и холодный акцент нашего сайта.
   На мобильных пин отключён (scroll-jacking там неуместен) — карточки идут
   обычным вертикальным списком. */

// Каждая следующая карточка в стопке чуть смещена вниз-вправо — веером,
// чтобы её край выглядывал из-под текущей, а не пряталась ровно под ней
const PEEK_STEPS = [
  '',
  'md:translate-x-3 md:translate-y-3',
  'md:translate-x-6 md:translate-y-6',
  'md:translate-x-9 md:translate-y-9',
]

function ArticleCard({ item, index, total }: { item: MediaItem; index: number; total: number }) {
  const num = String(index + 1).padStart(2, '0')
  const cold = index % 2 === 1
  const accentClass = cold ? 'text-[var(--color-accent-cold)]' : 'text-hero-bronze'
  const borderClass = cold ? 'border-[var(--color-accent-cold)]/40' : 'border-[var(--color-card-border)]/50'

  return (
    <article
      className={`
        relative flex flex-col justify-center
        min-h-[82dvh] md:min-h-0 md:h-full w-full
        rounded-2xl md:rounded-3xl border ${borderClass}
        bg-gradient-to-b from-zinc-800 to-zinc-900
        shadow-[0_25px_70px_-15px_rgba(0,0,0,0.75)]
        overflow-hidden
      `}
    >
      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-14 md:py-0 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-heading tracking-[0.2em] uppercase text-white/50">
              {item.publisher}
            </span>
            <span className={`font-hero-italic italic text-2xl md:text-3xl leading-none ${accentClass}`}>
              {num}
              <span className="ml-1 font-heading text-xs not-italic align-top text-white/30">
                /{String(total).padStart(2, '0')}
              </span>
            </span>
          </div>

          <h3 className="font-heading text-[clamp(1.75rem,3.2vw,3rem)] font-extrabold leading-[1.05]">
            {item.title}
          </h3>

          <div className="mt-8 flex items-center gap-6">
            <span className="text-sm text-white/40">{item.date}</span>
            <a
              href="#"
              aria-label={`Читать статью «${item.title}»`}
              className={`text-sm flex items-center gap-1 hover:underline underline-offset-4 ${accentClass}`}
            >
              Читать <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Превью — заглушка вместо фото, потом заменим на реальные изображения */}
        <div className={`relative aspect-[4/3] md:aspect-[16/11] overflow-hidden rounded-lg border ${borderClass}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-hero text-[clamp(3rem,7vw,6rem)] opacity-70 ${accentClass}`}>
                {num}
              </span>
            </div>
            <div className="absolute bottom-4 left-4">
              <span
                className="
                  text-xs font-heading tracking-[0.15em] uppercase
                  text-white/80 bg-black/50 backdrop-blur-sm
                  px-3 py-1.5 rounded
                "
              >
                {item.publisher}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export function ArticlesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const pinWrap = pinRef.current
      const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null)
      if (!pinWrap || cards.length < 2) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 768px)', () => {
        // Первая карточка стартует за нижним краем экрана. Пока она едет наверх,
        // её бокс физически ниже экрана и не закрывает карточки под собой —
        // поэтому остальные прячем (autoAlpha 0) и открываем только когда она доедет
        gsap.set(cards[0], { yPercent: 100, rotate: 0 })
        gsap.set(cards.slice(1), { yPercent: 0, rotate: 0, autoAlpha: 0 })
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: 0 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinWrap,
            start: 'top top',
            end: () => `+=${cards.length * window.innerHeight}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Въезд первой карточки снизу вверх, следом открываем лежащую под ней стопку
        tl.to(cards[0], { yPercent: 0, ease: 'none' }, 0)
        tl.set(cards.slice(1), { autoAlpha: 1 }, 1)

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
    },
    { scope: sectionRef },
  )

  return (
    <section id="articles" ref={sectionRef} className="relative bg-black">
      {/* На мобильных — обычный заголовок сверху, как и раньше. На десктопе он
          скрыт: вместо него внутри пина работает вариант, который доезжает
          снизу вместе со страницей и оседает в нижней полосе (см. ниже) */}
      <div className="md:hidden max-w-[1440px] w-full mx-auto px-8 pt-24">
        <SectionHeading title="Статьи" subtitle="Публикации и комментарии экспертов компании" />
      </div>

      <div
        ref={pinRef}
        className="relative mt-12 md:mt-0 flex flex-col gap-6 md:gap-0 md:h-dvh md:overflow-hidden"
      >
        {MEDIA.map((item, i) => (
          <div
            key={item.title}
            ref={(el) => {
              cardsRef.current[i] = el
            }}
            className={`relative md:absolute md:inset-x-[18%] md:inset-y-[20%] ${PEEK_STEPS[Math.min(i, PEEK_STEPS.length - 1)]}`}
            style={{ zIndex: MEDIA.length - i }}
          >
            <ArticleCard item={item} index={i} total={MEDIA.length} />
          </div>
        ))}

        {/* Заголовок доезжает вместе со страницей и остаётся в нижней полосе пина,
            пока карточки сменяют друг друга — z-30, чтобы быть поверх стопки всегда */}
        <div
          className="
            hidden md:flex absolute inset-x-[18%] bottom-[6%] z-30
            items-baseline justify-between gap-6
          "
        >
          <h2 className="font-heading text-2xl lg:text-3xl font-extrabold uppercase">
            Статьи
          </h2>
          <p className="text-sm lg:text-base text-white/50">
            Публикации и комментарии экспертов компании
          </p>
        </div>

        {/* Полоска прогресса пина — заполняется по мере смены карточек (только десктоп) */}
        <div className="hidden md:block absolute bottom-0 inset-x-0 h-[3px] bg-white/10 z-20">
          <div
            ref={progressRef}
            className="h-full w-full origin-left bg-gradient-to-r from-[var(--color-card-border)] to-[var(--color-accent-cold)]"
          />
        </div>
      </div>
    </section>
  )
}
