'use client'

import { useEffect, useRef, useState } from 'react'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesOrbitCompact } from '@/components/sections/CompetenciesOrbitCompact'
import { PartnersFlipCompact } from '@/components/sections/PartnersFlipCompact'
import { HeroLayer } from './ScrollStory'
import {
  STORY_BUSY_EVENT,
  STORY_SKIP_EVENT,
  useStoryController,
  type StoryOptions,
} from './useStoryController'

// Предохранитель: если canplaythrough первого сегмента не пришёл вовремя
// (медленная сеть, iOS без жеста) — снимаем лоадер всё равно, чтобы страница
// не зависла на постере.
const LOAD_TIMEOUT_MS = 2500

// Кнопка «Нажмите, чтобы пропустить» появляется не сразу: в первые доли
// секунды пропускать ещё нечего, и кнопка не мигает на коротком сегменте
const SKIP_HINT_DELAY_MS = 400

export const VIDEO_SRC_MOBILE = [
  '/video/story1-mobile.mp4',
  '/video/story2-mobile.mp4',
  '/video/story3-mobile.mp4',
]

// Мобильный режим стори (<1280px): тот же контроллер, что на десктопе —
// свайп запускает сегмент, он проигрывается сам. Отличия (правка 13.10.2026,
// заказчица жаловалась на «рваную» картинку скраба пальцем): сегмент за 2с,
// пропуск — только кнопкой (правка 14.10: свайп во время анимации ничего не
// делает), перемотка без очереди
// seek'ов (iOS), не догрузилось видео — полка сразу. Константа вне компонента —
// стабильная ссылка, эффект контроллера не пересоздаётся на каждом рендере.
const MOBILE_STORY_OPTIONS: StoryOptions = {
  normalSeconds: 2,
  skipButton: true,
  seekGate: true,
  skipIfNotReady: true,
}

export function MobileStoryScene() {
  const wrapperRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  // overlayRefs[0..3] = hero · about · competencies(compact) · partners(compact)
  const overlayRefs = useRef<(HTMLElement | null)[]>([])
  const [ready, setReady] = useState(false)
  const [skipHint, setSkipHint] = useState(false)

  useStoryController({ wrapperRef, videoRefs, overlayRefs, active: true, options: MOBILE_STORY_OPTIONS })

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), LOAD_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Плашка скипа — пока контроллер проигрывает сегмент
  useEffect(() => {
    let timer = 0
    const onBusy = (e: Event) => {
      const busy = (e as CustomEvent<{ busy: boolean }>).detail.busy
      window.clearTimeout(timer)
      if (busy) timer = window.setTimeout(() => setSkipHint(true), SKIP_HINT_DELAY_MS)
      else setSkipHint(false)
    }
    window.addEventListener(STORY_BUSY_EVENT, onBusy)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(STORY_BUSY_EVENT, onBusy)
    }
  }, [])

  return (
    <div className="relative">
      {/* Маркер для FloatingContactFab.useIsOnHero — первый экран сцены.
          Абсолютный, вне потока. */}
      <div id="hero" aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-dvh" />

      <section ref={wrapperRef} className="relative h-dvh overflow-hidden bg-[var(--color-bg)]">
        {/* Три видео-слоя. Сегмент 0 — src сразу (preload="metadata"), 1 и 2 —
            в data-src: контроллер назначает их заранее, пока человек на полке
            перед ними (после первого касания). */}
        {VIDEO_SRC_MOBILE.map((src, i) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            src={i === 0 ? src : undefined}
            data-src={i === 0 ? undefined : src}
            poster={i === 0 ? '/video/poster_start.jpg' : undefined}
            muted
            playsInline
            preload={i === 0 ? 'metadata' : 'none'}
            onCanPlayThrough={i === 0 ? () => setReady(true) : undefined}
            className="absolute inset-0 h-full w-full scale-[1.14] object-cover object-center"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}

        {/* z-20 оверлеи — autoAlpha рулит контроллер по текущему шагу */}
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
          className="invisible absolute inset-0 z-20"
        >
          <AboutSection variant="story" compact />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[2] = el
          }}
          className="invisible absolute inset-0 z-20"
        >
          <CompetenciesOrbitCompact />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[3] = el
          }}
          className="invisible absolute inset-0 z-20"
        >
          <PartnersFlipCompact />
        </div>

        {/* Кнопка «Нажмите, чтобы пропустить» — во время проигрыша сегмента.
            Единственный способ пропуска на мобилке (правка заказчицы 14.10:
            свайп во время анимации ничего не делает). Посадка — над нижним
            меню (h-14 + safe-area), как у FAB; та же белая пилюля, что
            «Нажмите» на карточках практик. min-h 44px — тач-цель по HIG.
            Обёртка насквозь прозрачна для касаний, ловит только сама кнопка,
            и только пока видна. */}
        <div
          className={`pointer-events-none absolute inset-x-0 z-30 flex justify-center transition-opacity duration-300 ${
            skipHint ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom) + 1rem)' }}
        >
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(STORY_SKIP_EVENT))}
            disabled={!skipHint}
            aria-hidden={!skipHint}
            tabIndex={skipHint ? 0 : -1}
            className={`min-h-11 rounded-full bg-[var(--color-surface)] px-5 text-[13px] font-medium text-[var(--color-text)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.97] transition-transform ${
              skipHint ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            Нажмите, чтобы пропустить
          </button>
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
