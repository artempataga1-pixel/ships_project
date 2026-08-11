'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

/* Рамка в 1px, по которой за курсором ходит мягкое лайм-свечение.

   Как это устроено: поверх контейнера лежит слой с радиальным градиентом в
   точке курсора, а CSS-маска вырезает из него всё, кроме кольца толщиной 1px
   (два одинаковых градиента маски, один по content-box, режим exclude —
   остаётся ровно padding-область, то есть контур). Никакого box-shadow: он
   светил бы наружу пятном, а нужен именно светящийся контур.

   В референсе свечение белое — у нас светлая тема, белое по белому не видно,
   поэтому берём фирменный --color-lime-glow. Плотность регулируется
   прозрачностью слоя, а не альфой в цвете: так значение лайма остаётся одним
   на весь сайт и не расползается хардкодом по компонентам. */

const RADIUS: Record<string, string> = {
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: '9999px',
}

export function SpotlightBorder({
  children,
  className,
  radius = 'xl',
  size = 520,
  intensity = 0.5,
  style,
}: {
  children: ReactNode
  className?: string
  radius?: keyof typeof RADIUS | string
  size?: number
  intensity?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // На тач-устройствах курсора нет: слушатель бы висел впустую, а свечение
    // всё равно осталось бы стоять там, где палец коснулся в последний раз.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    // Слушаем окно, а не сам элемент: свечение должно подходить к рамке
    // заранее, когда курсор ещё только приближается снаружи.
    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
      el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    }

    window.addEventListener('pointermove', handleMove, { passive: true })
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const borderRadius = RADIUS[radius] ?? radius

  return (
    <div ref={ref} className={`relative ${className ?? ''}`} style={{ borderRadius, ...style }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius,
          padding: 1,
          opacity: intensity,
          background: `radial-gradient(${size}px circle at var(--spot-x, -400px) var(--spot-y, -400px), var(--color-lime-glow), transparent 60%)`,
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {children}
    </div>
  )
}
