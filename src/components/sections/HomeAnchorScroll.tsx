'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import { NAV_ID_TO_STEP } from '@/components/hero/useStoryController'

// useLayoutEffect на сервере даёт warning — на SSR подменяем на useEffect
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Довозит скролл до цели при загрузке главной с якорем НИЖЕ стори:
   /#practices, /#articles, /#cases, /#contacts (навбар/«Связаться» с внутренних
   страниц) и /#case-<slug> (возврат со страницы кейса).

   Якоря полок стори (about/competencies/partners) и hero сюда не входят — их
   обрабатывает контроллер стори (запертый старт на нужном шаге).

   Почему через Lenis API, а не scrollIntoView: нативный скролл Lenis тут же
   перебивает своим RAF-циклом (лерпит обратно к targetScroll=0), поэтому
   позиционируем через lenis.scrollTo — он согласованно ставит и target, и
   animated scroll. force:true — потому что SmoothScrollProvider на смене
   страницы останавливает Lenis на ~350мс.

   Почему серия попыток и оверлей: браузер мгновенно скроллит к якорю ещё по
   ранней flow-разметке, затем ScrollStory апгрейдится до story и пины
   (Практики/Статьи) добавляют spacer-высоту — секции уезжают, и вьюпорт
   оказывается на чужом блоке (Практики вместо Статей и т.п.). Пока раскладка
   устаканивается, страница закрыта фоновым оверлеем; каждая попытка ставит
   скролл заново, и как только позиция цели перестаёт меняться — оверлей
   растворяется. Так пользователь не видит ни чужой блок, ни рывок доводки. */

// Моменты попыток от старта, мс. Первая — сразу; хвост страхует поздние
// сдвиги раскладки (шрифты/видео) при полной загрузке страницы с хэшем.
const DELAYS = [0, 120, 260, 420, 620, 900, 1150]

// Хэш вида «#id», который обслуживает этот компонент: любой якорь, кроме
// полок стори и hero (те стартуют запертыми в стори, скроллить некуда)
function isBelowStoryHash(hash: string): boolean {
  if (!hash.startsWith('#')) return false
  const id = hash.slice(1)
  return id !== '' && id !== 'hero' && !(id in NAV_ID_TO_STEP)
}

export function HomeAnchorScroll() {
  const lenis = useLenis()
  const [cover, setCover] = useState(false) // оверлей смонтирован
  const [faded, setFaded] = useState(false) // оверлей растворяется

  // Оверлей — до первой отрисовки, чтобы чужой блок не мигнул даже на кадр
  useClientLayoutEffect(() => {
    if (isBelowStoryHash(window.location.hash)) setCover(true)
  }, [])

  useEffect(() => {
    const hash = window.location.hash
    if (!isBelowStoryHash(hash) || !lenis) return
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
        // прежней страницы, и scrollTo клампит цель до него. Пересчитываем
        // размеры перед каждой попыткой.
        lenis.resize()
        // Карточку кейса — примерно в центр экрана (offset поднимает её
        // вверх); секции — ровно к их верху
        const offset = id.startsWith('case-') ? -window.innerHeight * 0.28 : 0
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
