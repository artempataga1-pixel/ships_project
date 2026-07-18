'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { HERO } from '@/constants/content/home'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesSection } from '@/components/sections/CompetenciesSection'
import { PartnersSection } from '@/components/sections/PartnersSection'
import { handleStoryAwareAnchorClick, useStoryController } from './useStoryController'

// Story-режим только на десктопе без reduced-motion — scroll-jacking с
// перехватом ввода на телефоне капризен, там секции идут обычным потоком
// (см. flow-ветку).
const STORY_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

// Источники видео-сегментов. Индекс = сегмент между шагами N и N+1.
const VIDEO_SRC = ['/video/story1.mp4', '/video/story2.mp4', '/video/story3.mp4']

// ── Контент героя: заголовок / подзаголовок / CTA / счётчики / нижняя строка.
// Общий и для story-оверлея, и для flow-hero (постер-режим на мобилке).
// Адаптив ≥lg: все размеры пропорциональны ширине экрана относительно эталона
// 2560×1440 (vw-коэффициент = эталонный px / 25.6). На 2560px значения совпадают
// с эталоном пиксель-в-пиксель, ниже — масштабируются, выше — упираются в потолок.
function HeroLayer() {
  return (
    <div className="relative h-full min-h-[720px] w-full px-8 lg:px-[min(2.1875vw,3.5rem)]">
      {/* Левая колонка: заголовок, подзаголовок, CTA — крупный кегль (×2). */}
      <div className="relative z-10 max-w-[70rem] pt-[clamp(80px,10vh,130px)] lg:max-w-[min(43.75vw,70rem)] lg:pt-[min(5.0781vw,130px)]">
        <h1 className="font-heading font-medium leading-[1.03] tracking-[-0.055em] text-[clamp(2.4rem,10vw,9rem)] lg:text-[min(5.625vw,9rem)]">
          <span data-hero-fade className="block">{HERO.titleLine1}</span>
          <span data-hero-fade className="block">{HERO.titleLine2}</span>
          <span data-hero-fade className="block text-black/25">{HERO.titleMuted}</span>
        </h1>

        <p
          data-hero-fade
          className="mt-[clamp(1.5rem,3vh,2.5rem)] max-w-[40rem] text-[clamp(1.05rem,4vw,2.25rem)] font-medium leading-relaxed text-[var(--color-muted)] lg:mt-[min(1.5625vw,2.5rem)] lg:max-w-[min(25vw,40rem)] lg:text-[clamp(1.125rem,1.40625vw,2.25rem)]"
        >
          {HERO.subtitle}
        </p>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/#contacts"
          onClick={(e) => handleStoryAwareAnchorClick(e, 'contacts')}
          data-hero-fade
          className="group mt-[clamp(2.75rem,5.5vh,4.5rem)] inline-flex items-center gap-5 lg:mt-[min(2.8125vw,4.5rem)] lg:gap-[min(1.25vw,2rem)]"
        >
          <span
            aria-hidden="true"
            className="grid h-16 w-16 place-items-center rounded-full border border-[var(--color-black)] bg-[var(--color-lime)] text-2xl text-[var(--color-black)] shadow-[0_0_42px_var(--color-lime-glow)] transition-transform duration-300 group-hover:scale-105 lg:h-[clamp(48px,4.0625vw,104px)] lg:w-[clamp(48px,4.0625vw,104px)] lg:text-[clamp(17px,1.40625vw,36px)]"
          >
            →
          </span>
          <span className="text-lg font-semibold text-[var(--color-text)] lg:text-[clamp(0.9375rem,0.9375vw,1.5rem)]">
            {HERO.ctaLabel}
          </span>
        </a>
      </div>

      {/* Нижняя строка: слоган — только десктоп (на мобилке убрана по просьбе заказчика) */}
      <div className="absolute inset-x-8 bottom-7 hidden h-[70px] items-center border-t border-[var(--color-line)] lg:flex lg:inset-x-[min(2.1875vw,3.5rem)] lg:bottom-[min(1.09375vw,1.75rem)] lg:h-[min(2.7344vw,70px)]">
        <p className="flex items-center gap-3.5 text-xs font-extrabold uppercase tracking-[0.46em] text-[#3c3c3c]">
          <i className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-lime)]" />
          {HERO.bottomLine}
        </p>
      </div>
    </div>
  )
}

export function ScrollStory() {
  // SSR-safe: по умолчанию flow (работает без JS). На маунте апгрейдим до story,
  // если десктоп без reduced-motion. Следим за сменой медиа (ресайз/системная).
  const [isStory, setIsStory] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(STORY_MEDIA)
    const apply = () => setIsStory(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Переключение flow↔story меняет высоту документа на ~3 экрана. Триггеры
  // нижних секций (пины Практик/Статей, reveal Кейсов/Контактов) создаются в
  // ту же коммит-фазу, что и этот апгрейд, т.е. ещё при flow-разметке — их
  // start'ы кешируются со сдвигом на высоту flow-секций (reveal Контактов
  // улетает за пределы документа и не срабатывает никогда). На первичной
  // загрузке позиции чинят refresh'ы SmoothScrollProvider (fonts/load/600мс),
  // но при client-side возврате на главную (например «Все кейсы» со страницы
  // кейса) тот эффект не перезапускается — пересчитываем сами, когда новая
  // разметка уже в DOM.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [isStory])

  return isStory ? <StoryScene /> : <FlowFallback />
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
          <HeroLayer />
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
  const heroRef = useRef<HTMLElement>(null)

  // Стаггер-появление заголовка/подзаголовка/CTA (data-hero-fade в HeroLayer).
  // Только когда motion разрешён — на reduce элементы остаются в исходном
  // (видимом) состоянии, gsap.set внутри ветки вообще не выполняется.
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-hero-fade]', heroRef.current)
      if (!items.length) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(items, { autoAlpha: 0, y: 24 })
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: 'power3.out',
        })
      })
    },
    { scope: heroRef },
  )

  return (
    <>
      {/* Постер-hero: статичный первый кадр видео + контент героя поверх */}
      <section
        ref={heroRef}
        id="hero"
        className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[var(--color-bg)] lg:h-[100dvh]"
      >
        {/* scale-[1.14] — тот же зум, что у видео-слоёв: срезает letterbox постера */}
        <div
          aria-hidden
          className="absolute inset-0 scale-[1.14] bg-cover bg-center"
          style={{ backgroundImage: 'url(/video/poster_start.jpg)' }}
        />
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
