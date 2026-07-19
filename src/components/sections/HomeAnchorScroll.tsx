'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import { NAV_ID_TO_STEP, isStoryActive } from '@/components/hero/useStoryController'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// useLayoutEffect на сервере даёт warning — на SSR подменяем на useEffect
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/* Довозит скролл до цели для якорей главной — в двух режимах:

   1) ПОЛНАЯ ЗАГРУЗКА страницы с хэшем в URL (переход с другой страницы —
      /#practices, /#articles, /#cases, /#contacts, /#case-<slug>,
      /#practice-<slug>, а на мобиле ещё и /#about, /#competencies, /#partners,
      см. isHandledHash). Браузер мгновенно скроллит к якорю ещё по ранней
      flow-разметке, затем на десктопе ScrollStory апгрейдится до story и пины
      (Практики/Статьи) добавляют spacer-высоту — секции уезжают, и вьюпорт
      оказывается на чужом блоке. Пока раскладка устаканивается, страница
      закрыта фоновым оверлеем; каждая попытка ставит скролл заново, и как
      только позиция цели перестаёт меняться — оверлей растворяется.

   2) КЛИК ПО ЯКОРЮ НА УЖЕ ОТКРЫТОЙ ГЛАВНОЙ (нижняя мобильная навигация,
      «Связаться» и т.п.) — это обычная <a href="/#id">, при клике на той же
      странице браузер делает only-fragment-навигацию (не полную загрузку),
      этот компонент не перемонтируется, и без отдельного 'hashchange'-
      слушателя коррекция вообще не применяется — только нативный скролл
      браузера, который для секций с нестандартной внутренней структурой
      (например «Контакты» — сверху фото-баннер) промахивается. Тут оверлей
      не нужен (пользователь и так смотрит на страницу, чужой блок мигать не
      должен) — просто пара тихих корректирующих scrollTo поверх нативного.

   Почему через Lenis API, а не scrollIntoView: нативный скролл Lenis тут же
   перебивает своим RAF-циклом (лерпит обратно к targetScroll=0), поэтому
   позиционируем через lenis.scrollTo — он согласованно ставит и target, и
   animated scroll. force:true — потому что SmoothScrollProvider на смене
   страницы останавливает Lenis на ~350мс. */

// Моменты попыток от старта, мс (режим 1 — полная загрузка). Первая — сразу;
// хвост страхует поздние сдвиги раскладки (шрифты/видео) при полной загрузке.
const DELAYS = [0, 120, 260, 420, 620, 900, 1150]

// Моменты попыток для режима 2 (клик на открытой странице) — раскладка уже
// стабильна, нужно только перебить нативный смус-скролл браузера.
const QUICK_DELAYS = [0, 120, 300]

// Хэш вида «#id», который обслуживает этот компонент. Полки стори
// (about/competencies/partners) и hero сюда не входят, ПОКА стори жива
// (десктоп, motion разрешён) — ими рулит контроллер стори (запертый старт
// на нужном шаге). На мобиле/reduced-motion контроллер стори не монтируется
// вообще — там эти три полки такие же обычные секции потока, как остальные,
// и без этого компонента переход к ним по нижней навигации ничем не
// корректируется.
function isHandledHash(hash: string): boolean {
  if (!hash.startsWith('#')) return false
  const id = hash.slice(1)
  if (id === '' || id === 'hero') return false
  if (id in NAV_ID_TO_STEP) return !isStoryActive()
  return true
}

