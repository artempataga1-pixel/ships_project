'use client'

import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { SEG_DURATION, STEP_NAV_ID, STORY_STEP_EVENT } from './useStoryController'

export const STEP_COUNT = 4
export const LAST_STEP = 3

// Сколько пикселей скролла тратится на 1 секунду видео — стартовая точка,
// тюнится по факту плавности (см. план, верификация: throttled CPU/сеть).
const PX_PER_SECOND = 170

// Полуширина окна кроссфейда оверлея вокруг границы полки, доля от общей
// длины пути (0..1) — 0.04 с каждой стороны даёт ~8% суммарно.
const OVERLAY_HALF_WINDOW = 0.04

// Доля прогресса внутри сегмента, после которой подгружается src следующего
// видео (последние ~28% сегмента — «на подходе» к границе).
const PRELOAD_NEXT_THRESHOLD = 0.72

// Эпсилон записи currentTime — не дёргать видео на суб-фреймовых дельтах
// почти неподвижного скролла (см. план, этап 2, п.2).
const CURRENT_TIME_EPSILON = 1 / 30

export const VIDEO_SRC_MOBILE = [
  '/video/story1-mobile.mp4',
  '/video/story2-mobile.mp4',
  '/video/story3-mobile.mp4',
]

type ScrubWindow = Window & {
  __mobileScrubActive?: boolean
  __mobileScrubTrigger?: ScrollTrigger
  __mobileScrubBoundaries?: number[]
}

// Смонтирован ли мобильный скраб-контроллер — используется MobileBottomNav,
// чтобы решить, перехватывать ли клик по пункту меню программным scrollTo.
// НЕ то же самое, что isStoryActive() десктопа: там флаг означает «ввод
// залочен», здесь скролл всегда нативный, флаг только маркирует наличие пина.
export function isMobileScrubActive(): boolean {
  return typeof window !== 'undefined' && !!(window as ScrubWindow).__mobileScrubActive
}

interface LenisLike {
  scrollTo: (target: number, options?: Record<string, unknown>) => void
}

