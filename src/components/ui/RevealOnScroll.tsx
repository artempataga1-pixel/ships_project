'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function RevealOnScroll({ children, className, delay = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // blur() — дорогой для мобильного GPU compositing, особенно когда несколько
    // reveal-блоков анимируются почти одновременно (заметный джанк на слабых
    // телефонах) — на узких экранах оставляем только fade/translate.
    const withBlur = !window.matchMedia('(max-width: 1023px)').matches

    // set сразу задаёт начальное состояние синхронно — исключает FOUC
    gsap.set(ref.current, { opacity: 0, y: 40, ...(withBlur && { filter: 'blur(8px)' }) })
    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      ...(withBlur && { filter: 'blur(0px)' }),
      duration: 0.8,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, { scope: ref, dependencies: [delay] })

  return (
    // will-change: filter задан на [data-reveal] в globals.css
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
