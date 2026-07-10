'use client'

import { useRef, useEffect } from 'react'

interface StatItem {
  value: number
  label: string
  suffix?: string
}

interface StatCounterProps {
  items: StatItem[]
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

interface AnimatedStatProps {
  item: StatItem
}

function AnimatedStat({ item }: AnimatedStatProps) {
  const numRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!numRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true
          const start = performance.now()
          const duration = 1800

          function tick(now: number) {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const current = Math.round(easeOutCubic(progress) * item.value)

            if (numRef.current) {
              numRef.current.textContent = current.toLocaleString('ru-RU')
            }

            if (progress < 1) {
              rafRef.current = requestAnimationFrame(tick)
            }
          }

          rafRef.current = requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(numRef.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="flex items-baseline gap-1">
        <span
          ref={numRef}
          className="font-heading text-4xl sm:text-5xl md:text-7xl font-extrabold text-[var(--color-text)]"
        >
          0
        </span>
        {item.suffix && (
          // Суффикс — того же цвета, что и цифра (раньше был отдельным акцентом)
          <span className="font-heading text-2xl sm:text-3xl md:text-5xl font-extrabold text-[var(--color-text)]">
            {item.suffix}
          </span>
        )}
      </div>
      <span className="text-[var(--color-muted)] text-sm uppercase tracking-widest">
        {item.label}
      </span>
    </div>
  )
}

export function StatCounter({ items, className }: StatCounterProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 ${className ?? ''}`}>
      {items.map((item, i) => (
        <div
          key={item.label}
          className={
            i > 0
              ? 'md:border-l md:border-[var(--color-line)]'
              : ''
          }
        >
          <AnimatedStat item={item} />
        </div>
      ))}
    </div>
  )
}
