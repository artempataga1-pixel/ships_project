'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types/content'
import {
  isStoryActive,
  NAV_ID_TO_STEP,
  STORY_EXIT_EVENT,
  STORY_GOTO_EVENT,
  STORY_STEP_EVENT,
} from '@/components/hero/useStoryController'

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
  // При клиентской навигации секции пересоздаются — observer нужно переподключить
  const pathname = usePathname()

  const targetIndex = hoveredIndex ?? activeIndex

  useEffect(() => {
    // На внутренних страницах (например /cases/…) секций нет — лампа не горит
    // eslint-disable-next-line react-hooks/set-state-in-effect -- намеренный сброс лампы при смене маршрута перед пере-подпиской observer
    setActiveIndex(null)
    // Узкая полоса по центру вьюпорта: активна секция, пересекающая её.
    // В hero (без якоря) ни одна секция не активна — лампа гаснет
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Flow-секции полок (about/…) удаляются при апгрейде до story — их
          // прощальное «не пересекает» приходит уже после story:step от
          // контроллера и гасило бы только что зажжённую лампу
          if (!entry.target.isConnected) continue
          const index = items.findIndex(
            (item) => item.href.endsWith(`#${entry.target.id}`),
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
      // href вида «/#about» — id после решётки
      const id = item.href.split('#')[1]
      const section = id ? document.getElementById(id) : null
      if (section) observer.observe(section)
    }
    return () => observer.disconnect()
  }, [items, pathname])

  // Пока стори активна, about/competencies/partners не имеют секций в DOM —
  // подсветку этих шагов даёт сам контроллер через событие story:step.
  useEffect(() => {
    const onStoryStep = (e: Event) => {
      const id = (e as CustomEvent<{ id: string | null }>).detail.id
      if (!id) {
        setActiveIndex(null)
        return
      }
      const index = items.findIndex((item) => item.href.endsWith(`#${id}`))
      setActiveIndex(index === -1 ? null : index)
    }
    window.addEventListener(STORY_STEP_EVENT, onStoryStep)
    return () => window.removeEventListener(STORY_STEP_EVENT, onStoryStep)
  }, [items])

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
