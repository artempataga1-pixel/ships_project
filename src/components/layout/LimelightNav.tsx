'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { NavItem } from '@/types/content'
import {
  isStoryActive,
  NAV_ID_TO_STEP,
  STORY_EXIT_EVENT,
  STORY_GOTO_EVENT,
} from '@/components/hero/useStoryController'
import { useActiveSection } from '@/components/layout/useActiveSection'

// Горизонтальный padding ссылки (px-4 с двух сторон) — лампа накрывает сам текст пункта
const LINK_PADDING_X = 32
// Минимальная ширина лампы, чтобы на коротких пунктах («Кейсы») не схлопывалась в точку
const LAMP_MIN_WIDTH = 44

export function LimelightNav({ items }: { items: NavItem[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  // Активная секция определяется скроллом: какая из секций пересекает середину экрана
  const activeIndex = useActiveSection(items)
  const [lamp, setLamp] = useState<{ x: number; width: number } | null>(null)
  // Первый замер рисуем без transition — иначе лампа «переезжает» из нуля при загрузке
  const [isReady, setIsReady] = useState(false)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const targetIndex = hoveredIndex ?? activeIndex

  // Клик по пункту меню, пока стори жива: story-шаги (О нас/Компетенции/
  // Партнёры) — мгновенный прыжок на шаг без проигрыша; секции ниже —
  // выход из стори + обычный scrollTo. Иначе (мобилка/подстраница) — по href.
  const handleClick = (e: React.MouseEvent, item: NavItem) => {
    if (!isStoryActive()) return
    const id = item.href.split('#')[1]
    if (!id) return
    e.preventDefault()
    if (id in NAV_ID_TO_STEP) {
      window.dispatchEvent(new CustomEvent(STORY_GOTO_EVENT, { detail: { step: NAV_ID_TO_STEP[id] } }))
    } else {
      window.dispatchEvent(new CustomEvent(STORY_EXIT_EVENT, { detail: { id } }))
    }
  }

  useLayoutEffect(() => {
    if (targetIndex === null) return
    const el = itemRefs.current[targetIndex]
    if (!el) return

    const measure = () => setLamp({ x: el.offsetLeft, width: el.offsetWidth })
    measure()
    if (!isReady) requestAnimationFrame(() => setIsReady(true))

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [targetIndex, isReady])

  return (
    <>
      {/* Лампа: тонкая лайм-полоска над активным/наведённым пунктом. Конус и
          свечение под текстом убраны — остаётся только полоска сверху (glow
          на самой полоске допустим). Ширина тянется под текст пункта,
          позиция через translateX, координаты — от offsetParent (nav). */}
      {(() => {
        const lampWidth = lamp
          ? Math.max(lamp.width - LINK_PADDING_X, LAMP_MIN_WIDTH)
          : LAMP_MIN_WIDTH
        return (
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
              opacity: targetIndex === null || lamp === null ? 0 : 1,
              transition: isReady
                ? 'transform 0.4s ease, width 0.4s ease, opacity 0.3s ease'
                : 'none',
            }}
          />
        )
      })()}

      <ul
        className="flex items-center"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {items.map((item, i) => (
          <li
            key={item.href}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            onMouseEnter={() => setHoveredIndex(i)}
          >
            {/* Обычный <a>, не next/link — клик по якорю перехватывает Lenis
                (anchors в SmoothScrollProvider) и плавно скроллит к секции */}
            <a
              href={item.href}
              onClick={(e) => handleClick(e, item)}
              className={`block rounded-full px-4 py-1.5 text-[15px] font-medium transition-colors duration-200 ${
                i === targetIndex
                  ? 'text-[var(--color-text)]'
                  : 'text-[#333333]'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
