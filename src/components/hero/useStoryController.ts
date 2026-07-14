'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { gsap } from '@/lib/gsap'

// ── Модель стори ────────────────────────────────────────────────────────────
// 4 шага-«полки» покоя: 0 Hero · 1 О нас · 2 Компетенции · 3 Партнёры.
// Между полками — 3 видео-сегмента (story1/2/3). Тик скролла вперёд проигрывает
// сегмент обычным play(), тик назад — гонит currentTime в обратную сторону через
// requestAnimationFrame (HTML5-видео не умеет надёжный playbackRate<0).
export const STEP_COUNT = 4
export const LAST_STEP = 3
// id для подсветки навбара (Hero без пункта меню → null)
export const STEP_NAV_ID = [null, 'about', 'competencies', 'partners'] as const
// Длительности сегментов (fallback, если video.duration ещё не готов)
const SEG_DURATION = [8, 8, 10]

// Настройки перехвата ввода
const WHEEL_THRESHOLD = 8 // мин. |deltaY| чтобы счесть за «тик»
const TOUCH_THRESHOLD = 40 // мин. смещение пальца, px
const COOLDOWN_MS = 420 // пауза после шага — гасит инерцию тачпада
const REVERSE_RATE = 1.4 // скорость реверса относительно реального времени
const REACTIVATE_Y = 2 // порог scrollY для реактивации стори при возврате вверх

// «Escape для нетерпеливых»: пока сегмент играет (8–10 с), ввод залочен. Копим
// |дельту| скролла в любую сторону, и как только накопили SKIP_DELTA_THRESHOLD —
// анимация мгновенно домётывается на целевую полку. Считаем именно СУММУ дельт,
// а не количество событий: трекпад шлёт поток мелких deltaY (плюс инерционный
// докат), и по количеству событий он набирал бы «тики» в разы быстрее мыши,
// где один щелчок колеса = одно крупное deltaY. GESTURE_GAP_MS обнуляет
// накопление, если между событиями была пауза — это уже новый жест, а не хвост
// прежнего.
const SKIP_DELTA_THRESHOLD = 960 // ~8 щелчков мыши (по DEFAULT_TICK_MAGNITUDE) — случайный лёгкий скролл не должен скипать
const GESTURE_GAP_MS = 150
const DEFAULT_TICK_MAGNITUDE = 120 // вклад одного «тика» для клавиатуры/тач (нет своего deltaY)

// Кастомные события связи со стори (навбар → контроллер, контроллер → навбар)
export const STORY_STEP_EVENT = 'story:step' // detail: { step, id }
export const STORY_GOTO_EVENT = 'story:goto' // detail: { step }
export const STORY_EXIT_EVENT = 'story:exit' // detail: { id }

// Секция-якорь → шаг стори. Пункты меню ниже (practices…) выходят из стори.
export const NAV_ID_TO_STEP: Record<string, number> = {
  about: 1,
  competencies: 2,
  partners: 3,
}

type StoryWindow = Window & { __storyActive?: boolean }

// Смонтирован ли контроллер стори (десктоп-режим на главной) — навбар решает,
// перехватывать ли клик по пункту меню или пустить обычный переход по href.
export function isStoryActive(): boolean {
  return typeof window !== 'undefined' && !!(window as StoryWindow).__storyActive
}

export interface StoryRefs {
  wrapperRef: React.RefObject<HTMLElement | null>
  videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>
  // overlayRefs[0..3] = hero · about · competencies · partners
  overlayRefs: React.MutableRefObject<(HTMLElement | null)[]>
  active: boolean // стори-режим включён (десктоп без reduced-motion)
}

