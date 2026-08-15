'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'

/* BlurText из hero-референса: слова проявляются по очереди через две ступени
   размытия — blur(10px)/opacity 0/y 50 → blur(5px)/opacity .5/y −5 →
   blur(0)/opacity 1/y 0, по 0.35с на ступень, шаг между словами 0.1с.

   Промежуточная ступень с проскоком выше конечной точки (y: −5) — та самая
   деталь, из-за которой эффект читается «дыханием», а не обычным fade-in;
   в GSAP это ложится на keyframes одним твином.

   Разбивку делает SplitText — он же отдаёт a11y (aria-label на контейнере,
   aria-hidden на словах) и после проигрывания разворачивается обратно.

   Размытие живёт только на широких экранах: анимировать filter на мобильном
   GPU дорого (общая политика проекта, см. RevealOnScroll). */
export function BlurText({
  children,
  className,
  delay = 0,
  stagger = 0.1,
}: {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const withBlur = !window.matchMedia('(max-width: 1023px)').matches
      const split = new SplitText(el, { type: 'words' })
      if (!split.words.length) {
        split.revert()
        return
      }

      gsap.set(split.words, {
        opacity: 0,
        y: 50,
        ...(withBlur && { filter: 'blur(10px)' }),
      })
      const tween = gsap.to(split.words, {
        keyframes: [
          {
            opacity: 0.5,
            y: -5,
            ...(withBlur && { filter: 'blur(5px)' }),
            duration: 0.35,
            ease: 'power2.out',
          },
          {
            opacity: 1,
            y: 0,
            ...(withBlur && { filter: 'blur(0px)' }),
            duration: 0.35,
            ease: 'power2.out',
          },
        ],
        delay,
        stagger,
        onComplete: () => split.revert(),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })

      return () => {
        tween.kill()
        split.revert()
      }
    },
    { scope: ref, dependencies: [] },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
