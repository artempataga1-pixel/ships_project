'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { HERO, HERO_STATS } from '@/constants/content/home'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesSection } from '@/components/sections/CompetenciesSection'
import { PartnersSection } from '@/components/sections/PartnersSection'

// ── Границы роликов в склейке scrub.mp4 (transition 0–8 · blocks 8–16 · cubes 16–26).
// Пересобрано в 48 fps (motion-compensated), реальная длина ≈ 25.9375с.
const CLIP1_END = 8.0
const CLIP2_END = 16.0
const FALLBACK_DURATION = 25.9375

// ── Раскладка стори в vh-юнитах. 1 юнит таймлайна = 1vh высоты обёртки, поэтому
// проматывание и «полки покоя» напрямую соответствуют дистанции скролла.
// Scrub-фазы длинные (каждый кадр держится дольше) — так побеждаем рваность.
const SCRUB = 160
const SHELF_ABOUT = 110
const SHELF_COMP = 130
const SHELF_PARTNERS = 130

// Кумулятивные границы фаз на таймлайне
const P = {
  scrub1: [0, SCRUB],
  shelfA: [SCRUB, SCRUB + SHELF_ABOUT],
  scrub2: [SCRUB + SHELF_ABOUT, 2 * SCRUB + SHELF_ABOUT],
  shelfC: [2 * SCRUB + SHELF_ABOUT, 2 * SCRUB + SHELF_ABOUT + SHELF_COMP],
  scrub3: [2 * SCRUB + SHELF_ABOUT + SHELF_COMP, 3 * SCRUB + SHELF_ABOUT + SHELF_COMP],
  shelfP: [
    3 * SCRUB + SHELF_ABOUT + SHELF_COMP,
    3 * SCRUB + SHELF_ABOUT + SHELF_COMP + SHELF_PARTNERS,
  ],
} as const

const TOTAL = P.shelfP[1] // 850
// Дистанция реального скролла = высота обёртки − один прибитый экран (100vh)
const SCROLL_FACTOR = (TOTAL - 100) / TOTAL

const FADE = 40 // длина твина появления оверлея, юнитов
const FADE_OUT = 30 // длина твина ухода

// Story-режим только на десктопе без reduced-motion — пин видео-стори на телефоне
// капризен, там секции идут обычным потоком (см. flow-ветку).
const STORY_MEDIA = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

// ── Контент героя: заголовок / подзаголовок / CTA / счётчики / нижняя строка.
// Общий и для story-оверлея, и для flow-hero (постер-режим на мобилке).
function HeroLayer() {
  return (
    <div className="relative mx-auto h-full min-h-[720px] max-w-[1440px] px-8">
      {/* Левая колонка: заголовок, подзаголовок, CTA */}
      <div className="relative z-10 max-w-[46rem] pt-[clamp(104px,16vh,190px)]">
        <h1 className="font-heading font-medium leading-[1.06] tracking-[-0.055em] text-[clamp(2.5rem,6.8vw,5.375rem)]">
          <span className="block">{HERO.titleLine1}</span>
          <span className="block">{HERO.titleLine2}</span>
          <span className="block text-black/25">{HERO.titleMuted}</span>
        </h1>

        <p className="mt-[clamp(1.75rem,3.5vh,2.75rem)] max-w-[24rem] text-lg font-medium leading-relaxed text-[var(--color-muted)]">
          {HERO.subtitle}
        </p>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/#contacts"
          className="group mt-[clamp(1.75rem,3.5vh,2.625rem)] inline-flex items-center gap-7"
        >
          <span
            aria-hidden="true"
            className="grid h-[72px] w-[72px] place-items-center rounded-full bg-[var(--color-lime)] text-2xl text-[var(--color-black)] shadow-[0_0_42px_var(--color-lime-glow)] transition-transform duration-300 group-hover:scale-105"
          >
            →
          </span>
          <span className="text-lg font-semibold text-[var(--color-text)]">
            {HERO.ctaLabel}
          </span>
        </a>
      </div>

      {/* Счётчики: правый край, только десктоп */}
      <aside className="absolute right-8 top-1/2 hidden -translate-y-1/2 grid-flow-row gap-[54px] lg:grid">
        {HERO_STATS.map((s) => (
          <div key={s.value} className="w-[120px]">
            <span
              className="mb-5 block h-[2px] w-[18px]"
              style={{
                background: 'rgba(201,255,31,.72)',
                boxShadow: '0 0 14px var(--color-lime-glow)',
              }}
            />
            <strong className="block text-2xl font-bold text-[var(--color-text)]">
              {s.value}
            </strong>
            <span className="mt-2 block text-[11px] text-[var(--color-muted)]">
              {s.label}
            </span>
          </div>
        ))}
      </aside>

      {/* Нижняя строка: слоган + пейджер клипов 01—03 */}
      <div className="absolute inset-x-8 bottom-7 flex h-[70px] items-center justify-between border-t border-[var(--color-line)]">
        <p className="flex items-center gap-3.5 text-xs font-extrabold uppercase tracking-[0.46em] text-[#3c3c3c]">
          <i className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-lime)]" />
          {HERO.bottomLine}
        </p>
        <div className="hidden items-center gap-6 text-base sm:flex">
          <b className="font-extrabold text-[var(--color-text)]">01</b>
          <span
            className="h-px w-[150px]"
            style={{ background: 'linear-gradient(90deg, var(--color-lime), #ddd)' }}
          />
          <em className="not-italic text-[var(--color-muted)]">03</em>
        </div>
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

  return isStory ? <StoryScene /> : <FlowFallback />
}

