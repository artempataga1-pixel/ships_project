'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import type { CaseStudy } from '@/types/content'

interface CaseStudyCardProps {
  item: CaseStudy
  /* Каскад: правая колонка стартует чуть позже левой */
  delay?: number
}

export function CaseStudyCard({ item, delay = 0 }: CaseStudyCardProps) {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const root = rootRef.current
    if (!root) return
    const photo = root.querySelector('[data-photo]')
    const inner = root.querySelector('[data-photo-inner]')
    const title = root.querySelector('[data-title]')
    const meta = root.querySelector('[data-meta]')

    // set синхронно задаёт начальное состояние — исключает FOUC
    gsap.set(photo, { clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(inner, { scale: 1.35 })
    gsap.set(title, { yPercent: 110 })
    gsap.set(meta, { opacity: 0, y: 16, filter: 'blur(6px)' })

    const tl = gsap.timeline({
      delay,
      scrollTrigger: {
        trigger: root,
        start: 'top 80%',
        once: true,
      },
    })

    // Фото «проявляется»: шторка clip-path уходит вверх, кадр внутри
    // встречно уменьшается с 1.35 до 1 (эффект наезда камеры наоборот)
    tl.to(photo, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.2,
      ease: 'power4.inOut',
    })
      .to(inner, { scale: 1, duration: 1.2, ease: 'power4.inOut' }, '<')
      // Заголовок выезжает из-под маски, когда шторка почти открылась
      .to(title, { yPercent: 0, duration: 0.8, ease: 'power3.out' }, '-=0.45')
      .to(
        meta,
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
        '-=0.55',
      )
  }, { scope: rootRef, dependencies: [delay] })

  return (
    <article ref={rootRef}>
      <Link
        href={`/cases/${item.slug}`}
        className="group block"
        aria-label={`Кейс «${item.title}» — подробнее`}
      >
        {/* Фото кейса — пока заглушка-градиент, потом заменим на реальные фото.
            Шторка (clip-path) анимируется на этой обёртке */}
        <div
          data-photo
          className="
            relative aspect-[16/10] overflow-hidden rounded-lg
            border border-[var(--color-card-border)]/40
            [will-change:clip-path]
          "
        >
          {/* Слой GSAP-масштаба; hover-зум — на вложенном слое через CSS,
              чтобы не конфликтовать с inline-transform от GSAP */}
          <div data-photo-inner className="absolute inset-0 will-change-transform">
            <div
              className="
                absolute inset-0
                bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900
                transition-transform duration-700 ease-out
                group-hover:scale-[1.04]
              "
            >
              {/* Сумма спора — визуальный центр заглушки */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-5xl font-extrabold text-hero-bronze">
                  {item.amount}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>

          {/* Категория */}
          <span
            className="
              absolute top-4 left-4
              text-xs font-heading tracking-[0.15em] uppercase
              text-white/80 bg-black/50 backdrop-blur-sm
              px-3 py-1.5 rounded
            "
          >
            {item.category}
          </span>

          {/* Подробнее — правый нижний угол фото */}
          <span
            className="
              absolute bottom-4 right-4 flex items-center gap-1.5
              text-xs uppercase tracking-[0.15em]
              text-white/85 bg-black/50 backdrop-blur-sm
              px-3 py-1.5 rounded
              transition-colors duration-300
              group-hover:text-[var(--color-accent-cold)]
            "
          >
            Подробнее <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>

      {/* Заголовок под фото — выезжает из-под маски overflow-hidden */}
      <div className="mt-6 overflow-hidden">
        <h3 data-title className="font-heading text-2xl font-extrabold leading-snug">
          {item.title}
        </h3>
      </div>
      <div data-meta className="mt-3 flex items-center justify-between text-sm text-white/40">
        <span>{item.desc}</span>
        <span>{item.year}</span>
      </div>
    </article>
  )
}
