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

   Радиус орбиты считается от реальных размеров сцены и вьюпорта (а не фиксированным
   пикселем): по X — от ширины сцены, по Y — ещё и от высоты окна, чтобы на низких
   экранах (ноуты, маки) карточки не резались краями. Размер карточки задан через
   vw с потолком 250px (эталон 2560×1440), половина берётся из DOM на каждый resize. */

const RADIUS_MIN = 300
const RADIUS_MAX = 620
const ORBIT_DURATION = 42
const CARD_TILT = 6
// Просвет сверху/снизу: шапка сайта + угловые скобки карточки
const VERTICAL_CLEAR = 120

function computeRadius(stageWidth: number, cardHalf: number, viewportHeight: number) {
  const x = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, stageWidth / 2 - cardHalf - 24))
  const y = Math.min(440, x * 0.82, viewportHeight / 2 - cardHalf - VERTICAL_CLEAR)
  return { x, y }
}

function orbitPoint(angleDeg: number, radius: { x: number; y: number }) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: Math.cos(rad) * radius.x,
    y: Math.sin(rad) * radius.y,
  }
}

interface CompetenciesSectionProps {
  /** 'flow' — обычная секция потока; 'story' — оверлей внутри ScrollStory. */
  variant?: 'flow' | 'story'
}

export function CompetenciesSection({ variant = 'flow' }: CompetenciesSectionProps) {
  const isStory = variant === 'story'
  const stageRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const radiusRef = useRef({ x: RADIUS_MAX, y: 420 })

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
      if (!cards.length || !stageRef.current) return

      const updateRadius = () => {
        const cardHalf = (cardsRef.current[0]?.clientWidth ?? 250) / 2
        radiusRef.current = computeRadius(
          stageRef.current!.clientWidth,
          cardHalf,
          window.innerHeight,
        )
      }
      updateRadius()
      window.addEventListener('resize', updateRadius)

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // В story появлением рулит таймлайн стори (opacity оверлея) — орбита
        // видна сразу и уже в движении. В потоке — мягкий fade-in по вьюпорту.
        if (isStory) {
          gsap.set(orbitRef.current, { opacity: 1 })
        } else {
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
        }

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

          // quickSetter вместо gsap.set: onUpdate дёргается каждый кадр, а set
          // плодил бы твины в контексте useGSAP — утечка и stack overflow при revert
          const setX = gsap.quickSetter(card, 'x', 'px')
          const setY = gsap.quickSetter(card, 'y', 'px')

          gsap.to(state, {
            angle: startAngle + 360,
            duration: ORBIT_DURATION,
            ease: 'none',
            repeat: -1,
            onUpdate: () => {
              const p = orbitPoint(state.angle, radiusRef.current)
              setX(p.x)
              setY(p.y)
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
    <section
      {...(!isStory && { id: 'competencies' })}
      className={
        isStory
          ? 'relative flex h-full w-full items-center overflow-hidden'
          : 'relative min-h-dvh flex items-center overflow-hidden bg-[var(--color-bg)]'
      }
    >
      {/* Мягкий лайм-glow за заголовком — по референсу 03_competencies_block.
          Радиальный, края прозрачные → под ним виден замерший кадр видео. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 46%, var(--color-lime-soft), transparent 22%)',
        }}
      />

      <div
        className={`relative max-w-[1440px] w-full mx-auto px-16 ${
          isStory ? 'py-10' : 'py-32'
        }`}
      >
        {/* Сцена: заголовок неподвижен в центре (десктоп — внутри орбиты, мобильный — обычным блоком).
            В story сцена ниже — вся орбита должна уместиться в 100dvh оверлея. */}
        <div ref={stageRef} className={`relative ${isStory ? 'lg:h-[760px]' : 'lg:h-[920px]'}`}>
          <div className="flex items-center justify-center lg:absolute lg:inset-0 lg:z-10">
            <SectionHeading
              title="Наши компетенции"
              subtitle="Профессионалы с многолетним опытом в ключевых отраслях права"
              className="text-center lg:max-w-2xl"
            />
          </div>

          {/* Орбита карточек — только десктоп, проявляется по ScrollTrigger */}
          <div ref={orbitRef} className="absolute inset-0 hidden lg:block">
            {/* Фоновые эллиптические орбиты + точки-искры */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[94%] h-[min(38.89vh,560px)] rounded-[50%] border border-[var(--color-lime)]/40 rotate-[-3deg]"
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                w-[82%] h-[min(30.56vh,440px)] rounded-[50%] border border-black/[0.08] rotate-[-2deg]"
            />
            {[
              'left-[18%] top-[24%]',
              'right-[15%] top-[46%]',
              'left-[22%] bottom-[22%]',
              'right-[24%] bottom-[26%]',
            ].map((pos) => (
              <span
                key={pos}
                className={`pointer-events-none absolute ${pos} w-2.5 h-2.5 rounded-full bg-[var(--color-lime)]`}
                style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
              />
            ))}

            {PRACTICES.map((practice, i) => (
              <div
                key={practice.title}
                ref={(el) => {
                  cardsRef.current[i] = el
                }}
                className="absolute left-1/2 top-1/2 w-[min(9.7656vw,250px)]"
              >
                <div
                  className="
                    relative aspect-square rounded-[18px] border border-[var(--color-line)]
                    bg-gradient-to-br from-white to-[var(--color-surface-soft)]
                    flex flex-col items-center justify-center
                    shadow-[0_30px_70px_rgba(0,0,0,0.13),inset_0_1px_0_rgba(255,255,255,0.95)]
                  "
                >
                  {/* Угловая рамка-скобка (line-frame) — видна только по углам */}
                  <span
                    className="pointer-events-none absolute -inset-[min(0.8594vw,22px)] rounded-[27px] border-[1.5px] border-black/[0.38] opacity-70"
                    style={{
                      clipPath:
                        'polygon(0 0,28% 0,28% 7%,72% 7%,72% 0,100% 0,100% 28%,93% 28%,93% 72%,100% 72%,100% 100%,72% 100%,72% 93%,28% 93%,28% 100%,0 100%,0 72%,7% 72%,7% 28%,0 28%)',
                    }}
                  />
                  {/* Лайм-полоса у правого края */}
                  <span
                    className="pointer-events-none absolute right-[-2px] top-[min(1.09375vw,1.75rem)] bottom-[min(1.09375vw,1.75rem)] w-1 rounded-full bg-[var(--color-lime)]"
                    style={{ boxShadow: '0 0 24px var(--color-lime)' }}
                  />
                  <strong className="font-heading text-[min(2.2266vw,57px)] font-black leading-none tracking-[-0.05em] text-[var(--color-text)]">
                    {String(i + 1).padStart(2, '0')}
                  </strong>
                  <p className="mt-[min(0.9375vw,1.5rem)] px-4 text-center text-[clamp(11px,0.6641vw,17px)] font-semibold leading-tight text-[var(--color-text)]">
                    {practice.title}
                  </p>
                </div>
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
                relative p-6 rounded-[18px] border border-[var(--color-line)]
                bg-gradient-to-br from-white to-[var(--color-surface-soft)]
                shadow-[var(--shadow-card)]
              "
            >
              <span
                className="pointer-events-none absolute right-[-2px] top-6 bottom-6 w-1 rounded-full bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 24px var(--color-lime)' }}
              />
              <span className="font-heading text-4xl font-black tracking-[-0.05em] text-[var(--color-text)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-[var(--color-text)]">
                {practice.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