// ══════════════════════════════════════════════════════════════════════════
// STORY: прибитое видео-полотно, скролл чередует проматывание и полки покоя.
// ══════════════════════════════════════════════════════════════════════════
function StoryScene() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const compRef = useRef<HTMLDivElement>(null)
  const partnersRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useGSAP(
    () => {
      const video = videoRef.current
      const wrapper = wrapperRef.current
      if (!video || !wrapper) return

      // Перемотка кадра: прокси-объект ведём таймлайном, значение → currentTime.
      const proxy = { t: 0 }
      const seek = () => {
        const dur = video.duration || FALLBACK_DURATION
        video.currentTime = Math.min(proxy.t, dur - 0.001)
      }

      // Стартовое состояние оверлеев: герой виден, остальные скрыты (autoAlpha
      // гасит и visibility → скрытые оверлеи не перехватывают клики/наведение).
      gsap.set(heroRef.current, { autoAlpha: 1 })
      gsap.set([aboutRef.current, compRef.current, partnersRef.current], { autoAlpha: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5, // мягкая инерция — видео плавно догоняет скролл
        },
      })

      // ── scrub 1: герой гаснет, видео 0 → стык 1│2 (8с) ──────────────────
      tl.to(proxy, { t: CLIP1_END, duration: SCRUB, onUpdate: seek }, P.scrub1[0])
      tl.to(heroRef.current, { autoAlpha: 0, duration: 120, ease: 'power1.in' }, P.scrub1[0])

      // ── полка «О нас»: видео замерло на 8с, оверлей появляется → держится → уходит
      tl.to(aboutRef.current, { autoAlpha: 1, duration: FADE }, P.shelfA[0])
      tl.to(aboutRef.current, { autoAlpha: 0, duration: FADE_OUT }, P.shelfA[1] - FADE_OUT)

      // ── scrub 2: видео 8 → стык 2│3 (16с) ───────────────────────────────
      tl.to(proxy, { t: CLIP2_END, duration: SCRUB, onUpdate: seek }, P.scrub2[0])

      // ── полка «Компетенции» (орбита) ────────────────────────────────────
      tl.to(compRef.current, { autoAlpha: 1, duration: FADE }, P.shelfC[0])
      tl.to(compRef.current, { autoAlpha: 0, duration: FADE_OUT }, P.shelfC[1] - FADE_OUT)

      // ── scrub 3: видео 16 → последний кадр (26с) ────────────────────────
      tl.to(proxy, { t: FALLBACK_DURATION, duration: SCRUB, onUpdate: seek }, P.scrub3[0])

      // ── полка «Партнёры» (веер): появляется и держится до конца стори ────
      tl.to(partnersRef.current, { autoAlpha: 1, duration: FADE }, P.shelfP[0])

      // Держим последний кадр видео весь хвост полки «Партнёры». Заодно этот
      // твин растягивает длительность таймлайна до TOTAL — иначе она обрезалась
      // бы по последнему твину (fade-in партнёров), и hold-хвост стори (а с ним
      // и правильный маппинг прогресса скролла) не существовал бы.
      tl.to(proxy, { t: FALLBACK_DURATION, duration: TOTAL - P.shelfP[0], onUpdate: seek }, P.shelfP[0])

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    },
    { scope: wrapperRef, dependencies: [] },
  )

  // Позиции якорь-меток: середина «видимого» окна каждой полки, переведённая из
  // юнитов таймлайна в реальную прокрутку (top внутри высокой обёртки).
  const markerTop = (posStart: number, posEnd: number) => ({
    top: `${(posStart + FADE) * SCROLL_FACTOR}vh`,
    height: `${(posEnd - (posStart + FADE)) * SCROLL_FACTOR}vh`,
  })

  return (
    <section ref={wrapperRef} className="relative" style={{ height: `${TOTAL}vh` }}>
      {/* Прибитый экран: видео-фон + оверлеи поверх */}
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-[var(--color-bg)]">
        {/* Видео-фон — само не играет, только перемотка currentTime */}
        <video
          ref={videoRef}
          src="/video/scrub.mp4"
          poster="/video/poster_start.jpg"
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* z-20 оверлеи — opacity/visibility рулит таймлайн */}
        <div ref={heroRef} className="absolute inset-0 z-20">
          <HeroLayer />
        </div>
        <div ref={aboutRef} className="invisible absolute inset-0 z-20">
          <AboutSection variant="story" />
        </div>
        <div ref={compRef} className="invisible absolute inset-0 z-20">
          <CompetenciesSection variant="story" />
        </div>
        <div ref={partnersRef} className="invisible absolute inset-0 z-20">
          <PartnersSection variant="story" />
        </div>

        {/* Лоадер до canplaythrough (светлая тема) */}
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

      {/* Якорь-метки для навигации: невидимые полосы на позициях полок внутри
          стори. Header ведёт «/#about» и т.д. — Lenis скроллит к нужной полке,
          IntersectionObserver лампы навбара подсвечивает активный пункт. */}
      <span
        id="about"
        aria-hidden
        className="pointer-events-none absolute left-0 w-px"
        style={markerTop(P.shelfA[0], P.shelfA[1])}
      />
      <span
        id="competencies"
        aria-hidden
        className="pointer-events-none absolute left-0 w-px"
        style={markerTop(P.shelfC[0], P.shelfC[1])}
      />
      <span
        id="partners"
        aria-hidden
        className="pointer-events-none absolute left-0 w-px"
        style={markerTop(P.shelfP[0], P.shelfP[1])}
      />
    </section>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// FLOW: мобилка / reduced-motion — обычный поток, видео = постер-hero.
// ══════════════════════════════════════════════════════════════════════════
function FlowFallback() {
  return (
    <>
      {/* Постер-hero: статичный первый кадр видео + контент героя поверх */}
      <section
        id="hero"
        className="relative h-[100dvh] min-h-[640px] overflow-hidden bg-[var(--color-bg)]"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
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
