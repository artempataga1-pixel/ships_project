'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { gsap } from '@/lib/gsap'

// ── Модель стори ────────────────────────────────────────────────────────────
// 4 шага-«полки» покоя: 0 Hero · 1 О нас · 2 Компетенции · 3 Партнёры.
// Между полками — 3 видео-сегмента (story1/2/3). Тик скролла гонит currentTime
// сегмента через requestAnimationFrame — вперёд и назад одинаково. Нативный
// play() с playbackRate стоял только на движении вперёд и фризил на маках
// (1080p × 2.7 ≈ 64 fps декода), поэтому механизм оставлен один — скраб.
export const STEP_COUNT = 4
export const LAST_STEP = 3
// id для подсветки навбара (Hero без пункта меню → null)
export const STEP_NAV_ID = [null, 'about', 'competencies', 'partners'] as const
// Длительности сегментов (fallback, если video.duration ещё не готов).
// Мобильная сцена — те же 3 сегмента (свои 720p-файлы), тот же fallback.
export const SEG_DURATION = [8, 8, 10]

// Настройки перехвата ввода
const WHEEL_THRESHOLD = 8 // мин. |deltaY| чтобы счесть за «тик»
const TOUCH_THRESHOLD = 40 // мин. смещение пальца, px
const COOLDOWN_MS = 420 // пауза после шага — гасит инерцию тачпада
const REACTIVATE_Y = 2 // порог scrollY для реактивации стори при возврате вверх

// Темп проигрыша: любой сегмент нормируется скоростью скраба
// (rate = длительность сегмента / целевые секунды), само видео не режется. Обычный тик — полный сегмент за NORMAL_SECONDS.
// «Escape для нетерпеливых»: если во время проигрыша пользователь крутит ещё —
// не обрываем анимацию прыжком в конец (выглядело рвано), а плавно ускоряем
// проигрыш до темпа «весь сегмент за FAST_SECONDS» — остаток долетает быстро,
// но кадры идут подряд, без телепорта.
const NORMAL_SECONDS = 3 // полный сегмент в спокойном режиме
const FAST_SECONDS = 1.5 // полный сегмент в ускоренном режиме (скип)
// Порог ускорения — сумма |deltaY| во время проигрыша (та же чувствительность,
// что была у старого скипа-обрыва). Считаем СУММУ дельт, а не число событий:
// трекпад шлёт поток мелких deltaY, по количеству событий он «кликал» бы
// в разы быстрее мыши. GESTURE_GAP_MS обнуляет накопление после паузы —
// это уже новый жест, а не хвост прежнего.
const SPEEDUP_DELTA_THRESHOLD = 640
const GESTURE_GAP_MS = 260 // терпимее к естественному темпу кручения колеса (не только к free-spin)
const DEFAULT_TICK_MAGNITUDE = 120 // вклад одного «тика» для клавиатуры/тач (нет своего deltaY)

// Кастомные события связи со стори (навбар → контроллер, контроллер → навбар)
export const STORY_STEP_EVENT = 'story:step' // detail: { step, id }
export const STORY_GOTO_EVENT = 'story:goto' // detail: { step }
export const STORY_EXIT_EVENT = 'story:exit' // detail: { id }
// Идёт ли проигрыш сегмента — для плашки «Нажмите, чтобы пропустить»
export const STORY_BUSY_EVENT = 'story:busy' // detail: { busy }
// Кнопка «Нажмите, чтобы пропустить» → прыжок в конец текущего сегмента
export const STORY_SKIP_EVENT = 'story:skip'

// Сколько ждать метаданные несгруженного сегмента, прежде чем открыть полку
// без анимации (StoryOptions.skipIfNotReady)
const READY_WAIT_MS = 800

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

