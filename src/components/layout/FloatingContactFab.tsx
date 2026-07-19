'use client'

import { useEffect, useState } from 'react'
import { Phone } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/nav'
import { useActiveSection } from '@/components/layout/useActiveSection'
import { useFormFocus } from '@/lib/useFormFocus'

const CONTACTS_INDEX = NAV_ITEMS.findIndex((item) => item.href.endsWith('#contacts'))

// Плавающая круглая кнопка связи (FAB) до 1024px — тап ведёт к форме контактов.
// Прячется, когда сама секция «Контакты» уже активна (кнопка «связаться»
// поверх формы связи бессмысленна), во время ввода в поле формы (клавиатура)
// и на самом хероблоке — там для той же цели уже есть кнопка «Обсудить задачу».
export function FloatingContactFab() {
  const activeIndex = useActiveSection(NAV_ITEMS)
  const isFormFocused = useFormFocus()
  const isOnHero = useIsOnHero()
  const isHidden = isFormFocused || activeIndex === CONTACTS_INDEX || isOnHero

  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- намеренно нативный <a>: на главной клик перехватывает Lenis/нативный скролл к #contacts, Link здесь не нужен
    <a
      href="/#contacts"
      aria-label="Связаться с нами"
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : undefined}
      className={`btn-lime-fill lg:hidden fixed right-4 z-[89] flex items-center justify-center w-14 h-14 rounded-full transition-[transform,opacity] duration-200 ${
        isHidden ? 'translate-y-8 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <Phone className="w-6 h-6" aria-hidden />
    </a>
  )
}

// true, пока в вьюпорте виден хотя бы кусочек #hero (моб. FlowFallback,
// см. ScrollStory.tsx). Стартуем с true — на первом кадре пользователь
// всегда на героблоке, так кнопка не мигает видимой перед скрытием.
function useIsOnHero(): boolean {
  const [isOnHero, setIsOnHero] = useState(true)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) {
      // Внутренние страницы (/cases/…, /practices/…) — героблока нет вообще,
      // прятать FAB не за чем.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- намеренный сброс дефолта при монтировании вне главной
      setIsOnHero(false)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setIsOnHero(entry.isIntersecting))
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return isOnHero
}
