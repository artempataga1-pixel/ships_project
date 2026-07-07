'use client'

import { useEffect } from 'react'

/* Довозит скролл до карточки кейса при возврате со страницы /cases/[slug]
   по ссылке /#case-<slug>. Нативный скролл Next к якорю сбивается Lenis-ом,
   который перезапускается через 350мс после смены страницы (SmoothScrollProvider),
   поэтому скроллим сами чуть позже. */
export function CaseAnchorScroll() {
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#case-')) return

    const el = document.getElementById(hash.slice(1))
    if (!el) return

    const id = setTimeout(() => {
      el.scrollIntoView({ behavior: 'instant', block: 'center' })
    }, 450)
    return () => clearTimeout(id)
  }, [])

  return null
}