// Клик по «сырому» <a href="/#id"> вне навбара (CTA «Связаться»/«Обсудить
// задачу»): пока стори жива, голый клик перехватывает сам Lenis (anchors:true
// в SmoothScrollProvider) и дёргает scrollTo мимо контроллера — guard
// onLenisScroll в useStoryController откатывает скролл к 0 и стопит Lenis
// (isStopped), а start() после этого никто не вызывает (его дают только
// exitTo/relock/onGoto) — Lenis остаётся мёртвым, ломая весь дальнейший
// скролл, включая логотип и пункты меню. Здесь — тот же мягкий выход через
// STORY_EXIT_EVENT, что уже использует LimelightNav для пунктов ниже стори.
export function handleStoryAwareAnchorClick(e: React.MouseEvent, id: string) {
  if (!isStoryActive()) return
  e.preventDefault()
  window.dispatchEvent(new CustomEvent(STORY_EXIT_EVENT, { detail: { id } }))
}

// Клик по пункту меню вида «/#id» (нижнее мобильное меню, футер), пока стори
// жива: полки стори — мгновенный прыжок на шаг, секции ниже — мягкий выход.
// Та же логика, что у LimelightNav. Вне стори — обычный переход по href.
export function handleStoryNavClick(e: React.MouseEvent, href: string) {
  if (!isStoryActive()) return
  const id = href.split('#')[1]
  if (!id) return
  e.preventDefault()
  if (id in NAV_ID_TO_STEP) {
    window.dispatchEvent(new CustomEvent(STORY_GOTO_EVENT, { detail: { step: NAV_ID_TO_STEP[id] } }))
  } else {
    window.dispatchEvent(new CustomEvent(STORY_EXIT_EVENT, { detail: { id } }))
  }
}

// Отличия мобильного режима (<1280px). Без опций — десктопное поведение.
export interface StoryOptions {
  // Полный сегмент за столько секунд (десктоп — NORMAL_SECONDS)
  normalSeconds?: number
  // Пропуск анимации — только кнопкой (STORY_SKIP_EVENT). Свайп/колесо во
  // время проигрыша ничего не делают: ни скипа, ни ускорения, и тот же жест
  // не запускает следующий сегмент после конца (правка заказчицы 14.10.2026)
  skipButton?: boolean
  // Новый currentTime — только когда прошлая перемотка закончилась: iOS иначе
  // копит очередь seek'ов, и кадры идут рывками
  seekGate?: boolean
  // Видео сегмента без метаданных (медленная сеть) — полка сразу, без анимации
  skipIfNotReady?: boolean
}

export interface StoryRefs {
  wrapperRef: React.RefObject<HTMLElement | null>
  videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>
  // overlayRefs[0..3] = hero · about · competencies · partners
  overlayRefs: React.MutableRefObject<(HTMLElement | null)[]>
  active: boolean // стори-режим включён (десктоп без reduced-motion)
  options?: StoryOptions
}

