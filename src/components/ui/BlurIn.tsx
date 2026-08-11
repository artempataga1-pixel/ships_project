'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

/* Проявление из размытия: blur(20px)+прозрачность → резкость, 1.2с, один раз
   при входе в вьюпорт.

   Отличается от RevealOnScroll намеренно: там короткий (0.8с) подъём снизу с
   лёгким блюром — рабочая лошадка для абзацев и панелей; здесь длинный мягкий
   «наводится резкость» без сдвига, для крупных заголовков блока. Сдвиг у
   заголовка в 60px кегля читается как рывок, поэтому его тут нет.

   blur() дорог для мобильного GPU (та же причина, что описана в
   RevealOnScroll) — на узких экранах остаётся только прозрачность. */
export function BlurIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Уважаем системную настройку: элемент просто остаётся видимым, никакой
      // gsap.set не выполняется — нечего и восстанавливать.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const withBlur = !window.matchMedia('(max-width: 1023px)').matches
      const willChange = `opacity${withBlur ? ', filter' : ''}`

      gsap.set(ref.current, {
        opacity: 0,
        willChange,
        ...(withBlur && { filter: 'blur(20px)' }),
      })
      gsap.to(ref.current, {
        opacity: 1,
        ...(withBlur && { filter: 'blur(0px)' }),
        duration: 1.2,
        delay,
        ease: 'power2.out',
        onComplete: () => gsap.set(ref.current, { clearProps: 'willChange' }),
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      })
    },
    { scope: ref, dependencies: [delay] },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
