'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { TEAM } from '@/constants/content/team'

/* Референс — dizain3.jpg + 02_partners_block (index.html/style.css):
   плотная колода крупных портретных карточек раскрывается тесным веером-дугой
   при входе в вьюпорт и бесконечно покачивается на месте. Подпись с именем —
   одна, под колодой, и переключается на наведённую карточку. Наведение НЕ
   поднимает карточку поверх соседей через z-index — вместо этого соседние
   карточки раздвигаются в стороны, освобождая ей место, а сама наведённая
   карточка просто выезжает вверх на своём месте.
   Геометрия веера взята 1-в-1 из референс-кода .person-card / card-center /
   card-left-1/2 / card-right-1/2 (translateX/Y + rotate + opacity). */

const IDLE_WOBBLE_DURATION = 7
const HOVER_GAP = 64
const CENTER_INDEX = Math.floor((TEAM.length - 1) / 2)

// Целевые позиции веера из референс-кода 02_partners_block (для 5 карточек).
type FanPos = { x: number; y: number; rotate: number; z: number; opacity: number }
const FAN: FanPos[] = [
  { x: -460, y: 102, rotate: -20, z: 3, opacity: 0.82 }, // card-left-2
  { x: -245, y: 58, rotate: -11, z: 4, opacity: 0.9 }, //  card-left-1
  { x: 0, y: -15, rotate: 0, z: 5, opacity: 1 }, //         card-center
  { x: 245, y: 58, rotate: 11, z: 4, opacity: 0.9 }, //     card-right-1
  { x: 460, y: 102, rotate: 20, z: 3, opacity: 0.82 }, //   card-right-2
]

// Fallback-геометрия на случай, если состав TEAM изменят (не 5 персон).
function arcFallback(index: number, total: number): FanPos {
  const offset = index - (total - 1) / 2
  return {
    x: offset * 210,
    y: Math.abs(offset) * 48,
    rotate: offset * 11,
    z: Math.round(total - Math.abs(offset)),
    opacity: 1 - Math.abs(offset) * 0.06,
  }
}

function fanPosition(index: number, total: number): FanPos {
  return total === FAN.length ? FAN[index] : arcFallback(index, total)
}

// Серый силуэт-плейсхолдер (реальных фото партнёров нет).
function SilhouetteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="40" r="24" fill="#dadada" />
      <path d="M8 120 C8 82 92 82 92 120 Z" fill="#dadada" />
    </svg>
  )
}

// Светлая карточка партнёра: белый градиент, тонкая рамка, мягкая тень,
// вертикальная лайм-полоса у ПРАВОГО края (референс .person-card::before).
function PartnerCard() {
  return (
    <div
      className="relative w-full h-full rounded-[28px] border border-[var(--color-line)] flex items-center justify-center overflow-visible"
      style={{
        background: 'linear-gradient(135deg,#ffffff,#f4f4f3)',
        boxShadow: '0 34px 85px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.95)',
      }}
    >
      <SilhouetteIcon className="w-28 h-32 -translate-y-2" />
      {/* лайм-полоса у правого края */}
      <span
        className="absolute right-[-2px] top-8 bottom-8 w-1 rounded-full bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 28px var(--color-lime)' }}
      />
    </div>
  )
}

