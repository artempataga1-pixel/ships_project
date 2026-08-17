'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { whenIntroDone } from '@/lib/introGate'

/* Пословный выезд из-под маски — перенос keyframes wordReveal из референса
   (translateY(100%) + blur(4px) → 0, cubic-bezier(0.16,1,0.3,1), шаг 0.1с).

   В референсе каждое слово вручную обёрнуто в контейнер с overflow:hidden;
   у нас ту же работу делает SplitText с mask:'words' — он же корректно
   переносит строки и не рвёт слова.

   ease: cubic-bezier(0.16,1,0.3,1) — это классический easeOutExpo, поэтому
   берём штатный 'expo.out' вместо подключения CustomEase.

   blur снимается на узких экранах: filter на движущемся элементе — дорогой
   слой для мобильного GPU (та же логика, что в RevealOnScroll). */
export function WordReveal({
  children,
  className,
  delay = 0.3,
  stagger = 0.1,
  duration = 0.7,
  waitForIntro = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  /** Ждать конца лого-интро (для блоков первого экрана) — см. lib/introGate. */
  waitForIntro?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const withBlur = !window.matchMedia('(max-width: 1023px)').matches
      // aria: 'none' — по умолчанию SplitText вешает aria-label на el (режим
      // 'auto'). el здесь — обычный <div> без роли ("generic"), а по ARIA-спеке
      // aria-label запрещён на generic-элементах (axe: "aria-label attribute
      // cannot be used on a generic div" — ловится Lighthouse
      // agentic-browsing/agent-accessibility-tree, найдено в шаге 2.4). Без
      // aria текст всё равно читается корректно: split не трогает сам текст,
      // только оборачивает слова в inline-block, скринридер проходит по нему
      // как обычно.
      const split = new SplitText(el, { type: 'words', mask: 'words', aria: 'none' })
      if (!split.words.length) {
        split.revert()
        return
      }

      // Начальное состояние ставим сразу — иначе текст успел бы мигнуть на
      // месте до того, как гейт пропустит анимацию.
      gsap.set(split.words, {
        yPercent: 100,
        opacity: 0,
        ...(withBlur && { filter: 'blur(4px)' }),
      })

      let tween: gsap.core.Tween | null = null
      const play = () => {
        tween = gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          ...(withBlur && { filter: 'blur(0px)' }),
          duration,
          delay,
          stagger,
          ease: 'expo.out',
          onComplete: () => split.revert(),
        })
      }
      const cancelGate = waitForIntro ? whenIntroDone(play) : (play(), () => {})

      return () => {
        cancelGate()
        tween?.kill()
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
