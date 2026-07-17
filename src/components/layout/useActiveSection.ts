'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types/content'
import { STORY_STEP_EVENT } from '@/components/hero/useStoryController'

// Общая логика LimelightNav и MobileBottomNav: какая секция активна сейчас.
// Источники — IntersectionObserver по секциям DOM и событие story:step от
// контроллера стори (пока стори жива, about/competencies/partners не имеют
// секций в DOM — подсветку этих шагов даёт сам контроллер).
export function useActiveSection(items: NavItem[]): number | null {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  // При клиентской навигации секции пересоздаются — observer нужно переподключить
  const pathname = usePathname()

  useEffect(() => {
    // На внутренних страницах (например /cases/…) секций нет — активного пункта нет
    // eslint-disable-next-line react-hooks/set-state-in-effect -- намеренный сброс перед пере-подпиской observer
    setActiveIndex(null)
    // Узкая полоса по центру вьюпорта: активна секция, пересекающая её.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Flow-секции полок (about/…) удаляются при апгрейде до story — их
          // прощальное «не пересекает» приходит уже после story:step от
          // контроллера и гасило бы только что зажжённую подсветку
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

  return activeIndex
}