export function useStoryController({ wrapperRef, videoRefs, overlayRefs, active, options }: StoryRefs) {
  const normalSeconds = options?.normalSeconds ?? NORMAL_SECONDS
  const skipButton = !!options?.skipButton
  const seekGate = !!options?.seekGate
  const skipIfNotReady = !!options?.skipIfNotReady
  const lenis = useLenis()

  // videoRefs/overlayRefs приходят аргументами хука, поэтому React Compiler не
  // признаёт их за refs и считает мутацией пропсов обычную работу с DOM-узлами
  // (play/pause/currentTime). Мутируются только сами элементы, не .current —
  // поведение корректное, правило глушим точечно.
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
      // Форс-финиш текущей анимации (прыжок на её целевую полку) — только для
      // аварийных случаев (блокировка автоплея, переход из меню)
      forceFinish: null as null | (() => void),
      // Ускорение текущей анимации до темпа FAST_SECONDS + накопитель дельты
      speedUp: null as null | (() => void),
      skipAccum: 0,
      lastTickAt: 0,
      // Жест пальца, на котором случился relock, «сгорел»: палец ещё на экране,
      // touchY остался от начала жеста — без флага его продолжение сразу ушло бы
      // в реверс с «Партнёров». Сбрасывается новым touchstart.
      touchSpent: false,
      // Был ли живой ввод: до него соседние сегменты не грузим — не спорим
      // за полосу со шрифтами/JS на старте (мобильные видео ленивые)
      interacted: false,
      // Отмена ожидания загрузки сегмента (playWhenReady)
      cancelWait: null as null | (() => void),
      // Отмена отложенного reveal полки (afterSeek ждёт seeked)
      cancelSeek: null as null | (() => void),
    }

    // Прибить страницу к 0 и заморозить Lenis. Порядок важен: сначала stop()
    // (сбрасывает цель анимации на фактическую позицию), потом scrollTo с force.
    // Наоборот — scrollTo(0) молча выходит, если цель плавной прокрутки уже 0
    // (target === targetScroll), а stop() замораживает страницу на 1–2px.
    const lockAtTop = () => {
      if (lenis) {
        lenis.stop()
        lenis.scrollTo(0, { immediate: true, force: true })
        return
      }
      // Тач без Lenis (iPad Pro в ландшафте — ширина story, но SmoothScrollProvider
      // Lenis не монтирует): нативный мгновенный скролл. scroll-behavior:smooth на
      // таче (globals.css) в WebKit перебивает behavior:'instant' — снимаем его
      // инлайном на время прыжка (см. HomeAnchorScroll)
      const html = document.documentElement
      html.style.scrollBehavior = 'auto'
      window.scrollTo({ top: 0, behavior: 'instant' })
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          html.style.scrollBehavior = ''
        }),
      )
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
    const setBusy = (busy: boolean) => {
      st.busy = busy
      window.dispatchEvent(new CustomEvent(STORY_BUSY_EVENT, { detail: { busy } }))
    }

    // Догрузка сегмента. Мобильная сцена держит src сегментов 1/2 в data-src
    // (preload="none"), первый — с preload="metadata". На десктопе у всех src и
    // preload="auto" — функции ничего не делают.
    // Только назначить отложенный src (true — назначили сейчас)
    const ensureSrc = (seg: number) => {
      const v = videos[seg]
      const lazySrc = v?.dataset.src
      if (!v || !lazySrc || v.getAttribute('src')) return false
      v.src = lazySrc
      v.preload = 'auto'
      v.load()
      return true
    }
    const ensureLoaded = (seg: number) => {
      if (!skipIfNotReady) return
      const v = videos[seg]
      if (!v || ensureSrc(seg)) return
      if (v.preload !== 'auto') v.preload = 'auto'
      // load() — только видео, которое стоит без данных (iOS без жеста не
      // грузит даже метаданные). Уже загруженное он сбросил бы в ноль прямо
      // перед проигрышем, а грузящееся — начал бы качать заново.
      if (v.readyState === 0 && v.networkState !== HTMLMediaElement.NETWORK_LOADING) v.load()
    }
    // На полке step нужны сегмент вперёд (step) и назад (step-1)
    const prepareAround = (step: number) => {
      if (!skipIfNotReady || !st.interacted) return
      if (step < LAST_STEP) ensureLoaded(step)
      if (step > 0) ensureLoaded(step - 1)
    }
    // Поставить кадр сегмента. До метаданных старые iOS теряют currentTime (а
    // load() его сбрасывает), да и длительность ещё запасная — повторяем на
    // loadedmetadata с реальной. Новая постановка или проигрыш этого видео
    // отменяет отложенную.
    const pendingFrame: (null | (() => void))[] = []
    const cancelFrame = (seg: number) => {
      pendingFrame[seg]?.()
      pendingFrame[seg] = null
    }
    const placeFrame = (seg: number, getTime: () => number) => {
      const v = videos[seg]
      if (!v) return
      cancelFrame(seg)
      try {
        v.currentTime = getTime()
      } catch {}
      if (v.readyState >= 1) return
      const onMeta = () => {
        pendingFrame[seg] = null
        try {
          v.currentTime = getTime()
        } catch {}
      }
      v.addEventListener('loadedmetadata', onMeta, { once: true })
      pendingFrame[seg] = () => v.removeEventListener('loadedmetadata', onMeta)
    }
    // Видео сегмента может проигрываться: метаданные есть (длительность и
    // перемотка). Кадры при перемотке браузер дотягивает сам.
    const segReady = (seg: number) => {
      const v = videos[seg]
      return !!v && !!v.getAttribute('src') && v.readyState >= 1
    }
    // Сегмент не готов (медленная сеть) — полка без анимации, мягким fade
    const jumpToShelf = (step: number) => {
      restAt(step, false, false)
      armCooldown()
    }
    // Сегмент не готов: ждём метаданные до READY_WAIT_MS (касание только что
    // разбудило загрузку — на iOS это нормальный случай первого свайпа), потом
    // либо играем, либо сдаёмся на полку сразу. Пока ждём, ввод игнорируется,
    // тап-скип — сразу полка. Отменяется переходом из меню (cancelWait).
    const playWhenReady = (seg: number, dir: 1 | -1) => {
      if (!skipIfNotReady || segReady(seg)) return playSegment(seg, dir)
      const toStep = dir > 0 ? seg + 1 : seg
      const v = videos[seg]
      ensureLoaded(seg)
      st.busy = true
      let done = false
      const stop = () => {
        done = true
        window.clearTimeout(timer)
        v?.removeEventListener('loadedmetadata', onMeta)
        st.busy = false
        st.forceFinish = null
        st.cancelWait = null
      }
      const go = (play: boolean) => {
        if (done) return
        stop()
        if (play && segReady(seg)) playSegment(seg, dir)
        else jumpToShelf(toStep)
      }
      const onMeta = () => go(true)
      v?.addEventListener('loadedmetadata', onMeta)
      const timer = window.setTimeout(() => go(false), READY_WAIT_MS)
      st.forceFinish = () => go(false)
      st.cancelWait = stop
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
    // На мобилке (seekGate) финальная перемотка дольше — iOS тянет кадр сетью.
    const SEEK_TIMEOUT_MS = seekGate ? 600 : 250
    const afterSeek = (v: HTMLVideoElement, targetTime: number, cb: () => void) => {
      let done = false
      const onSeeked = () => settle()
      const cleanupSeek = () => {
        done = true
        v.removeEventListener('seeked', onSeeked)
        clearTimeout(timer)
        if (st.cancelSeek === cleanupSeek) st.cancelSeek = null
      }
      const settle = () => {
        if (done) return
        cleanupSeek()
        cb()
      }
      v.addEventListener('seeked', onSeeked)
      const timer = window.setTimeout(settle, SEEK_TIMEOUT_MS)
      // Переход из меню/выход/размонтирование посреди ожидания — колбэк не
      // должен потом перетереть выбранный шаг
      st.cancelSeek = cleanupSeek
      try {
        v.currentTime = targetTime
      } catch {
        settle()
      }
    }

    // ── Переходы ────────────────────────────────────────────────────────────
    // Вперёд: сегмент seg (= текущий шаг) гоним 0 → конец тем же rAF-скрабом,
    // что и назад. Раньше здесь был нативный play() с playbackRate =
    // segDuration/NORMAL_SECONDS (≈2.7): декодеру приходилось выдавать 1080p
    // на ~64 fps, и на маках это фризило — при этом реверс, идущий скрабом,
    // оставался плавным. Один механизм в обе стороны убирает и расхождение
    // ощущений: вперёд и назад теперь буквально одна и та же математика.
    // Проигрыш сегмента seg в направлении dir (1 — вперёд 0→конец, полка
    // seg+1; -1 — назад конец→0, полка seg). Одна математика в обе стороны.
    const playSegment = (seg: number, dir: 1 | -1) => {
      const v = videos[seg]
      if (!v) return
      setBusy(true)
      st.skipAccum = 0
      hideAll()
      activateVideo(seg)
      v.pause()
      cancelFrame(seg)
      const dur = segDuration(seg)
      // Хвост 0.05с: точный последний кадр браузеры отдают неохотно, а полка
      // всё равно показывается по afterSeek.
      const endTime = dur - 0.05
      const fromTime = dir > 0 ? 0 : endTime
      const toTime = dir > 0 ? endTime : 0
      const toStep = dir > 0 ? seg + 1 : seg
      // Соседи полки назначения начинают грузиться уже сейчас — быстрая серия
      // свайпов не упирается в ожидание загрузки
      prepareAround(toStep)
      try {
        v.currentTime = fromTime
      } catch {}
      // Завершение: полка toStep. Reveal — только после реального кадра в
      // конце, иначе текст новой полки покажется раньше, чем видео туда
      // доедет (заметно при форс-финише из меню и тап-скипе). Однократное:
      // скип может прийти, пока финиш уже ждёт seeked.
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        cancelAnimationFrame(st.raf)
        st.forceFinish = null
        st.speedUp = null
        afterSeek(v, toTime, () => {
          st.step = toStep
          showOnly(st.step)
          emitStep(st.step)
          armCooldown()
          setBusy(false)
          prepareAround(st.step)
        })
      }
      st.forceFinish = finish
      let rate = dur / normalSeconds
      st.speedUp = () => {
        rate = dur / FAST_SECONDS
      }
      // seekGate: позиция идёт по своим часам, а в видео уходит, только когда
      // прошлая перемотка закончилась. Без него — как раньше, от currentTime.
      let clock = fromTime
      let last = performance.now()
      const frame = (now: number) => {
        const dt = (now - last) / 1000
        last = now
        const t = (seekGate ? clock : v.currentTime) + dir * dt * rate
        clock = t
        if (dir > 0 ? t >= endTime : t <= 0) {
          finish()
          return
        }
        if (!seekGate || !v.seeking) {
          try {
            v.currentTime = t
          } catch {}
        }
        st.raf = requestAnimationFrame(frame)
      }
      st.raf = requestAnimationFrame(frame)
    }

    // Вперёд: сегмент seg (= текущий шаг)
    const playForward = (seg: number) => playWhenReady(seg, 1)

    // Назад: сегмент fromStep-1 от конца к 0 в том же темпе
    const playReverse = (fromStep: number) => playWhenReady(fromStep - 1, -1)

    // Отпустить стори — дальше обычный скролл. target — id секции для scrollTo.
    const exitTo = (targetId = 'practices') => {
      st.released = true
      st.leftStory = false // взведётся, когда страница отъедет от стори вниз
      const el = document.getElementById(targetId)
      if (lenis) {
        lenis.start()
        if (el) lenis.scrollTo(el, { offset: 0 })
        else lenis.scrollTo(window.innerHeight)
        return
      }
      // Тач без Lenis: нативный плавный скролл с учётом scroll-margin (как у Lenis)
      const margin = el ? parseFloat(getComputedStyle(el).scrollMarginTop) || 0 : 0
      const top = el ? el.getBoundingClientRect().top + window.scrollY - margin : window.innerHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }

    // Реактивация стори при возврате скроллом вверх (на финальном шаге)
    const relock = () => {
      st.released = false
      st.leftStory = false
      lockAtTop()
      st.step = LAST_STEP
      const seg = LAST_STEP - 1
      ensureSrc(seg)
      activateVideo(seg)
      videos[seg]?.pause()
      placeFrame(seg, () => segDuration(seg) - 0.05)
      showOnly(LAST_STEP, true)
      emitStep(LAST_STEP)
      // Хвост того же жеста (инерция тачпада/колеса) иначе сразу запускал реверс
      // и «Партнёры» проскакивались — гасим так же, как после обычного шага
      armCooldown()
      st.touchSpent = true
    }

    // Тик во время проигрыша: копим сумму |deltaY|, при достижении порога —
    // ускоряем проигрыш до темпа FAST_SECONDS (вместо прежнего резкого обрыва).
    const countSkipTick = (magnitude: number) => {
      if (!st.speedUp) return
      const now = performance.now()
      if (now - st.lastTickAt > GESTURE_GAP_MS) {
        st.skipAccum = 0 // пауза между событиями — это новый жест, старое не считаем
      }
      st.lastTickAt = now
      st.skipAccum += magnitude
      if (st.skipAccum >= SPEEDUP_DELTA_THRESHOLD) {
        const speedUp = st.speedUp
        st.skipAccum = 0
        st.speedUp = null // ускорение однократное — повторные тики уже ничего не меняют
        speedUp()
      }
    }

    // ── Диспетчер «тика» ────────────────────────────────────────────────────
    const trigger = (dir: number, magnitude = DEFAULT_TICK_MAGNITUDE) => {
      if (st.busy) {
        // залочено проигрышем — на десктопе набор SPEEDUP_DELTA_THRESHOLD
        // ускорит анимацию; в режиме кнопки ввод просто игнорируется
        if (!skipButton) countSkipTick(magnitude)
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
      markInteracted()
      if (st.released) return // отпущено — скроллит Lenis
      e.preventDefault()
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return
      trigger(e.deltaY > 0 ? 1 : -1, Math.abs(e.deltaY))
    }
    const onKey = (e: KeyboardEvent) => {
      markInteracted()
      if (st.released) return
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault()
        trigger(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        trigger(-1)
      }
    }
    // Первый живой ввод — пора догружать соседние сегменты
    const markInteracted = () => {
      if (st.interacted) return
      st.interacted = true
      prepareAround(st.step)
    }

    let touchY = 0
    // Начало жеста и его ось — для касаний вне сцены (шапка, нижнее меню):
    // горизонтальный жест отдаём браузеру (меню листается вбок), вертикальный
    // — стори, как и по самой сцене.
    let touchX0 = 0
    let touchY0 = 0
    let touchInScene = true
    let touchAxis: null | 'x' | 'y' = null
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0
      touchX0 = e.touches[0]?.clientX ?? 0
      touchY0 = touchY
      const startTarget = e.target as Node | null
      touchInScene = !!startTarget && wrapper.contains(startTarget)
      touchAxis = null
      st.touchSpent = false
      markInteracted()
    }
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX ?? 0
      const y = e.touches[0]?.clientY ?? 0
      if (st.released) return
      if (!touchInScene) {
        // Ось решаем по первым 8px; до этого не мешаем браузеру
        if (!touchAxis) {
          const dx = Math.abs(x - touchX0)
          const dyAbs = Math.abs(y - touchY0)
          if (Math.max(dx, dyAbs) < 8) return
          touchAxis = dx > dyAbs ? 'x' : 'y'
        }
        if (touchAxis === 'x') return
      }
      // Жест, начатый нативным скроллом (до relock), браузер отменить уже не даёт —
      // preventDefault на нём только сыплет предупреждения в консоль
      if (e.cancelable) e.preventDefault()
      if (st.touchSpent) return
      // Режим кнопки: свайп во время проигрыша не действует, и жест сгорает
      // целиком — иначе, продолжись он после конца сегмента, запустил бы
      // следующий
      if (skipButton && st.busy) {
        st.touchSpent = true
        return
      }
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
        // Порог 1px — под Lenis (его субпиксельный хвост). На таче Lenis нет,
        // и остаток ровно в 1px (ранний якорный скролл до апгрейда) иначе
        // так и висел бы
        if (y > (lenis ? 1 : 0)) lockAtTop()
      } else {
        // Реактивируем стори только после того, как страница реально отъехала
        // вниз (иначе первое scroll-событие exitTo с y≈0 сразу вернуло бы назад).
        if (y > window.innerHeight * 0.5) st.leftStory = true
        if (st.leftStory && y <= REACTIVATE_Y) relock()
      }
    }

    // Кнопка «Нажмите, чтобы пропустить» — конец сегмента и его полка (или
    // полка сразу, если сегмент ещё ждёт загрузки)
    const onSkip = () => {
      if (!skipButton || !st.busy || st.released) return
      st.forceFinish?.()
    }

    // ── Навигация из меню ───────────────────────────────────────────────────
    const onGoto = (e: Event) => {
      const target = (e as CustomEvent<{ step: number }>).detail.step
      cancelAnimationFrame(st.raf)
      st.cancelWait?.()
      st.cancelSeek?.()
      setBusy(false)
      st.forceFinish = null
      st.speedUp = null
      st.skipAccum = 0
      if (st.released) {
        st.released = false
        st.leftStory = false
        lockAtTop()
      }
      restAt(target)
    }
    const onExit = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail.id
      cancelAnimationFrame(st.raf)
      st.cancelWait?.()
      st.cancelSeek?.()
      setBusy(false)
      st.forceFinish = null
      st.speedUp = null
      st.skipAccum = 0
      st.step = LAST_STEP
      showOnly(LAST_STEP, true)
      emitStep(LAST_STEP)
      exitTo(id)
    }

    // ── Инициализация ───────────────────────────────────────────────────────
    // Флаг для навбара: стори жива → клики по story-пунктам перехватываются
    ;(window as StoryWindow).__storyActive = true

    // Поставить стори на полку step без анимации (видео-слой + нужный кадр).
    // silent — не слать story:step: при отпущенном старте (якорь ниже стори)
    // страница стоит на другой секции, и событие с partners зажгло бы лампу
    // навбара над «Партнёрами» — подсветку там должен давать observer секций.
    // instant=false — полка проявляется мягко (сегмент не успел загрузиться).
    const restAt = (step: number, silent = false, instant = true) => {
      st.step = step
      const seg = Math.max(step - 1, 0)
      // Кадр полки нужен сейчас — ленивый сегмент (мобилка) грузим сразу
      ensureSrc(seg)
      activateVideo(seg)
      videos[seg]?.pause()
      placeFrame(seg, () => (step === 0 ? 0 : segDuration(seg) - 0.05))
      showOnly(step, instant)
      if (!silent) emitStep(step)
      prepareAround(step)
    }

    // Загрузка с якорем на секцию НИЖЕ стори (навбар с внутренних страниц,
    // возврат /#case-<slug>): нельзя запирать страницу на нуле — иначе гард
    // onLenisScroll дерётся с HomeAnchorScroll за позицию, колесо перехвачено
    // стори (preventDefault) и страница выглядит мёртвой/разъехавшейся.
    // Стартуем отпущенными на последней полке; вернётся к верху — гард сделает
    // relock как обычно.
    const hashId = window.location.hash.slice(1)
    if (hashId && !(hashId in NAV_ID_TO_STEP) && hashId !== 'hero') {
      st.released = true
      restAt(LAST_STEP, true)
      lenis?.start()
    } else if (hashId && hashId in NAV_ID_TO_STEP) {
      // Якорь на полку самой стори — запертый старт сразу на нужном шаге
      lenis?.stop()
      restAt(NAV_ID_TO_STEP[hashId])
    } else {
      lenis?.stop()
      restAt(0)
    }
    // Тач без Lenis: страница могла остаться не на нуле (восстановление скролла
    // браузером, ранний якорный скролл по flow-разметке до апгрейда) — гард
    // сработает только на следующем scroll-событии, поэтому запираем сразу.
    if (!lenis && !st.released) lockAtTop()

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener(STORY_SKIP_EVENT, onSkip)
    window.addEventListener(STORY_GOTO_EVENT, onGoto)
    window.addEventListener(STORY_EXIT_EVENT, onExit)
    lenis?.on('scroll', onLenisScroll)
    // Без Lenis (тач) гард и реактивацию кормит нативный scroll
    const onNativeScroll = () => onLenisScroll({ scroll: window.scrollY })
    if (!lenis) window.addEventListener('scroll', onNativeScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onNativeScroll)
      ;(window as StoryWindow).__storyActive = false
      cancelAnimationFrame(st.raf)
      st.cancelWait?.()
      st.cancelSeek?.()
      pendingFrame.forEach((_, seg) => cancelFrame(seg))
      if (st.busy) setBusy(false)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener(STORY_SKIP_EVENT, onSkip)
      window.removeEventListener(STORY_GOTO_EVENT, onGoto)
      window.removeEventListener(STORY_EXIT_EVENT, onExit)
      lenis?.off('scroll', onLenisScroll)
      lenis?.start()
    }
  }, [active, lenis, wrapperRef, videoRefs, overlayRefs, normalSeconds, skipButton, seekGate, skipIfNotReady])
}
