'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { whenIntroDone } from '@/lib/introGate'

/* Посимвольная «печать» текста — перенос Typewriter-компонента из референсов
   (там framer-motion: staggerChildren по буквам, каждая opacity 0 → 1).

   У нас разбивку делает SplitText: он рекурсивно обходит текстовые узлы, сам
   ставит слову display:inline-block (буквы не рвутся переносом строки) и с
   версии 3.13 сам вешает aria-label на контейнер и aria-hidden на осколки —
   скринридер читает исходный текст, а не «П-р-о-Б-а-н-к-р-о-т-с-т-в-о».
   После проигрывания split.revert() возвращает исходный DOM: сотни span-ов
   нужны только на время анимации.

   maxDuration — наша добавка к референсу. Там печатается цитата в 200 знаков,
   у нас — описание практики в 900: при жёстком stagger 0.012 текст доезжал бы
   одиннадцать секунд. Шаг ужимается так, чтобы весь блок уложился в maxDuration.

   Два режима запуска:
   — по скроллу (по умолчанию) — ScrollTrigger, один раз;
   — по флагу active — для аккордеона: печать стартует в момент раскрытия
     группы, а не когда свёрнутая панель формально попала во вьюпорт. */
interface TypewriterProps {
  children: ReactNode
  className?: string
  /** Пауза перед первой буквой, с. */
  delay?: number
  /** Шаг между буквами, с (верхняя граница — реальный шаг может быть меньше). */
  speed?: number
  /** Потолок общей длительности печати, с. */
  maxDuration?: number
  /** Ручной режим: печать идёт при true. Не передан — работает по скроллу. */
  active?: boolean
  /** span — когда обёртка стоит внутри строчного контекста (заголовок, абзац). */
  as?: 'div' | 'span'
  /** Ждать конца лого-интро (для блоков первого экрана) — см. lib/introGate. */
  waitForIntro?: boolean
}

export function Typewriter({
  children,
  className,
  delay = 0,
  speed = 0.012,
  maxDuration = 1.8,
  active,
  as = 'div',
  waitForIntro = false,
}: TypewriterProps) {
  const ref = useRef<HTMLElement>(null)
  const manual = active !== undefined

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      // Системная настройка «меньше движения» — текст просто стоит на месте.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Ручной режим до раскрытия: ничего не трогаем, текст остаётся обычным
      // (панель над ним всё равно схлопнута по высоте).
      if (manual && !active) return

      const split = new SplitText(el, { type: 'words,chars' })
      const chars = split.chars
      if (!chars.length) {
        split.revert()
        return
      }

      const each = Math.min(speed, maxDuration / chars.length)
      gsap.set(chars, { opacity: 0 })

      let tween: gsap.core.Tween | null = null
      const play = (extra?: gsap.TweenVars) => {
        tween = gsap.to(chars, {
          opacity: 1,
          duration: 0.12,
          ease: 'none',
          delay,
          stagger: each,
          onComplete: () => split.revert(),
          ...extra,
        })
      }

      let io: IntersectionObserver | null = null
      let cancelGate: () => void = () => {}

      if (manual) {
        /* Ручной режим (аккордеон) НЕ вешает печать на ScrollTrigger — раньше
           вешал, и это давало баг «текст навсегда невидим»: ScrollTrigger
           кеширует позицию элемента в момент создания и пересчитывает её
           только по событию scroll. А раскрытие ЭТОЙ группы почти всегда идёт
           одновременно со схлопыванием СОСЕДНЕЙ (аккордеон одиночного
           раскрытия) — сосед сверху сжимается через CSS-transition высоты, и
           наш элемент от этого едет вверх по экрану, но окно при этом не
           скроллится ни на пиксель. События scroll нет — ScrollTrigger не
           перепроверяет геометрию — onEnter не долетает никогда, чек-буллет
           рядом (чистый CSS-переход) при этом исправно проявляется.

           IntersectionObserver не зависит от того, ЧТО сдвинуло элемент —
           он реагирует на фактическое пересечение с вьюпортом, будь то
           скролл, resize или чужой CSS-transition. */
        io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              io?.disconnect()
              play()
            }
          },
          { threshold: 0.01 },
        )
        io.observe(el)
      } else {
        const playScroll = () => play({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
        cancelGate = waitForIntro ? whenIntroDone(playScroll) : (playScroll(), () => {})
      }

      return () => {
        io?.disconnect()
        cancelGate()
        tween?.kill()
        split.revert()
      }
    },
    { scope: ref, dependencies: [active] },
  )

  const Tag = as
  return (
    <Tag ref={ref as React.Ref<HTMLDivElement & HTMLSpanElement>} className={className}>
      {children}
    </Tag>
  )
}
