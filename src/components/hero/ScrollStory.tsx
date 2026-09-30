'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ScrollTrigger } from '@/lib/gsap'
import { HERO } from '@/constants/content/home'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesSection } from '@/components/sections/CompetenciesSection'
import { PartnersSection } from '@/components/sections/PartnersSection'
import { MobileScrubScene } from './MobileScrubScene'
import { useStoryController } from './useStoryController'
import { useHeroAssembly } from './useHeroAssembly'

// Story-режим только на десктопе без reduced-motion — scroll-jacking с
// перехватом ввода на телефоне капризен, там вместо него continuous
// scroll-scrub (см. MOBILE_SCRUB_MEDIA/scrub-ветку ниже). Порог 1280px (xl),
// не 1024 (lg) — синхронизирован с Header.tsx/CompetenciesSection.tsx: на
// 1024–1279px (iPad landscape и похожие ширины) нет места под полноценную
// десктопную навигацию, поэтому весь «десктопный» набор (шапка,
// scroll-jacking, орбита карточек) включается только с 1280px.
const STORY_MEDIA = '(min-width: 1280px) and (prefers-reduced-motion: no-preference)'

// Continuous scroll-scrub — зеркально нижней границе STORY_MEDIA (весь
// путь <1280px, кроме reduced-motion — там ни один из двух медиа-запросов
// не матчится, автоматический fallback в FlowFallback без единого байта видео).
const MOBILE_SCRUB_MEDIA = '(max-width: 1279.98px) and (prefers-reduced-motion: no-preference)'

// Источники видео-сегментов. Индекс = сегмент между шагами N и N+1.
const VIDEO_SRC = ['/video/story1.mp4', '/video/story2.mp4', '/video/story3.mp4']

// ── Контент героя: название фирмы / заголовок / подстрочник.
// Общий и для story-оверлея, и для flow-hero (постер-режим на мобилке).
// Адаптив ≥xl (1280px, синхронизировано с Header.tsx/STORY_MEDIA — до этого
// порога десктопной раскладки просто нет): все размеры пропорциональны ширине
// экрана относительно эталона 2560×1440 (vw-коэффициент = эталонный px / 25.6).
// На 2560px значения совпадают с эталоном пиксель-в-пиксель, ниже — масштабируются,
// выше — упираются в потолок. Порог был lg (1024px) — на 1024–1279 vw-формулы
// давали текст МЕЛЬЧЕ мобильного clamp() (пустое место в hero на iPad landscape).
export function HeroLayer({ ready = true }: { ready?: boolean }) {
  // Первый экран по ТЗ 27.09.2026 — минимализм: название фирмы, заголовок
  // и подстрочник. Никаких CTA/счётчиков/слоганов (заказчик просит не добавлять
  // самовольно). Сборка «Превращаем по центру → сложное в ясное → подстрочник»
  // — useHeroAssembly (стартует, когда ready: лоадер сцены снят).
  // Кегль и ширина считаются от границы плиты на фоне (см. .hero-copy в
  // globals.css) — текст растёт, пока не упрётся в плиту, и не заходит на неё.
  // Ниже xl вторая строка ломается после первого слова (3 строки), с xl — 2;
  // каждая визуальная строка — свой inline-block под шторку.
  const rootRef = useRef<HTMLDivElement>(null)
  useHeroAssembly(rootRef, ready)
  const [line2First, ...line2Rest] = HERO.titleLine2.split(' ')

  return (
    <div
      ref={rootRef}
      data-hero-pending=""
      className="hero-copy relative flex h-full w-full items-center px-8 pb-24 pt-20 xl:px-[min(2.1875vw,3.5rem)] xl:pb-16 xl:pt-24"
    >
      <div className="relative z-10">
        <p
          data-hero-tail
          className="hero-brand mb-[0.9em] font-semibold tracking-[-0.01em] text-[var(--color-text)]"
        >
          {HERO.brand}
        </p>

        <h1 className="hero-title font-heading font-medium leading-[1.03] tracking-[-0.055em]">
          <span className="block">
            <span data-hero-word className="inline-block">{HERO.titleLine1}</span>
          </span>{' '}
          <span className="block">
            <span data-hero-wipe className="inline-block">{line2First}</span>
            <br className="xl:hidden" />
            {' '}
            <span data-hero-wipe className="inline-block">{line2Rest.join(' ')}</span>
          </span>
        </h1>

        <p
          data-hero-tail
          className="hero-sub mt-[1.1em] font-medium leading-relaxed text-[var(--color-muted)]"
        >
          {HERO.subtitle}
        </p>
      </div>
    </div>
  )
}

type Mode = 'story' | 'scrub' | 'flow'

function computeMode(): Mode {
  if (window.matchMedia(STORY_MEDIA).matches) return 'story'
  if (window.matchMedia(MOBILE_SCRUB_MEDIA).matches) return 'scrub'
  return 'flow'
}

