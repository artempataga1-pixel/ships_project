'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types/content'

// Ширина лампы (w-11) — нужна числом, чтобы центрировать её над пунктом через translateX
const LAMP_WIDTH = 44

export function LimelightNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [lamp, setLamp] = useState<{ x: number; width: number } | null>(null)
  // Первый замер рисуем без transition — иначе лампа «переезжает» из нуля при загрузке
  const [isReady, setIsReady] = useState(false)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const activeIndex = items.findIndex((item) => item.href === pathname)
  const targetIndex = hoveredIndex ?? (activeIndex >= 0 ? activeIndex : null)

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
          Позиция через translateX (composite-only), координаты — от offsetParent (пилюля) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[5px] w-11 rounded-full"
        style={{
          backgroundColor: 'rgba(228, 229, 233, 0.95)',
          boxShadow:
            '0 0 12px rgba(228, 229, 233, 0.8), 0 0 28px rgba(228, 229, 233, 0.45)',
          transform: `translate(${
            lamp ? lamp.x + lamp.width / 2 - LAMP_WIDTH / 2 : 0
          }px, -50%)`,
          opacity: targetIndex === null || lamp === null ? 0 : 1,
          transition: isReady
            ? 'transform 0.4s ease, opacity 0.3s ease'
            : 'none',
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-full h-11 w-14 -translate-x-1/2"
          style={{
            clipPath: 'polygon(5% 100%, 25% 0, 75% 0, 95% 100%)',
            background:
              'linear-gradient(to bottom, rgba(228, 229, 233, 0.4), transparent)',
          }}
        />
      </div>

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
            <Link
              href={item.href}
              className={`block rounded-full px-4 py-1.5 text-sm transition-colors duration-200 ${
                i === targetIndex ? 'text-white' : 'text-white/70'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
