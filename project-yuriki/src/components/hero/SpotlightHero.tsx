'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { HERO, HERO_STATS } from '@/constants/content/home'

// Панели-«колонны» правой сцены: убывающая высота/ширина/прозрачность,
// стоят на одной линии-полу, skewY даёт лёгкую перспективу. Значения адаптированы
// из референса 01_hero_main_screen (px→в рамках right-anchored сцены).
const PILLARS = [
  { left: 60, height: 500, width: 118, opacity: 0.9 },
  { left: 280, height: 415, width: 94, opacity: 0.67 },
  { left: 450, height: 350, width: 94, opacity: 0.55 },
  { left: 600, height: 300, width: 74, opacity: 0.45 },
  { left: 730, height: 242, width: 54, opacity: 0.25 },
] as const

export function SpotlightHero() {
  const copyRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)

  // Появление при загрузке: копия всплывает со стаггером, сцена мягко проявляется.
  // Обёрнуто в matchMedia — при prefers-reduced-motion анимация не запускается,
  // элементы остаются в конечном (видимом) состоянии по умолчанию.
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const copyItems = copyRef.current?.children
      if (copyItems) {
        gsap.fromTo(
          copyItems,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 0.15,
          },
        )
      }
      gsap.fromTo(
        sceneRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 0.4 },
      )
    })
    return () => mm.revert()
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Мягкий лайм-свет за сценой (см. .page background в референсе) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 66% 46%, var(--color-lime-soft), transparent 24%)',
        }}
      />

      <div className="relative mx-auto h-dvh min-h-[720px] max-w-[1440px] px-8">
        {/* ── Левая колонка: заголовок, подзаголовок, кнопка ────────── */}
        <div
          ref={copyRef}
          className="relative z-10 max-w-[46rem] pt-[clamp(104px,16vh,190px)]"
        >
          <h1 className="font-heading font-medium leading-[1.06] tracking-[-0.055em] text-[clamp(2.5rem,6.8vw,5.375rem)]">
            <span className="block">{HERO.titleLine1}</span>
            <span className="block">{HERO.titleLine2}</span>
            <span className="block text-black/25">{HERO.titleMuted}</span>
          </h1>

          <p className="mt-[clamp(1.75rem,3.5vh,2.75rem)] max-w-[24rem] text-lg font-medium leading-relaxed text-[var(--color-muted)]">
            {HERO.subtitle}
          </p>

          {/* Плоский <a>: клик по якорю перехватывает Lenis (плавный скролл к
              #contacts), как и CTA в Header — Link дал бы жёсткий прыжок. */}
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

        {/* ── Правая сцена: колонны, пол, дуги (декор, только десктоп) ── */}
        <div
          ref={sceneRef}
          aria-hidden
          className="pointer-events-none absolute bottom-[112px] right-[120px] hidden h-[540px] w-[820px] lg:block"
        >
          {/* Линия-пол */}
          <div
            className="absolute bottom-[62px] left-[-220px] right-[-120px] h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,0,0,.10), transparent)',
            }}
          />

          {/* Декоративные дуги */}
          <div
            className="absolute bottom-[-58px] left-[-260px] h-[240px] w-[600px] rounded-[50%] border-t"
            style={{ borderColor: 'rgba(201,255,31,.20)' }}
          />
          <div
            className="absolute bottom-[0px] left-[-210px] h-[230px] w-[500px] rounded-[50%] border-t"
            style={{ borderColor: 'rgba(0,0,0,.06)' }}
          />

          {/* Колонны */}
          {PILLARS.map((p, i) => (
            <div
              key={i}
              className="absolute bottom-[62px] overflow-hidden"
              style={{
                left: p.left,
                width: p.width,
                height: p.height,
                opacity: p.opacity,
                transform: 'skewY(6deg)',
                background:
                  'linear-gradient(90deg,#f7f7f6,#ffffff 52%,#e4e5e3)',
                boxShadow:
                  '34px 44px 50px rgba(0,0,0,.08), inset -5px 0 12px rgba(0,0,0,.08)',
              }}
            >
              {/* Лайм-торец слева */}
              <span
                className="absolute left-0 top-0 h-full w-[5px]"
                style={{
                  background:
                    'linear-gradient(180deg, var(--color-lime), rgba(201,255,31,.08))',
                  boxShadow: '0 0 24px var(--color-lime)',
                }}
              />
            </div>
          ))}

          {/* Искры-крестики */}
          <i className="absolute left-[-180px] top-[80px] h-[15px] w-[15px] before:absolute before:left-[7px] before:top-0 before:h-[15px] before:w-px before:bg-[var(--color-lime)] before:shadow-[0_0_18px_var(--color-lime-glow)] before:content-[''] after:absolute after:left-0 after:top-[7px] after:h-px after:w-[15px] after:bg-[var(--color-lime)] after:shadow-[0_0_18px_var(--color-lime-glow)] after:content-['']" />
          <i className="absolute right-[40px] top-[30px] h-[15px] w-[15px] before:absolute before:left-[7px] before:top-0 before:h-[15px] before:w-px before:bg-[var(--color-lime)] before:shadow-[0_0_18px_var(--color-lime-glow)] before:content-[''] after:absolute after:left-0 after:top-[7px] after:h-px after:w-[15px] after:bg-[var(--color-lime)] after:shadow-[0_0_18px_var(--color-lime-glow)] after:content-['']" />
        </div>

        {/* ── Счётчики: правый край, только десктоп ─────────────────── */}
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

        {/* ── Нижняя строка: слоган + пейджер ───────────────────────── */}
        <div className="absolute inset-x-8 bottom-7 flex h-[70px] items-center justify-between border-t border-[var(--color-line)]">
          <p className="flex items-center gap-3.5 text-xs font-extrabold uppercase tracking-[0.46em] text-[#3c3c3c]">
            <i className="h-2.5 w-2.5 rounded-[2px] bg-[var(--color-lime)]" />
            {HERO.bottomLine}
          </p>
          <div className="hidden items-center gap-6 text-base sm:flex">
            <b className="font-extrabold text-[var(--color-text)]">01</b>
            <span
              className="h-px w-[150px]"
              style={{
                background: 'linear-gradient(90deg, var(--color-lime), #ddd)',
              }}
            />
            <em className="not-italic text-[var(--color-muted)]">03</em>
          </div>
        </div>
      </div>
    </section>
  )
}