// Клик по пункту меню (about/competencies/partners) внутри мобильного
// скраба: обычный scrollTo к границе нужной полки внутри пина — дальше
// видео примет нужный кадр само через onUpdate (не мгновенный прыжок кадра,
// как десктопный STORY_GOTO_EVENT). На тач-устройствах SmoothScrollProvider
// не монтирует Lenis (useIsTouch) — там native window.scrollTo достаточен.
// Но MOBILE_SCRUB_MEDIA завязан только на ширину, не на touch: на нетач-
// устройстве с узким окном Lenis смонтирован и на каждом RAF-тике откатывает
// scrollY назад к своей внутренней позиции — native scrollTo без lenis.scrollTo
// в этом случае немедленно перебивается (та же причина, по которой
// useStoryController всюду зовёт lenis?.scrollTo, а не window.scrollTo).
export function scrollToMobileScrubStep(step: number, lenis?: LenisLike | null) {
  if (typeof window === 'undefined') return
  const w = window as ScrubWindow
  const trigger = w.__mobileScrubTrigger
  const boundaries = w.__mobileScrubBoundaries
  if (!trigger || !boundaries) return
  const total = boundaries[boundaries.length - 1]
  if (total <= 0) return
  const clamped = Math.max(0, Math.min(step, LAST_STEP))
  const frac = boundaries[clamped] / total
  const y = trigger.start + (trigger.end - trigger.start) * frac
  if (lenis) {
    lenis.scrollTo(y)
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export interface MobileScrubRefs {
  wrapperRef: React.RefObject<HTMLElement | null>
  videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>
  // overlayRefs[0..3] = hero · about · competencies(compact) · partners(compact)
  overlayRefs: React.MutableRefObject<(HTMLElement | null)[]>
  active: boolean // готов к активации: смонтирован в scrub-режиме + первый сегмент готов
}

export function useMobileScrubController({ wrapperRef, videoRefs, overlayRefs, active }: MobileScrubRefs) {
  useEffect(() => {
    if (!active) return
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const videos = videoRefs.current
    const overlays = overlayRefs.current
    // segments[0] уже имеет src в разметке (preload="metadata"), 1 и 2 — нет
    const srcAssigned = [true, false, false]

    let boundaries = cumulative(segWeights(videos))
    const syncBoundaries = () => {
      ;(window as ScrubWindow).__mobileScrubBoundaries = boundaries
    }
    syncBoundaries()

    // Реальная длительность видео может доехать позже фолбэка — пересчитываем
    // границы пути и просим ScrollTrigger переизмерить дистанцию пина.
    const onLoadedMeta = () => {
      boundaries = cumulative(segWeights(videos))
      syncBoundaries()
      ScrollTrigger.refresh()
    }
    videos.forEach((v) => v?.addEventListener('loadedmetadata', onLoadedMeta))

    let lastSeg = -1
    let lastStep = -1

    const applyOverlay = (el: HTMLElement | null, alpha: number) => {
      if (!el) return
      el.style.opacity = String(alpha)
      el.style.visibility = alpha > 0.02 ? 'visible' : 'hidden'
    }

    const activateVideo = (seg: number) => {
      if (seg === lastSeg) return
      lastSeg = seg
      videos.forEach((v, i) => {
        if (v) v.style.opacity = i === seg ? '1' : '0'
      })
    }

    // Домотка src сегментов 0..seg на случай прыжка навигацией (клик по
    // MobileBottomNav) мимо естественного скролла, где «подгрузка на подходе»
    // ниже ещё не успела сработать.
    const ensureSrcUpTo = (seg: number) => {
      for (let i = 1; i <= seg; i++) {
        if (srcAssigned[i]) continue
        const v = videos[i]
        if (v) {
          v.src = VIDEO_SRC_MOBILE[i]
          srcAssigned[i] = true
        }
      }
    }

    const trigger = ScrollTrigger.create({
      id: 'mobile-scrub',
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${boundaries[boundaries.length - 1] * PX_PER_SECOND}`,
      pin: true,
      scrub: 0.15,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const total = boundaries[boundaries.length - 1]
        const scrollTime = self.progress * total
        const step = stepForScrollTime(scrollTime, boundaries)
        const seg = Math.min(step, LAST_STEP - 1)

        ensureSrcUpTo(seg)
        activateVideo(seg)

        const segStart = boundaries[seg]
        const segWeight = boundaries[seg + 1] - segStart
        const localT = gsap.utils.clamp(0, segWeight, scrollTime - segStart)

        const v = videos[seg]
        if (v) {
          const dur = v.duration || segWeight
          const target = Math.max(0, Math.min(localT, dur - 0.03))
          if (Math.abs(v.currentTime - target) > CURRENT_TIME_EPSILON) {
            try {
              v.currentTime = target
            } catch {}
          }
        }

        // Подгрузка src следующего сегмента на подходе к концу текущего
        if (seg < LAST_STEP - 1 && !srcAssigned[seg + 1] && localT / segWeight >= PRELOAD_NEXT_THRESHOLD) {
          const nextV = videos[seg + 1]
          if (nextV) {
            nextV.src = VIDEO_SRC_MOBILE[seg + 1]
            srcAssigned[seg + 1] = true
          }
        }

        overlays.forEach((el, i) => {
          applyOverlay(el, overlayAlpha(scrollTime, total, boundaries[i]))
        })

        if (step !== lastStep) {
          lastStep = step
          window.dispatchEvent(
            new CustomEvent(STORY_STEP_EVENT, { detail: { step, id: STEP_NAV_ID[step] } }),
          )
        }
      },
    })

    ;(window as ScrubWindow).__mobileScrubActive = true
    ;(window as ScrubWindow).__mobileScrubTrigger = trigger
    activateVideo(0)
    overlays.forEach((el, i) => applyOverlay(el, i === 0 ? 1 : 0))

    return () => {
      ;(window as ScrubWindow).__mobileScrubActive = false
      ;(window as ScrubWindow).__mobileScrubTrigger = undefined
      videos.forEach((v) => v?.removeEventListener('loadedmetadata', onLoadedMeta))
      trigger.kill()
    }
  }, [active, wrapperRef, videoRefs, overlayRefs])
}

function segWeights(videos: (HTMLVideoElement | null)[]): number[] {
  return videos.map((v, i) =>
    v && Number.isFinite(v.duration) && v.duration > 0 ? v.duration : SEG_DURATION[i],
  )
}

function cumulative(weights: number[]): number[] {
  const out = [0]
  for (const w of weights) out.push(out[out.length - 1] + w)
  return out
}

// Шаг = наибольший индекс границы, которую scrollTime уже достиг — совпадает
// с моментом полного прибытия на полку, а не с серединой сегмента.
function stepForScrollTime(scrollTime: number, boundaries: number[]): number {
  for (let k = boundaries.length - 1; k >= 0; k--) {
    if (scrollTime >= boundaries[k] - 1e-6) return k
  }
  return 0
}

function overlayAlpha(scrollTime: number, total: number, boundary: number): number {
  const halfWindow = OVERLAY_HALF_WINDOW * total
  if (halfWindow <= 0) return 0
  const d = Math.abs(scrollTime - boundary)
  return Math.max(0, 1 - d / halfWindow)
}
