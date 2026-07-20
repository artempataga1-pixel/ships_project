'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { NAV_ITEMS } from '@/constants/nav'
import { useActiveSection } from '@/components/layout/useActiveSection'
import { isMobileScrubActive, scrollToMobileScrubStep } from '@/components/hero/useMobileScrubController'
import { NAV_ID_TO_STEP } from '@/components/hero/useStoryController'
import { useFormFocus } from '@/lib/useFormFocus'

// Те же величины, что в LimelightNav — лампа той же формы/свечения
const LINK_PADDING_X = 32
const LAMP_MIN_WIDTH = 44

// Клик по about/competencies/partners, пока жив мобильный скраб-пин: в
// scrub-режиме у этих полок нет DOM id (оверлеи внутри пина) — обычный
// href-переход туда не попадёт, поэтому программный scrollTo к границе
// нужного шага внутри пина (дальше видео примет нужный кадр само через
// onUpdate контроллера). lenis передаём в scrollToMobileScrubStep по тому
// же принципу, что и весь остальной код на Lenis (useStoryController) —
// на нетач-устройстве с узким окном SmoothScrollProvider монтирует Lenis,
// программный скролл идёт через её API, а не через native window.scrollTo.
// Вне scrub-режима (десктоп/flow) — обычный переход по href.
function onNavClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  lenis: ReturnType<typeof useLenis>,
) {
  if (!isMobileScrubActive()) return
  const id = href.split('#')[1]
  if (!id || !(id in NAV_ID_TO_STEP)) return
  e.preventDefault()
  scrollToMobileScrubStep(NAV_ID_TO_STEP[id], lenis)
}

// Нижнее фиксированное меню до 1024px: все 7 пунктов, горизонтальный скролл
// с автоцентрированием активного и той же «лампой», что у десктопной LimelightNav.
// Десктопный story-контроллер (isStoryActive) на мобиле не монтируется — для
// practices/articles/cases/contacts клики по <a> идут обычным переходом/якорем.
export function MobileBottomNav() {
  const activeIndex = useActiveSection(NAV_ITEMS)
  const lenis = useLenis()
  // Во время ввода в поле формы iOS-клавиатура двигает fixed-элементы —
  // прячем меню, чтобы оно не наезжало на поля/кнопку отправки
  const isFormFocused = useFormFocus()
  const [lamp, setLamp] = useState<{ x: number; width: number } | null>(null)
  // Первый замер рисуем без transition — иначе лампа «переезжает» из нуля при загрузке
  const [isReady, setIsReady] = useState(false)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (activeIndex === null) return
    const el = itemRefs.current[activeIndex]
    if (!el) return

    const measure = () => setLamp({ x: el.offsetLeft, width: el.offsetWidth })
    measure()
    if (!isReady) requestAnimationFrame(() => setIsReady(true))

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex, isReady])

  // Автоцентрирование активного пункта в горизонтальном скроллере.
  // scrollTo, не scrollIntoView — последний в Safari дёргает вертикальный скролл страницы.
  useEffect(() => {
    if (activeIndex === null) return
    const scroller = scrollerRef.current
    const el = itemRefs.current[activeIndex]
    if (!scroller || !el) return
    scroller.scrollTo({
      left: el.offsetLeft - (scroller.clientWidth - el.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [activeIndex])

  const lampWidth = lamp
    ? Math.max(lamp.width - LINK_PADDING_X, LAMP_MIN_WIDTH)
    : LAMP_MIN_WIDTH

  return (
    <nav
      aria-label="Основная навигация"
      aria-hidden={isFormFocused}
      className={`xl:hidden fixed inset-x-0 bottom-0 z-[90] isolate transform-gpu bg-[var(--color-bg)]/92 backdrop-blur-md border-t border-[var(--color-line)] transition-transform duration-200 ${
        isFormFocused ? 'translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div ref={scrollerRef} className="overflow-x-auto no-scrollbar">
        <ul className="relative flex w-max items-center gap-1 px-3 h-14">
          {/* Лампа лежит внутри трека (не в фиксированной обёртке) — скроллится
              вместе с пунктами, отдельный пересчёт при горизонтальном скролле не нужен */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-[5px] rounded-full"
            style={{
              width: lampWidth,
              backgroundColor: 'var(--color-lime)',
              boxShadow:
                '0 0 10px var(--color-lime-glow), 0 0 20px var(--color-lime-soft)',
              transform: `translate(${
                lamp ? lamp.x + lamp.width / 2 - lampWidth / 2 : 0
              }px, -50%)`,
              opacity: activeIndex === null || lamp === null ? 0 : 1,
              transition: isReady
                ? 'transform 0.4s ease, width 0.4s ease, opacity 0.3s ease'
                : 'none',
            }}
          />
          {NAV_ITEMS.map((item, i) => (
            <li
              key={item.href}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
            >
              <a
                href={item.href}
                onClick={(e) => onNavClick(e, item.href, lenis)}
                className={`block whitespace-nowrap rounded-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  i === activeIndex ? 'text-[var(--color-text)]' : 'text-[#333333]'
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