export function HomeAnchorScroll() {
  const lenis = useLenis()
  const [cover, setCover] = useState(false) // оверлей смонтирован
  const [faded, setFaded] = useState(false) // оверлей растворяется

  // Оверлей — до первой отрисовки, чтобы чужой блок не мигнул даже на кадр
  useClientLayoutEffect(() => {
    if (isHandledHash(window.location.hash)) setCover(true)
  }, [])

  useEffect(() => {
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

    const max = () => document.documentElement.scrollHeight - window.innerHeight

    // «Контакты» — сверху секции на мобиле фото-баннер (padding-top у
    // .pb-contact__stage), а не сам заголовок. id="contacts" остаётся на всей
    // секции (по нему считает активный пункт нижней навигации — см.
    // useActiveSection), а якорем ПРИЗЕМЛЕНИЯ служит вложенный
    // #contacts-anchor (header .pb-contact__intro, см. ContactsSection).
    // «Контакты»/«Партнёры»/«Компетенции» — секция сама садится под шапку
    // верно (scroll-mt-16), но перед заголовком у неё большой py (дизайнерский
    // «воздух» для десктопного центрирования) — если целиться в край секции,
    // заголовок оказывается заметно ниже верха экрана (не так, как у «Статьи»,
    // где заголовок стоит почти вплотную к краю). Целимся прямо в заголовок.
    const HEADING_ANCHOR: Record<string, string> = {
      contacts: 'contacts-anchor',
      partners: 'partners-heading',
      competencies: 'competencies-heading',
    }
    const getTargetElement = (id: string): HTMLElement | null => {
      const headingId = HEADING_ANCHOR[id]
      if (headingId) {
        return document.getElementById(headingId) ?? document.getElementById(id)
      }
      return document.getElementById(id)
    }

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

    // «О нас» — по просьбе не «к верху», а карточка с текстом по центру
    // экрана (#about-card, см. AboutSection). Единственное исключение из
    // общего «встаёт сверху» — остальные полки (Компетенции/Партнёры/
    // Практики/Кейсы/Статьи) выравниваются к верху через resolveGenericTarget.
    const resolveAboutTarget = (): number | null => {
      const card = document.getElementById('about-card')
      if (!card) return null
      const r = card.getBoundingClientRect()
      const desiredTop = Math.max(0, (window.innerHeight - r.height) / 2)
      const desired = r.top + window.scrollY - desiredTop
      return Math.max(0, Math.min(desired, max()))
    }

    // Общий якорь (секции, карточки кейсов): элемент стоит в обычном потоке.
    const resolveGenericTarget = (el: HTMLElement, id: string): number => {
      // Карточку кейса — примерно в центр экрана (offset поднимает её
      // вверх); секции — ровно к их верху
      const offset = id.startsWith('case-') ? -window.innerHeight * 0.28 : 0
      // Lenis (как и нативный якорный скролл) учитывает scroll-margin-top
      // элемента (scroll-mt-16/scroll-mt-[30dvh]) — повторяем в расчёте цели
      const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      const desired =
        el.getBoundingClientRect().top + window.scrollY - scrollMargin + offset
      return Math.max(0, Math.min(desired, max()))
    }

    const resolveTarget = (id: string, el: HTMLElement): number => {
      if (id.startsWith('practice-')) return resolvePracticeTarget(el)
      if (id === 'about') return resolveAboutTarget() ?? resolveGenericTarget(el, id)
      return resolveGenericTarget(el, id)
    }

    let cancelCurrent: (() => void) | null = null

    // Режим 1 — полная загрузка с хэшем: оверлей + серия попыток, пока
    // раскладка (story-апгрейд, пины) не устаканится.
    const runWithCover = (id: string) => {
      setCover(true)
      setFaded(false)
      let i = 0
      let lastTarget: number | null = null
      let timer = 0
      let fadeTimer = 0

      const settle = () => {
        setFaded(true)
        fadeTimer = window.setTimeout(() => setCover(false), 400)
      }

      const step = () => {
        const el = getTargetElement(id)
        if (el) {
          const target = resolveTarget(id, el)
          applyScroll(target)
          const arrived = Math.abs(window.scrollY - target) < 2
          const stable = lastTarget !== null && Math.abs(target - lastTarget) < 2
          lastTarget = target
          if (arrived && stable && i >= 2) return settle()
        }
        i += 1
        if (i < DELAYS.length) {
          timer = window.setTimeout(step, DELAYS[i] - DELAYS[i - 1])
        } else {
          settle()
        }
      }
      step()

      return () => {
        window.clearTimeout(timer)
        window.clearTimeout(fadeTimer)
      }
    }

    // Режим 2 — клик по якорю на уже открытой странице: без оверлея, только
    // тихая коррекция поверх нативного/Lenis-скролла в несколько заходов
    // (нативный смус-скролл иногда ещё едет к своей неточной цели).
    const runQuiet = (id: string) => {
      let i = 0
      let timer = 0
      const step = () => {
        const el = getTargetElement(id)
        if (el) applyScroll(resolveTarget(id, el))
        i += 1
        if (i < QUICK_DELAYS.length) {
          timer = window.setTimeout(step, QUICK_DELAYS[i] - QUICK_DELAYS[i - 1])
        }
      }
      step()
      return () => window.clearTimeout(timer)
    }

    const run = (hash: string, withCover: boolean) => {
      cancelCurrent?.()
      cancelCurrent = null
      if (!isHandledHash(hash)) {
        setCover(false)
        return
      }
      const id = hash.slice(1)
      cancelCurrent = withCover ? runWithCover(id) : runQuiet(id)
    }

    // Хэш при маунте (полная загрузка/переход с другой страницы)
    run(window.location.hash, true)

    // Клик по «/#id» на уже открытой главной — тот же документ не
    // перемонтируется, отдельно ловим смену фрагмента.
    const onHashChange = () => run(window.location.hash, false)
    window.addEventListener('hashchange', onHashChange)

    return () => {
      cancelCurrent?.()
      window.removeEventListener('hashchange', onHashChange)
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
