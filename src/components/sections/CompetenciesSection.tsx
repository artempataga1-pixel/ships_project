'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PRACTICES } from '@/constants/content/practice'

/* Референс — reference 2/com.mp4: заголовок неподвижен в центре, а вокруг него
   по эллиптической орбите бесконечно облетают карточки. У них три яруса дуги —
   у нас карточек меньше, поэтому один виток. Скорость облёта вдвое медленнее
   референса — там мельтешило гораздо быстрее.

   Радиус орбиты считается от реальной ширины сцены (а не фиксированным пикселем) —
   на широком экране карточки разлетаются шире, на границе брейкпоинта не режутся
   краем контейнера. CARD_HALF_WIDTH — половина w-64 (256px). */

const CARD_HALF_WIDTH = 128
const RADIUS_MIN = 300
const RADIUS_MAX = 620
const ORBIT_DURATION = 42
const CARD_TILT = 6

function computeRadius(stageWidth: number) {
  const x = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, stageWidth / 2 - CARD_HALF_WIDTH - 24))
  const y = Math.min(440, x * 0.82)
  return { x, y }
}

function orbitPoint(angleDeg: number, radius: { x: number; y: number }) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.cos(rad) * radius.x,
    y: Math.sin(rad) * radius.y,
  }
}

export function CompetenciesSection() {
  const stageRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const radiusRef = useRef({ x: RADIUS_MAX, y: 420 })

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
      if (!cards.length || !stageRef.current) return

      const updateRadius = () => {
        radiusRef.current = computeRadius(stageRef.current!.clientWidth)
      }
      updateRadius()
      window.addEventListener('resize', updateRadius)

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(orbitRef.current, { opacity: 0 })
        gsap.to(orbitRef.current, {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top 75%',
            once: true,
          },
        })

        cards.forEach((card, i) => {
          const startAngle = (360 / PRACTICES.length) * i - 90
          const state = { angle: startAngle }
          const tilt = i % 2 === 0 ? CARD_TILT : -CARD_TILT

          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            ...orbitPoint(startAngle, radiusRef.current),
            rotation: tilt,
          })

          gsap.to(state, {
            angle: startAngle + 360,
            duration: ORBIT_DURATION,
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
              gsap.set(card, orbitPoint(state.angle, radiusRef.current))
            },
          })
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(orbitRef.current, { opacity: 1 })
        cards.forEach((card, i) => {
          const startAngle = (360 / PRACTICES.length) * i - 90
          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            ...orbitPoint(startAngle, radiusRef.current),
            rotation: 0,
          })
        })
      })

      return () => window.removeEventListener('resize', updateRadius)
    },
    { scope: stageRef, dependencies: [] },
  )

  return (
    <section id="competencies" className="min-h-dvh flex items-center bg-black overflow-hidden">
      <div className="max-w-[1440px] w-full mx-auto px-16 py-32">
        {/* Сцена: заголовок неподвижен в центре (десктоп — внутри орбиты, мобильный — обычным блоком) */}
        <div ref={stageRef} className="relative lg:h-[920px]">
          <div className="flex items-center justify-center lg:absolute lg:inset-0 lg:z-10">
            <SectionHeading
              title="Наши компетенции"
              subtitle="Профессионалы с многолетним опытом в ключевых отраслях права"
              className="text-center lg:max-w-2xl"
            />
          </div>

          {/* Орбита карточек-заглушек — фото добавим позже, только десктоп */}
          <div ref={orbitRef} className="absolute inset-0 hidden lg:block">
            {PRACTICES.map((practice, i) => (
              <div
                key={practice.title}
                ref={(el) => {
                  cardsRef.current[i] = el
                }}
                className="absolute left-1/2 top-1/2 w-64"
              >
                <div
                  className="
                    aspect-square rounded-lg border border-[var(--color-card-border)]/40
                    bg-gradient-to-b from-zinc-800 to-zinc-900
                    flex items-center justify-center
                  "
                >
                  <span className="font-heading text-5xl text-hero-bronze">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-4 text-center text-[1.3rem] tracking-[0.15em] uppercase text-white/50">
                  {practice.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Мобильная и планшетная раскладка карточек — без орбиты */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {PRACTICES.map((practice, i) => (
            <div
              key={practice.title}
              className="
                p-6 rounded-lg border border-[var(--color-card-border)]/40
                bg-gradient-to-b from-zinc-800 to-zinc-900
              "
            >
              <span className="font-heading text-sm tracking-[0.2em] text-hero-bronze">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-heading text-lg font-extrabold leading-snug">
                {practice.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