export function ScrollStory() {
  // SSR-safe: по умолчанию flow (работает без JS). На маунте апгрейдим до
  // story (десктоп ≥1280px) или scrub (<1280px), если reduced-motion не
  // включён. Следим за сменой медиа (ресайз/системная настройка).
  const [mode, setMode] = useState<Mode>('flow')

  useEffect(() => {
    const storyMq = window.matchMedia(STORY_MEDIA)
    const scrubMq = window.matchMedia(MOBILE_SCRUB_MEDIA)
    const apply = () => setMode(computeMode())
    apply()
    storyMq.addEventListener('change', apply)
    scrubMq.addEventListener('change', apply)
    return () => {
      storyMq.removeEventListener('change', apply)
      scrubMq.removeEventListener('change', apply)
    }
  }, [])

  // Переключение flow↔story/scrub меняет высоту документа. Триггеры нижних
  // секций (пины Практик/Статей, reveal Кейсов/Контактов) создаются в ту же
  // коммит-фазу, что и этот апгрейд, т.е. ещё при flow-разметке — их start'ы
  // кешируются со сдвигом на высоту flow-секций (reveal Контактов улетает за
  // пределы документа и не срабатывает никогда). На первичной загрузке
  // позиции чинят refresh'ы SmoothScrollProvider (fonts/load/600мс), но при
  // client-side возврате на главную (например «Все кейсы» со страницы кейса)
  // тот эффект не перезапускается — пересчитываем сами, когда новая
  // разметка уже в DOM.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [mode])

  if (mode === 'story') return <StoryScene />
  if (mode === 'scrub') return <MobileScrubScene />
  return <FlowFallback />
}

// ══════════════════════════════════════════════════════════════════════════
// STORY: прибитый экран. Тик скролла проигрывает сегмент видео (play вперёд /
// rAF-реверс назад) и замирает на «полке» с текстом. Логика — в контроллере.
// ══════════════════════════════════════════════════════════════════════════
function StoryScene() {
  const wrapperRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  // overlayRefs[0..3] = hero · about · competencies · partners
  const overlayRefs = useRef<(HTMLElement | null)[]>([])
  const [loaded, setLoaded] = useState(false)

  useStoryController({ wrapperRef, videoRefs, overlayRefs, active: true })

  return (
    <section ref={wrapperRef} className="relative h-[100vh]">
      {/* Прибитый экран: видео-слои + оверлеи поверх */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-[var(--color-bg)]">
        {/* Три видео-сегмента наложены друг на друга; видимостью рулит контроллер
            (кадры на стыках совпадают → переключение слоёв незаметно).
            scale-[1.14]: в кадры Veo запечён плавающий letterbox (до 60px из 1080
            сверху/снизу) — зум выталкивает чёрные полосы за край при любом аспекте. */}
        {VIDEO_SRC.map((src, i) => (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el
            }}
            src={src}
            poster={i === 0 ? '/video/poster_start.jpg' : undefined}
            muted
            playsInline
            preload="auto"
            onCanPlayThrough={i === 0 ? () => setLoaded(true) : undefined}
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
          <HeroLayer ready={loaded} />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[1] = el
          }}
          className="invisible absolute inset-0 z-20"
        >
          <AboutSection variant="story" />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[2] = el
          }}
          className="invisible absolute inset-0 z-20"
        >
          <CompetenciesSection variant="story" />
        </div>
        <div
          ref={(el) => {
            overlayRefs.current[3] = el
          }}
          className="invisible absolute inset-0 z-20"
        >
          <PartnersSection variant="story" />
        </div>

        {/* Лоадер до canplaythrough первого сегмента (светлая тема) */}
        <div
          className={`absolute inset-0 z-[60] grid place-items-center bg-[var(--color-bg)] transition-opacity duration-700 ${
            loaded ? 'pointer-events-none opacity-0' : 'opacity-100'
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
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// FLOW: мобилка / reduced-motion — обычный поток, видео = постер-hero.
// ══════════════════════════════════════════════════════════════════════════
function FlowFallback() {
  // Сборку текста делает сам HeroLayer (useHeroAssembly); на reduced-motion
  // он ничего не анимирует — текст сразу в собранном виде.
  return (
    <>
      {/* Постер-hero: статичный первый кадр видео + контент героя поверх */}
      <section
        id="hero"
        className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[var(--color-bg)] lg:h-[100dvh]"
      >
        {/* scale-[1.14] — тот же зум, что у видео-слоёв: срезает letterbox постера.
            next/image вместо CSS background-image — на iOS Safari фоновая картинка
            во время скролла иногда «протягивается»/смазывается (WebKit перерисовывает
            background-image не так эффективно, как compositor-слой img/transform),
            plus priority даёт LCP-приоритет вместо невидимого для оптимизации фона. */}
        <div aria-hidden className="absolute inset-0 scale-[1.14]">
          <Image
            src="/video/poster_start.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Лёгкий светлый скрим слева — чтобы чёрный текст читался поверх кадра */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(251,251,250,0.9) 0%, rgba(251,251,250,0.55) 40%, transparent 66%)',
          }}
        />
        <div className="relative z-10 h-full">
          <HeroLayer />
        </div>
      </section>

      <AboutSection />
      <CompetenciesSection />
      <PartnersSection />
    </>
  )
}