export function PartnersSection() {
  const arcRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const captionNameRef = useRef<HTMLHeadingElement>(null)
  const captionRoleRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
      if (!cards.length) return

      const mm = gsap.matchMedia()

      const showCaption = (i: number) => {
        const nameEl = captionNameRef.current
        const roleEl = captionRoleRef.current
        if (!nameEl || !roleEl) return
        nameEl.textContent = TEAM[i].name
        roleEl.textContent = TEAM[i].role
        gsap.fromTo([nameEl, roleEl], { opacity: 0.3, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      }

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const idleTweens: gsap.core.Tween[] = []
        const listeners: Array<{ el: HTMLDivElement; enter: () => void; leave: () => void }> = []
        const positions = cards.map((_, i) => fanPosition(i, TEAM.length))

        cards.forEach((card, i) => {
          const { x, y, rotate, z, opacity } = positions[i]

          gsap.set(card, { x: x * 1.6, y: y - 170, rotate: rotate * 2.2, opacity: 0, zIndex: z })

          gsap.to(card, {
            x,
            y,
            rotate,
            opacity,
            duration: 1,
            delay: i * 0.09,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: arcRef.current,
              start: 'top 75%',
              once: true,
            },
            onComplete: () => {
              idleTweens[i] = gsap.to(card, {
                rotate: rotate + (i % 2 === 0 ? 5 : -5),
                duration: IDLE_WOBBLE_DURATION,
                delay: i * 0.25,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
              })
            },
          })
        })

        // При наведении карточка выезжает вверх относительно своего положения,
        // а соседние карточки раздвигаются в стороны, освобождая место.
        cards.forEach((card, i) => {
          const onEnter = () => {
            idleTweens[i]?.pause()
            const lift = card.offsetHeight / 3
            gsap.to(card, {
              y: positions[i].y - lift,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: 'auto',
            })
            cards.forEach((other, j) => {
              if (j === i) return
              const { x } = positions[j]
              gsap.to(other, {
                x: x + (j < i ? -HOVER_GAP : HOVER_GAP),
                duration: 0.4,
                ease: 'power3.out',
                overwrite: 'auto',
              })
            })
            showCaption(i)
          }
          const onLeave = () => {
            gsap.to(card, {
              y: positions[i].y,
              duration: 0.5,
              ease: 'power3.out',
              overwrite: 'auto',
              onComplete: () => idleTweens[i]?.resume(),
            })
            cards.forEach((other, j) => {
              if (j === i) return
              gsap.to(other, {
                x: positions[j].x,
                duration: 0.5,
                ease: 'power3.out',
                overwrite: 'auto',
              })
            })
            showCaption(CENTER_INDEX)
          }

          card.addEventListener('mouseenter', onEnter)
          card.addEventListener('mouseleave', onLeave)
          listeners.push({ el: card, enter: onEnter, leave: onLeave })
        })

        return () => {
          idleTweens.forEach((tween) => tween?.kill())
          listeners.forEach(({ el, enter, leave }) => {
            el.removeEventListener('mouseenter', enter)
            el.removeEventListener('mouseleave', leave)
          })
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        cards.forEach((card, i) => {
          const { x, y, rotate, z, opacity } = fanPosition(i, TEAM.length)
          gsap.set(card, { x, y, rotate, zIndex: z, opacity })
        })
      })
    },
    { scope: arcRef, dependencies: [] },
  )

  return (
    <section
      id="partners"
      className="relative min-h-dvh flex flex-col justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 63% 48%, var(--color-lime-soft), transparent 26%), linear-gradient(180deg,#ffffff 0%,#f9f9f8 72%,var(--color-surface-soft) 100%)',
      }}
    >
      {/* Декоративные фоновые орбиты и точки — как в остальных блоках */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[58%] w-[1240px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[var(--color-lime-soft)] rotate-[-3deg]" />
        <div className="absolute left-1/2 top-[60%] w-[1040px] h-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-black/[0.06] rotate-[-4deg]" />
        <span className="absolute left-[22%] top-[52%] w-2.5 h-2.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_20px_var(--color-lime-glow)]" />
        <span className="absolute right-[16%] top-[48%] w-2.5 h-2.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_20px_var(--color-lime-glow)]" />
        <span className="absolute right-[12%] bottom-[16%] w-2.5 h-2.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_20px_var(--color-lime-glow)]" />
        <span className="absolute left-1/2 bottom-[10%] w-2.5 h-2.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_20px_var(--color-lime-glow)]" />
      </div>

      <div className="relative z-[5] max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-28">
        <SectionHeading
          title="Партнёры"
          subtitle="Профессиональная защита в ключевых областях права"
          className="text-center"
        />

        {/* Плотная дуга-веер карточек — только десктоп */}
        <div ref={arcRef} className="relative mt-20 h-[560px] hidden lg:block">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute left-1/2 top-6 w-[300px] h-[430px] -ml-[150px]"
              style={{ transformOrigin: 'bottom center' }}
            >
              <PartnerCard />
            </div>
          ))}
        </div>

        {/* Подпись под колодой — переключается на наведённого партнёра */}
        <div className="-mt-6 text-center hidden lg:block relative z-[6]">
          <h3
            ref={captionNameRef}
            className="font-heading text-[25px] font-black leading-none tracking-[-0.03em] text-[var(--color-text)]"
          >
            {TEAM[CENTER_INDEX].name}
          </h3>
          <p ref={captionRoleRef} className="mt-2 text-xl text-[var(--color-muted)]">
            {TEAM[CENTER_INDEX].role}
          </p>
        </div>

        {/* Мобильная и планшетная раскладка — простая сетка без дуги */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 lg:hidden">
          {TEAM.map((member) => (
            <Card key={member.name} className="overflow-hidden">
              <div
                className="w-full aspect-[3/4] flex items-end justify-center pb-6"
                style={{ background: 'linear-gradient(135deg,#ffffff,#f4f4f3)' }}
              >
                <SilhouetteIcon className="w-16 h-20" />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-sm font-extrabold leading-snug text-[var(--color-text)]">
                  {member.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
