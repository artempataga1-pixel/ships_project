'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { NavItem } from '@/types/content'

// Горизонтальный padding ссылки (px-4 с двух сторон) — лампа накрывает сам текст пункта
const LINK_PADDING_X = 32
// Минимальная ширина лампы, чтобы на коротких пунктах («Кейсы») не схлопывалась в точку
const LAMP_MIN_WIDTH = 44

export function LimelightNav({ items }: { items: NavItem[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  // Активная секция определяется скроллом: какая из секций пересекает середину экрана
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [lamp, setLamp] = useState<{ x: number; width: number } | null>(null)
  // Первый замер рисуем без transition — иначе лампа «переезжает» из нуля при загрузке
  const [isReady, setIsReady] = useState(false)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const targetIndex = hoveredIndex ?? activeIndex

  useEffect(() => {
    // Узкая полоса по центру вьюпорта: активна секция, пересекающая её.
    // В hero (без якоря) ни одна секция не активна — лампа гаснет
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = items.findIndex(
            (item) => item.href === `#${entry.target.id}`,
          )
          if (index === -1) continue
          if (entry.isIntersecting) {
            setActiveIndex(index)
          } else {
            setActiveIndex((current) => (current === index ? null : current))
          }
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )

    for (const item of items) {
      const section = document.getElementById(item.href.slice(1))
      if (section) observer.observe(section)
    }
    return () => observer.disconnect()
  }, [items])

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
      {/* Лампа: полоска холодного света над кромкой пилюли + конус вниз.
          Ширина тянется под текст пункта (длинные названия накрыты целиком),
          позиция через translateX, координаты — от offsetParent (пилюля) */}
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
              backgroundColor: 'rgba(228, 229, 233, 0.95)',
              boxShadow:
                '0 0 12px rgba(228, 229, 233, 0.8), 0 0 28px rgba(228, 229, 233, 0.45)',
              transform: `translate(${
                lamp ? lamp.x + lamp.width / 2 - lampWidth / 2 : 0
              }px, -50%)`,
              opacity: targetIndex === null || lamp === null ? 0 : 1,
              transition: isReady
                ? 'transform 0.4s ease, width 0.4s ease, opacity 0.3s ease'
                : 'none',
            }}
          >
            {/* Конус — ширина в % от лампы, растягивается вместе с ней */}
            <div
              className="pointer-events-none absolute left-1/2 top-full h-11 -translate-x-1/2"
              style={{
                width: 'calc(100% + 12px)',
                clipPath: 'polygon(5% 100%, 25% 0, 75% 0, 95% 100%)',
                background:
                  'linear-gradient(to bottom, rgba(228, 229, 233, 0.4), transparent)',
              }}
            />
          </div>
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
              className={`block rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
                i === targetIndex ? 'text-white' : 'text-white/70'
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
