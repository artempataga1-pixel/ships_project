'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/* Довозит скролл до карточки кейса при возврате со страницы /cases/[slug]
   по ссылке /#case-<slug>.

   Почему через Lenis API, а не scrollIntoView: нативный скролл Lenis тут же
   перебивает своим RAF-циклом (лерпит обратно к targetScroll=0), поэтому
   позиционируем через lenis.scrollTo — он согласованно ставит и target, и
   animated scroll. force:true — потому что SmoothScrollProvider на смене
   страницы останавливает Lenis на ~350мс. Повторяем несколько раз: раскладка
   главной (pinned-секции, шрифты, видео) устаканивается уже после первого
   кадра, ScrollTrigger.refresh сдвигает позицию карточки — догоняем. */
export function CaseAnchorScroll() {
  const lenis = useLenis()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#case-')) return
    const id = hash.slice(1)

    let tries = 0
    let timer: number
    const go = () => {
      const el = document.getElementById(id)
      if (el && lenis) {
        // карточку — примерно в центр экрана (offset поднимает её вверх)
        lenis.scrollTo(el, {
          immediate: true,
          force: true,
          offset: -window.innerHeight * 0.28,
        })
      }
      tries += 1
      // 400 → 650 → 900 → 1150мс: покрываем догоняющий refresh раскладки (~600мс)
      if (tries < 4) timer = window.setTimeout(go, 250)
    }
    timer = window.setTimeout(go, 400)

    return () => window.clearTimeout(timer)
  }, [lenis])

  return null
}
