'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Card } from '@/components/ui/Card'
import { TEAM } from '@/constants/content/team'

/* Референс — reference 2/partneri.mp4 и reference 2/pam.mp4 (landonorris.com):
   плотная колода крупных портретных карточек раскрывается тесным веером-дугой
   при входе в вьюпорт и бесконечно покачивается на месте (та же механика,
   что и в компетенциях — kompenecii.mp4, только там тайлы с номерами).
   Подпись с именем — одна, под колодой, как "Follow Lando on social media"
   в референсе, и переключается на наведённую карточку. Наведение (см. pam.mp4)
   НЕ поднимает карточку поверх соседей через z-index — вместо этого соседние
   карточки раздвигаются в стороны (влево/вправо от наведённой), освобождая
   ей место, а сама наведённая карточка просто распрямляется на своём месте. */

const ARC_SPACING_X = 96
const ARC_LIFT_Y = 30
const ARC_TILT = 15
const IDLE_WOBBLE_DURATION = 7
const HOVER_GAP = 64
const CENTER_INDEX = Math.floor((TEAM.length - 1) / 2)

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
      className="w-24 h-28 opacity-25"
      aria-hidden="true"
    >
      <circle cx="50" cy="35" r="22" fill="white" />
      <path d="M10 120 C10 85 90 85 90 120 Z" fill="white" />
    </svg>
  )
}

function PartnerCard() {
  return (
    <div
      className="
        relative w-full h-full rounded-2xl overflow-hidden
        border border-[var(--color-card-border)]/40
        bg-gradient-to-b from-zinc-700 to-zinc-900
        flex items-center justify-center
      "
    >
      <SilhouetteIcon />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
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
        const positions = cards.map((_, i) => arcPosition(i, TEAM.length))

        cards.forEach((card, i) => {
          const { x, y, rotate, z } = positions[i]

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
        })

        // При наведении карточка НЕ выходит поверх соседей и не распрямляется —
        // она просто выезжает вверх относительно своего текущего положения
        // (см. pam.mp4), а соседние карточки раздвигаются в стороны, освобождая место
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

        {/* Плотная дуга-веер карточек — как в референсе, только десктоп */}
        <div ref={arcRef} className="relative mt-24 h-[540px] hidden lg:block">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute left-1/2 top-0 w-64 aspect-[9/16] -ml-32"
              style={{ transformOrigin: 'bottom center' }}
            >
              <PartnerCard />
            </div>
          ))}
        </div>

        {/* Подпись под колодой — переключается на наведённого партнёра */}
        <div className="mt-10 text-center hidden lg:block">
          <h3 ref={captionNameRef} className="font-heading text-xl font-extrabold leading-snug">
            {TEAM[CENTER_INDEX].name}
          </h3>
          <p ref={captionRoleRef} className="mt-1 text-sm text-white/50">
            {TEAM[CENTER_INDEX].role}
          </p>
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
