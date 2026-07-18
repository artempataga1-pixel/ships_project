'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import { NAV_ID_TO_STEP } from '@/components/hero/useStoryController'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// useLayoutEffect на сервере даёт warning — на SSR подменяем на useEffect
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Довозит скролл до цели при загрузке главной с якорем НИЖЕ стори:
   /#practices, /#articles, /#cases, /#contacts (навбар/«Связаться» с внутренних
   страниц), /#case-<slug> (возврат со страницы кейса) и /#practice-<slug>
   (возврат со страницы практики — с точным попаданием на карточку внутри
   горизонтального pin-scroll коллажа, см. resolvePracticeTarget ниже).

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
    if (!isBelowStoryHash(hash)) return
    const id = hash.slice(1)

    // С Lenis — как раньше (его RAF-цикл иначе тут же перебивает нативный
    // скролл). Без Lenis (тач, см. useIsTouch/SmoothScrollProvider) — обычный
    // window.scrollTo; target уже включает offset и scroll-margin-top.
    const applyScroll = (target: number) => {
      if (lenis) {
        // Lenis кеширует высоту документа: сразу после навигации limit ещё от
        // прежней страницы, и scrollTo клампит цель до него. Пересчитываем
        // размеры перед каждой попыткой.
        lenis.resize()
        lenis.scrollTo(target, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: target, behavior: 'instant' })
      }
    }

    let i = 0
    let lastTarget: number | null = null
    let timer = 0
    let fadeTimer = 0

    const settle = () => {
      setFaded(true)
      // убрать оверлей после transition-opacity (300мс) с небольшим запасом
      fadeTimer = window.setTimeout(() => setCover(false), 400)
    }

    const max = () => document.documentElement.scrollHeight - window.innerHeight

    // Карточка практики (id="practice-<slug>") едет не в обычном вертикальном
    // потоке, а горизонтально внутри GSAP pin-scroll коллажа (PracticesSection):
    // scrollTrigger 'practices-collage' линейно маппит вертикальный скролл
    // документа на x-сдвиг трека #practices-track (1px скролла = 1px x).
    // Зная это, можно вычислить нужный scrollY без прогресса/labels:
    //   1) снять «статичную» (без текущего x) позицию карточки в треке,
    //   2) подобрать scrollY так, чтобы после соответствующего x карточка
    //      встала по центру viewport.
    // Пока motion разрешён и пин десктопный — это точнее, чем scrollIntoView,
    // который в pinned-секции не работает (документ не двигается синхронно
    // с видимой позицией карточки). Если пин ещё не создан (отключён
    // reduced-motion/мобильной шириной) — падаем на обычный якорь по id карточки.
    const resolvePracticeTarget = (card: HTMLElement): number => {
      const st = ScrollTrigger.getById('practices-collage')
      const track = document.getElementById('practices-track')
      if (st && track && Number.isFinite(st.start) && Number.isFinite(st.end) && st.end > st.start) {
        const currentX = Number(gsap.getProperty(track, 'x')) || 0
        const cardRect = card.getBoundingClientRect()
        const pinRect = (st.trigger as HTMLElement).getBoundingClientRect()
        const cardStaticLeft = cardRect.left - currentX - pinRect.left
        const desiredViewportLeft = (window.innerWidth - cardRect.width) / 2
        const desired = st.start + (cardStaticLeft - desiredViewportLeft)
        return Math.max(0, Math.min(Math.max(st.start, Math.min(desired, st.end)), max()))
      }
      // Фолбэк: пина нет (мобайл/reduced-motion) — карточка в обычном потоке
      const scrollMargin = parseFloat(getComputedStyle(card).scrollMarginTop) || 0
      const desired = card.getBoundingClientRect().top + window.scrollY - scrollMargin
      return Math.max(0, Math.min(desired, max()))
    }

    // Общий якорь (секции, карточки кейсов): элемент стоит в обычном потоке.
    const resolveGenericTarget = (el: HTMLElement): number => {
      // Карточку кейса — примерно в центр экрана (offset поднимает её
      // вверх); секции — ровно к их верху
      const offset = id.startsWith('case-') ? -window.innerHeight * 0.28 : 0
      // Lenis (как и нативный якорный скролл) учитывает scroll-margin-top
      // элемента (scroll-mt-[30dvh] у карточек) — повторяем в расчёте цели
      const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      const desired =
        el.getBoundingClientRect().top + window.scrollY - scrollMargin + offset
      return Math.max(0, Math.min(desired, max()))
    }

    const go = () => {
      const el = document.getElementById(id)
      if (el) {
        const target = id.startsWith('practice-')
          ? resolvePracticeTarget(el)
          : resolveGenericTarget(el)
        applyScroll(target)
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
