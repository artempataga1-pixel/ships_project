'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* Бесконечная бегущая строка — референс landonorris.com. Лента едет ровно
   на половину своей ширины (translateX(-50%)) и уходит в бесшовный повтор.
   Чтобы стык был незаметен, ОДНА половина ленты должна быть шире вьюпорта —
   иначе после ухода контента справа появляется пустое место, которое
   заполняется, только когда доезжает следующая копия. Поэтому число копий
   набора считается динамически по реальной ширине набора и контейнера. */

interface MarqueeProps {
  items: ReactNode[]
  duration?: number
  className?: string
  itemClassName?: string
  separator?: ReactNode
  /** Текст для скринридеров — дублированные визуальные элементы скрыты через aria-hidden */
  srLabel?: string
}

export function Marquee({ items, duration = 30, className, itemClassName, separator = '·', srLabel }: MarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLDivElement>(null)
  // Сколько раз повторить набор items в КАЖДОЙ половине ленты.
  // Стартовый дефолт с запасом, чтобы не мигало до замера на широких экранах.
  const [copies, setCopies] = useState(4)

  useEffect(() => {
    const recompute = () => {
      const viewport = viewportRef.current
      const set = setRef.current
      if (!viewport || !set) return
      const setWidth = set.offsetWidth
      if (setWidth === 0) return
      // Одной половине (copies × набор) нужно быть шире вьюпорта. +1 набор — запас.
      const needed = Math.ceil(viewport.offsetWidth / setWidth) + 1
      setCopies(Math.max(2, needed))
    }

    recompute()
    const ro = new ResizeObserver(recompute)
    if (viewportRef.current) ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [items])

  // Две половины по `copies` наборов. translateX(-50%) сдвигает ровно на одну
  // половину = целое число наборов, поэтому картинка совпадает бесшовно.
  const totalSets = copies * 2

  return (
    <div className={className}>
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <div ref={viewportRef} className="overflow-hidden" aria-hidden={srLabel ? 'true' : undefined}>
        <div
          className="flex w-max items-center animate-marquee"
          style={{ '--duration': duration } as CSSProperties}
        >
          {Array.from({ length: totalSets }, (_, s) => (
            <div
              key={s}
              ref={s === 0 ? setRef : undefined}
              className="flex items-center shrink-0"
            >
              {items.map((item, i) => (
                <span key={`${s}-${i}`} className={`flex items-center whitespace-nowrap ${itemClassName ?? ''}`}>
                  {item}
                  <span className="mx-6 md:mx-10 text-[var(--color-line)]" aria-hidden="true">
                    {separator}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