export function useStoryController({ wrapperRef, videoRefs, overlayRefs, active }: StoryRefs) {
  const lenis = useLenis()

  useEffect(() => {
    if (!active) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const videos = videoRefs.current
    const overlays = overlayRefs.current

    // Внутреннее состояние контроллера (в замыкании эффекта)
    const st = {
      step: 0,
      busy: false, // идёт проигрыш сегмента — ввод игнорируется
      released: false, // стори отпущена, дальше обычный скролл
      leftStory: false, // страница реально уехала вниз от стори (защита relock)
      cooldown: false,
      raf: 0,
      // Форс-финиш текущей анимации (прыжок на её целевую полку) + накопитель скипа
      forceFinish: null as null | (() => void),
      skipAccum: 0,
      lastTickAt: 0,
    }

    // ── Помощники отображения ──────────────────────────────────────────────
    // Показать оверлей idx, спрятать остальные (instant — без анимации)
    const showOnly = (idx: number, instant = false) => {
      overlays.forEach((el, i) => {
        if (!el) return
        gsap.to(el, {
          autoAlpha: i === idx ? 1 : 0,
          duration: instant ? 0 : 0.6,
          ease: 'power2.out',
          overwrite: true,
        })
      })
    }
    // Спрятать все текстовые оверлеи (на время проигрыша — чистое видео)
    const hideAll = () => {
      overlays.forEach((el) => {
        if (el) gsap.to(el, { autoAlpha: 0, duration: 0.3, overwrite: true })
      })
    }
    // Какой видео-слой сверху (кадры на стыках совпадают → переключение незаметно)
    const activateVideo = (idx: number) => {
      videos.forEach((v, i) => {
        if (v) v.style.opacity = i === idx ? '1' : '0'
      })
    }
    const segDuration = (seg: number) => videos[seg]?.duration || SEG_DURATION[seg]

    const emitStep = (step: number) => {
      window.dispatchEvent(
        new CustomEvent(STORY_STEP_EVENT, { detail: { step, id: STEP_NAV_ID[step] } }),
      )
    }
    const armCooldown = () => {
      st.cooldown = true
      window.setTimeout(() => {
        st.cooldown = false
      }, COOLDOWN_MS)
    }

    // Прыжок currentTime — это асинхронный seek/decode, не мгновенная операция.
    // При частых форс-финишах (быстрый активный скролл) overlay открывался
    // раньше, чем видео реально дорисовывало нужный кадр → текст новой полки
    // повисал на старом/чужом фоне. Ждём 'seeked' (с таймаутом-предохранителем
    // на случай, если currentTime уже совпадал и событие не пришло).
    const SEEK_TIMEOUT_MS = 250
    const afterSeek = (v: HTMLVideoElement, targetTime: number, cb: () => void) => {
      let done = false
      const onSeeked = () => settle()
      const settle = () => {
        if (done) return
        done = true
        v.removeEventListener('seeked', onSeeked)
        clearTimeout(timer)
        cb()
      }
      v.addEventListener('seeked', onSeeked)
      const timer = window.setTimeout(settle, SEEK_TIMEOUT_MS)
      try {
        v.currentTime = targetTime
      } catch {
        settle()
      }
    }

    // ── Переходы ────────────────────────────────────────────────────────────
    // Вперёд: сегмент seg (= текущий шаг) играет 0 → конец нативным play()
    const playForward = (seg: number) => {
      const v = videos[seg]
      if (!v) return
      st.busy = true
      st.skipAccum = 0
      hideAll()
      activateVideo(seg)
      v.pause()
      try {
        v.currentTime = 0
      } catch {}
      // Завершение сегмента: showOnly полки seg+1. jump=true — форс-домотка кадра
      // в конец (при прыжке по SKIP_DELTA_THRESHOLD / блокировке автоплея),
      // иначе видео уже там. Reveal ждёт реального кадра — иначе при jump текст
      // новой полки покажется раньше, чем видео доедет до нужного места.
      const finish = (jump: boolean) => {
        v.removeEventListener('ended', onEnd)
        v.pause()
        const reveal = () => {
          st.step = seg + 1
          showOnly(st.step)
          emitStep(st.step)
          armCooldown()
          st.busy = false
          st.forceFinish = null
        }
        if (jump) {
          afterSeek(v, segDuration(seg) - 0.05, reveal)
        } else {
          reveal()
        }
      }
      const onEnd = () => finish(false)
      st.forceFinish = () => finish(true)
      v.addEventListener('ended', onEnd)
      v.play().catch(() => {
        // Если браузер заблокировал автоплей — просто прыгаем в конец сегмента
        finish(true)
      })
    }

    // Назад: сегмент fromStep-1 гоним от конца к 0 через rAF
    const playReverse = (fromStep: number) => {
      const seg = fromStep - 1
      const v = videos[seg]
      if (!v) return
      st.busy = true
      st.skipAccum = 0
      hideAll()
      activateVideo(seg)
      v.pause()
      const dur = segDuration(seg)
      try {
        v.currentTime = dur - 0.05
      } catch {}
      // Завершение реверса: кадр 0, полка seg. Вызывается из rAF при t<=0 либо
      // форс-финишем по SKIP_DELTA_THRESHOLD. Reveal — только после реального
      // seek к 0 (при форс-финише currentTime может быть далеко от 0).
      const finish = () => {
        cancelAnimationFrame(st.raf)
        afterSeek(v, 0, () => {
          st.step = seg
          showOnly(st.step)
          emitStep(st.step)
          armCooldown()
          st.busy = false
          st.forceFinish = null
        })
      }
      st.forceFinish = finish
      let last = performance.now()
      const frame = (now: number) => {
        const dt = (now - last) / 1000
        last = now
        const t = v.currentTime - dt * REVERSE_RATE
        if (t <= 0) {
          finish()
          return
        }
        try {
          v.currentTime = t
        } catch {}
        st.raf = requestAnimationFrame(frame)
      }
      st.raf = requestAnimationFrame(frame)
    }

    // Отпустить стори — дальше обычный скролл. target — id секции для scrollTo.
    const exitTo = (targetId = 'practices') => {
      st.released = true
      st.leftStory = false // взведётся, когда страница отъедет от стори вниз
      lenis?.start()
      const el = document.getElementById(targetId)
      if (el) lenis?.scrollTo(el, { offset: 0 })
      else lenis?.scrollTo(window.innerHeight)
    }

    // Реактивация стори при возврате скроллом вверх (на финальном шаге)
    const relock = () => {
      st.released = false
      st.leftStory = false
      lenis?.scrollTo(0, { immediate: true })
      lenis?.stop()
      st.step = LAST_STEP
      const seg = LAST_STEP - 1
      activateVideo(seg)
      const v = videos[seg]
      if (v) {
        v.pause()
        try {
          v.currentTime = segDuration(seg) - 0.05
        } catch {}
      }
      showOnly(LAST_STEP, true)
      emitStep(LAST_STEP)
    }

    // Тик во время проигрыша: копим сумму |deltaY|, при достижении порога — форс-финиш.
    const countSkipTick = (magnitude: number) => {
      if (!st.forceFinish) return
      const now = performance.now()
      if (now - st.lastTickAt > GESTURE_GAP_MS) {
        st.skipAccum = 0 // пауза между событиями — это новый жест, старое не считаем
      }
      st.lastTickAt = now
      st.skipAccum += magnitude
      if (st.skipAccum >= SKIP_DELTA_THRESHOLD) {
        const finish = st.forceFinish
        st.skipAccum = 0
        st.forceFinish = null // защита от повторного форс-финиша, пока ждём afterSeek
        finish()
      }
    }

    // ── Диспетчер «тика» ────────────────────────────────────────────────────
    const trigger = (dir: number, magnitude = DEFAULT_TICK_MAGNITUDE) => {
      if (st.busy) {
        countSkipTick(magnitude) // залочено проигрышем — но набор SKIP_DELTA_THRESHOLD домотает анимацию
        return
      }
      if (st.cooldown) return
      if (dir > 0) {
        if (st.step < LAST_STEP) playForward(st.step)
        else exitTo('practices')
      } else if (st.step > 0) {
        playReverse(st.step)
      }
    }

    // ── Перехват ввода ──────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      if (st.released) return // отпущено — скроллит Lenis
      e.preventDefault()
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return
      trigger(e.deltaY > 0 ? 1 : -1, Math.abs(e.deltaY))
    }
    const onKey = (e: KeyboardEvent) => {
      if (st.released) return
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault()
        trigger(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        trigger(-1)
      }
    }
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (st.released) return
      e.preventDefault()
      const dy = touchY - (e.touches[0]?.clientY ?? 0)
      if (Math.abs(dy) < TOUCH_THRESHOLD) return
      touchY = e.touches[0]?.clientY ?? 0
      trigger(dy > 0 ? 1 : -1, Math.abs(dy))
    }

    // Guard: пока стори не отпущена — держим страницу на 0 (гасим случайный
    // старт Lenis, в т.ч. отложенный start() из SmoothScrollProvider). После
    // выхода — ловим возврат к верху для реактивации.
    const onLenisScroll = (e: { scroll: number }) => {
      const y = e?.scroll ?? window.scrollY
      if (!st.released) {
        if (y > 1) {
          lenis?.scrollTo(0, { immediate: true })
          lenis?.stop()
        }
      } else {
        // Реактивируем стори только после того, как страница реально отъехала
        // вниз (иначе первое scroll-событие exitTo с y≈0 сразу вернуло бы назад).
        if (y > window.innerHeight * 0.5) st.leftStory = true
        if (st.leftStory && y <= REACTIVATE_Y) relock()
      }
    }

    // ── Навигация из меню ───────────────────────────────────────────────────
    const onGoto = (e: Event) => {
      const target = (e as CustomEvent<{ step: number }>).detail.step
      cancelAnimationFrame(st.raf)
      st.busy = false
      st.forceFinish = null
      st.skipAccum = 0
      if (st.released) {
        st.released = false
        st.leftStory = false
        lenis?.scrollTo(0, { immediate: true })
        lenis?.stop()
      }
      st.step = target
      if (target === 0) {
        activateVideo(0)
        const v = videos[0]
        if (v) {
          v.pause()
          try {
            v.currentTime = 0
          } catch {}
        }
      } else {
        const seg = target - 1
        activateVideo(seg)
        const v = videos[seg]
        if (v) {
          v.pause()
          try {
            v.currentTime = segDuration(seg) - 0.05
          } catch {}
        }
      }
      showOnly(target, true)
      emitStep(target)
    }
    const onExit = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail.id
      cancelAnimationFrame(st.raf)
      st.busy = false
      st.forceFinish = null
      st.skipAccum = 0
      st.step = LAST_STEP
      showOnly(LAST_STEP, true)
      emitStep(LAST_STEP)
      exitTo(id)
    }

    // ── Инициализация ───────────────────────────────────────────────────────
    // Флаг для навбара: стори жива → клики по story-пунктам перехватываются
    ;(window as StoryWindow).__storyActive = true
    lenis?.stop()
    activateVideo(0)
    showOnly(0, true)
    emitStep(0)

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener(STORY_GOTO_EVENT, onGoto)
    window.addEventListener(STORY_EXIT_EVENT, onExit)
    lenis?.on('scroll', onLenisScroll)

    return () => {
      ;(window as StoryWindow).__storyActive = false
      cancelAnimationFrame(st.raf)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener(STORY_GOTO_EVENT, onGoto)
      window.removeEventListener(STORY_EXIT_EVENT, onExit)
      lenis?.off('scroll', onLenisScroll)
      lenis?.start()
    }
  }, [active, lenis, wrapperRef, videoRefs, overlayRefs])
}
