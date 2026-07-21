'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

// Кастомный курсор: отстающее кольцо (лайм + бежевое свечение), которое
// увеличивается при наведении на интерактивные элементы. Только десктоп
// (xl, 1280px+, как и вся остальная десктопная навигация сайта) — на
// тач-устройствах своего курсора нет, а слушатель mousemove на мобилке
// зря жёг бы кадры.
const BORDER_SMOOTHNESS = 0.1

// matchMedia — внешний источник состояния, useSyncExternalStore тут уместнее
// useEffect+useState (та ест cascading re-render на маунте).
function subscribeDesktopQuery(callback: () => void) {
  const mq = window.matchMedia('(min-width: 1280px)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getIsDesktopSnapshot() {
  return window.matchMedia('(min-width: 1280px)').matches
}

export function CursorFollower() {
  const isDesktop = useSyncExternalStore(subscribeDesktopQuery, getIsDesktopSnapshot, () => false)

  return isDesktop ? <CursorFollowerInner /> : null
}

function CursorFollowerInner() {
  const mousePosition = useRef({ x: 0, y: 0 })
  const borderPosition = useRef({ x: 0, y: 0 })

  const [renderPos, setRenderPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', handleMouseMove)

    const interactiveElements = document.querySelectorAll('a, button, img, input, textarea, select')
    interactiveElements.forEach((element) => {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    })

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

    const animate = () => {
      borderPosition.current.x = lerp(borderPosition.current.x, mousePosition.current.x, BORDER_SMOOTHNESS)
      borderPosition.current.y = lerp(borderPosition.current.y, mousePosition.current.y, BORDER_SMOOTHNESS)

      setRenderPos({ x: borderPosition.current.x, y: borderPosition.current.y })

      animationId = requestAnimationFrame(animate)
    }

    let animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((element) => {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[95]">
      <div
        className="absolute rounded-full border-[3px]"
        style={{
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          borderColor: 'var(--color-lime)',
          boxShadow: '0 0 12px 3px rgba(216, 200, 168, 0.55)',
          transform: 'translate(-50%, -50%)',
          left: renderPos.x,
          top: renderPos.y,
          transition: 'width 0.3s, height 0.3s',
        }}
      />
    </div>
  )
}
