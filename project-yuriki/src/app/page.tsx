'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { HERO, ABOUT, STATS } from '@/constants/content/home'

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const phraseRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)

  const lenis = useLenis()

  // title уходит вверх → фраза + CTA появляются
  useGSAP(() => {
    // set гарантирует начальное состояние до первого рендера (без FOUC)
    gsap.set([phraseRef.current, ctaRef.current], { opacity: 0, y: 20 })

    const tl = gsap.timeline({ delay: 1 })
    tl.to(titleRef.current, { y: -80, opacity: 0, duration: 0.9, ease: 'power2.in' }).to(
      [phraseRef.current, ctaRef.current],
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' },
      '-=0.2'
    )
  }, { dependencies: [] })

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="h-screen flex items-center overflow-hidden">
        {/* Видео-панель 40% — вертикальное dama.mp4 в пропорциях */}
        <div className="w-2/5 h-full flex items-center justify-center overflow-hidden">
          <video
            src="/video/dama.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-auto max-w-none object-contain"
          />
        </div>

        {/* Текст-панель 60% */}
        <div className="w-3/5 flex flex-col justify-center px-16 gap-8">
          <h1
            ref={titleRef}
            className="font-heading text-6xl font-extrabold leading-tight"
          >
            {HERO.heading}
          </h1>

          <p
            ref={phraseRef}
            className="text-xl text-white/80 leading-relaxed max-w-lg"
          >
            {HERO.phrase}
          </p>

          <button
            ref={ctaRef}
            type="button"
            className="self-start px-8 py-4 border border-[var(--color-accent-cold)]/50 text-[var(--color-accent-cold)] hover:bg-[var(--color-accent-cold)]/10 transition-colors duration-300 text-sm uppercase tracking-widest"
            onClick={() => lenis?.scrollTo('#about')}
          >
            {HERO.ctaLabel}
          </button>
        </div>
      </section>

      {/* ── О нас ─────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative min-h-screen flex items-center py-24 scroll-mt-16"
      >
        {/* Фон fon1.jpg на opacity 0.15 */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/backgrounds/fon1.jpg)',
            opacity: 0.15,
          }}
        />

        <div className="max-w-[1440px] mx-auto px-16 w-full">
          <div className="grid grid-cols-2 gap-24 items-center">
            <SectionHeading
              title={ABOUT.heading}
              subtitle={ABOUT.description}
            />

            {/* StatCounter сам отслеживает viewport через IntersectionObserver */}
            <StatCounter items={STATS} />
          </div>
        </div>
      </section>
    </>
  )
}
