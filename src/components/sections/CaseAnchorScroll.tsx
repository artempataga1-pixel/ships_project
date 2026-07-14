'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useLenis } from 'lenis/react'

// useLayoutEffect на сервере даёт warning — на SSR подменяем на useEffect
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Довозит скролл до карточки кейса при возврате со страницы /cases/[slug]
   по ссылке /#case-<slug>.

   Почему через Lenis API, а не scrollIntoView: нативный скролл Lenis тут же
   перебивает своим RAF-циклом (лерпит обратно к targetScroll=0), поэтому
   позиционируем через lenis.scrollTo — он согласованно ставит и target, и
   animated scroll. force:true — потому что SmoothScrollProvider на смене
   страницы останавливает Lenis на ~350мс.

   Почему серия попыток и оверлей: Next мгновенно скроллит к #case-… ещё по
   flow-разметке, затем ScrollStory апгрейдится до story и документ вырастает
   на ~3 экрана — вьюпорт оказывается на чужом блоке (Практики/Партнёры).
   Пока раскладка устаканивается, страница закрыта фоновым оверлеем; каждая
   попытка ставит скролл заново, и как только позиция карточки перестаёт
   меняться — оверлей растворяется. Так пользователь не видит ни чужой блок,
   ни рывок доводки. */

// Моменты попыток от старта, мс. Первая — сразу; хвост страхует поздние
// сдвиги раскладки (шрифты/видео) при полной загрузке страницы с хэшем.
const DELAYS = [0, 120, 260, 420, 620, 900, 1150]

export function CaseAnchorScroll() {
  const lenis = useLenis()
  const [cover, setCover] = useState(false) // оверлей смонтирован
  const [faded, setFaded] = useState(false) // оверлей растворяется

  // Оверлей — до первой отрисовки, чтобы чужой блок не мигнул даже на кадр
  useClientLayoutEffect(() => {
    if (window.location.hash.startsWith('#case-')) setCover(true)
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#case-') || !lenis) return
    const id = hash.slice(1)

    let i = 0
    let lastTarget: number | null = null
    let timer = 0
    let fadeTimer = 0

    const settle = () => {
      setFaded(true)
      // убрать оверлей после transition-opacity (300мс) с небольшим запасом
      fadeTimer = window.setTimeout(() => setCover(false), 400)
    }

    const go = () => {
      const el = document.getElementById(id)
      if (el) {
        // Lenis кеширует высоту документа: сразу после навигации limit ещё от
        // короткой страницы кейса (~1.5 экрана), и scrollTo клампит цель до
        // него. Пересчитываем размеры перед каждой попыткой.
        lenis.resize()
        // карточку — примерно в центр экрана (offset поднимает её вверх)
        const offset = -window.innerHeight * 0.28
        // Lenis (как и нативный якорный скролл) учитывает scroll-margin-top
        // элемента (scroll-mt-[30dvh] у карточек) — повторяем в расчёте цели
        const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
        const desired =
          el.getBoundingClientRect().top + window.scrollY - scrollMargin + offset
        const max = document.documentElement.scrollHeight - window.innerHeight
        const target = Math.max(0, Math.min(desired, max))
        lenis.scrollTo(el, { immediate: true, force: true, offset })
        // Оверлей отпускаем, когда (а) скролл реально доехал до цели, (б) цель
        // два замера подряд не менялась (раскладка устаканилась) и (в) story-
        // апгрейд уже точно позади (i >= 2 ≈ 260мс)
        const arrived = Math.abs(window.scrollY - target) < 2
        const stable = lastTarget !== null && Math.abs(target - lastTarget) < 2
        lastTarget = target
        if (arrived && stable && i >= 2) return settle()
      }
      i += 1
      if (i < DELAYS.length) {
        timer = window.setTimeout(go, DELAYS[i] - DELAYS[i - 1])
      } else {
        settle()
      }
    }
    go()

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(fadeTimer)
    }
  }, [lenis])

  if (!cover) return null
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[80] bg-[var(--color-bg)] transition-opacity duration-300 ${
        faded ? 'opacity-0' : 'opacity-100'
      }`}
    />
  )
}
