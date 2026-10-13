'use client'

import { useEffect, useRef, useState } from 'react'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesOrbitCompact } from '@/components/sections/CompetenciesOrbitCompact'
import { PartnersFlipCompact } from '@/components/sections/PartnersFlipCompact'
import { HeroLayer } from './ScrollStory'
import { NAV_ID_TO_STEP } from './useStoryController'
import { useMobileScrubController, VIDEO_SRC_MOBILE } from './useMobileScrubController'

// Предохранитель: если canplaythrough первого сегмента не пришёл вовремя
// (медленная сеть) — активируем пин всё равно, чтобы страница не зависла
// на постере (аналог SEEK_TIMEOUT_MS десктопа, см. план, этап 4).
const LOAD_TIMEOUT_MS = 2500

// Полки, которые в scrub-режиме живут внутри пина (в flow-разметке — секции)
const SCENE_SELECTOR = '#hero, #about, #competencies, #partners'

// Якорь реально существующей секции/карточки ниже сцены. Мусорный хэш
// (#top, метки рекламы) и id внутри самих полок (#about-card…) не в счёт —
// там человек остаётся на hero, и лоадер должен ждать видео как обычно.
// Зовётся в render-фазе первого рендера сцены: в DOM ещё flow-разметка
// (ScrollStory рендерит FlowFallback до апгрейда), у полок там свои id.
function landsBelowScene(hash: string): boolean {
  const id = hash.slice(1)
  if (!id || Object.prototype.hasOwnProperty.call(NAV_ID_TO_STEP, id)) return false
  const el = document.getElementById(id)
  return !!el && !el.closest(SCENE_SELECTOR)
}

// ══════════════════════════════════════════════════════════════════════════
// MOBILE SCRUB: континуальный scroll-scrub (<1280px, no reduced-motion) —
// видео тянется вместе с пальцем через GSAP ScrollTrigger pin+scrub, без
// перехвата wheel/touch/keydown (скролл нативный). Логика — в контроллере.
// ══════════════════════════════════════════════════════════════════════════
export function MobileScrubScene() {
  const wrapperRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  // overlayRefs[0..3] = hero · about · competencies(compact) · partners(compact)
  const overlayRefs = useRef<(HTMLElement | null)[]>([])
  // Заход по якорю НИЖЕ сцены (/#practice-<slug>, /#case-<slug>, /#cases… —
  // возврат со страниц практик/кейсов): пин активируем сразу, не дожидаясь
  // видео. Его спейсер (~4400px) сдвигает всё, что ниже; на iOS canplaythrough
  // без жеста не приходит, пин вставал только по таймауту через 2.5с — уже
  // после того, как HomeAnchorScroll довёз скролл до карточки, и человек
  // оказывался посреди героя. Героя он в этот момент всё равно не видит, а
  // раскладка становится финальной до посадки. window здесь читать безопасно:
  // сцена монтируется только на клиенте (ScrollStory стартует в режиме flow).
  const [ready, setReady] = useState(() => landsBelowScene(window.location.hash))

  useMobileScrubController({ wrapperRef, videoRefs, overlayRefs, active: ready })

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Апгрейд первого сегмента с preload="metadata" до полной буферизации по
  // первому реальному touch/scroll — не конкурируем со шрифтами/JS-бутстрапом
  // за полосу прямо на пейнте (план, этап 4).
  useEffect(() => {
    const controller = new AbortController()
    const upgrade = () => {
      const v = videoRefs.current[0]
      if (v && v.preload !== 'auto') {
        v.preload = 'auto'
        v.load()
      }
    }
    window.addEventListener('touchstart', upgrade, {
      passive: true,
      once: true,
      signal: controller.signal,
    })
    window.addEventListener('scroll', upgrade, {
      passive: true,
      once: true,
      signal: controller.signal,
    })
    return () => controller.abort()
  }, [])

  return (
    <div className="relative">
      {/* Маркер для FloatingContactFab.useIsOnHero — первый экран пина.
          Абсолютный, вне потока: не влияет на высоту пин-триггера ниже. */}
      <div id="hero" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-dvh" />

      <section ref={wrapperRef} className="relative h-dvh overflow-hidden bg-[var(--color-bg)]">
        {/* Три видео-слоя. Сегмент 0 — src сразу (preload="metadata"), 1 и 2 —
            без src, контроллер подставляет их программно по мере скраба. */}
        {VIDEO_SRC_MOBILE.map((src, i) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            src={i === 0 ? src : undefined}
            poster={i === 0 ? '/video/poster_start.jpg' : undefined}
            muted
            playsInline
            preload={i === 0 ? 'metadata' : 'none'}
            onCanPlayThrough={i === 0 ? () => setReady(true) : undefined}
            className="absolute inset-0 h-full w-full scale-[1.14] object-cover object-center"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}

        {/* z-20 оверлеи — opacity/visibility рулит контроллер по прогрессу скраба */}
        <div
          ref={(el) => {
            overlayRefs.current[0] = el
          }}
          className="absolute inset-0 z-20"
        >
          <HeroLayer ready={ready} />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[1] = el
          }}
          className="absolute inset-0 z-20"
          style={{ visibility: 'hidden' }}
        >
          <AboutSection variant="story" compact />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[2] = el
          }}
          className="absolute inset-0 z-20"
          style={{ visibility: 'hidden' }}
        >
          <CompetenciesOrbitCompact />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[3] = el
          }}
          className="absolute inset-0 z-20"
          style={{ visibility: 'hidden' }}
        >
          <PartnersFlipCompact />
        </div>

        {/* Лоадер до готовности (canplaythrough/таймаут) — тот же паттерн, что у StoryScene */}
        <div
          className={`absolute inset-0 z-[60] grid place-items-center bg-[var(--color-bg)] transition-opacity duration-700 ${
            ready ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <span className="block h-px w-24 overflow-hidden bg-black/10">
              <span className="block h-full w-1/2 animate-pulse bg-[var(--color-lime-ink)]" />
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Загрузка
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
