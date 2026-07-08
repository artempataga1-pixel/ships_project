'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { TEAM } from '@/constants/content/team'

/* Референс — reference 2/partneri.mp4 (landonorris.com): колода карточек
   раскрывается дугой-веером при входе в вьюпорт и бесконечно покачивается
   на месте (та же механика, что и в компетенциях — kompenecii.mp4, только
   там тайлы с номерами, а тут — портретные карточки людей). Здесь дополнительно
   добавлено наведение: карточка распрямляется и выходит вперёд, как будто её
   вытянули из колоды. */

const ARC_SPACING_X = 250
const ARC_LIFT_Y = 32
const ARC_TILT = 9
const IDLE_WOBBLE_DURATION = 7

function arcPosition(index: number, total: number) {
  const offset = index - (total - 1) / 2
  return {
    x: offset * ARC_SPACING_X,
    y: Math.abs(offset) * ARC_LIFT_Y,
    rotate: offset * ARC_TILT,
    z: Math.round(total - Math.abs(offset)),
  }
}

function SilhouetteIcon() {
  return (
    <svg
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 h-24 opacity-25"
      aria-hidden="true"
    >
      <circle cx="50" cy="35" r="22" fill="white" />
      <path d="M10 120 C10 85 90 85 90 120 Z" fill="white" />
    </svg>
  )
}

function PartnerCard({ name, role }: { name: string; role: string }) {
  return (
    <div
      className="
        relative w-full h-full rounded-2xl overflow-hidden
        border border-[var(--color-card-border)]/40
        bg-gradient-to-b from-zinc-700 to-zinc-900
      "
    >
      <div className="absolute inset-0 flex items-center justify-center pb-10">
        <SilhouetteIcon />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 pb-3 px-4">
        <h3 className="font-heading text-sm font-extrabold leading-snug">{name}</h3>
        <p className="mt-1 text-xs text-white/50">{role}</p>
      </div>
    </div>
  )
}

export function PartnersSection() {
  const arcRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
      if (!cards.length) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const idleTweens: gsap.core.Tween[] = []
        const listeners: Array<{ el: HTMLDivElement; enter: () => void; leave: () => void }> = []

        cards.forEach((card, i) => {
          const { x, y, rotate, z } = arcPosition(i, TEAM.length)

          gsap.set(card, { x: x * 2.2, y: y - 170, rotate: rotate * 2.5, opacity: 0, zIndex: z })

          gsap.to(card, {
            x,
            y,
            rotate,
            opacity: 1,
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

          // При наведении карточка "вынимается из колоды": распрямляется, поднимается и выходит вперёд
          const onEnter = () => {
            idleTweens[i]?.pause()
            gsap.to(card, {
              rotate: 0,
              y: y - 30,
              scale: 1.08,
              zIndex: TEAM.length + 1,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: 'auto',
            })
          }
          const onLeave = () => {
            gsap.to(card, {
              x,
              y,
              rotate,
              scale: 1,
              zIndex: z,
              duration: 0.5,
              ease: 'power3.out',
              overwrite: 'auto',
              onComplete: () => idleTweens[i]?.resume(),
            })
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
          const { x, y, rotate, z } = arcPosition(i, TEAM.length)
          gsap.set(card, { x, y, rotate, zIndex: z, opacity: 1 })
        })
      })
    },
    { scope: arcRef, dependencies: [] },
  )

  return (
    <section id="partners" className="min-h-dvh flex items-center bg-black overflow-hidden">
      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-32">
        <SectionHeading
          title="Партнёры"
          subtitle="Профессиональная защита в ключевых областях права"
          className="text-center"
        />

        {/* Дуга-веер карточек — как в референсе, только десктоп */}
        <div ref={arcRef} className="relative mt-24 h-[420px] hidden lg:block">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute left-1/2 top-0 w-52 aspect-[3/4] -ml-[104px]"
              style={{ transformOrigin: 'bottom center' }}
            >
              <PartnerCard name={member.name} role={member.role} />
            </div>
          ))}
        </div>

        {/* Мобильная и планшетная раскладка — простая сетка без дуги */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 lg:hidden">
          {TEAM.map((member) => (
            <Card key={member.name} className="overflow-hidden">
              <div className="w-full aspect-[3/4] bg-gradient-to-b from-zinc-700 to-zinc-900 flex items-end justify-center pb-6">
                <SilhouetteIcon />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-sm font-extrabold leading-snug">{member.name}</h3>
                <p className="mt-1 text-xs text-white/50">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
