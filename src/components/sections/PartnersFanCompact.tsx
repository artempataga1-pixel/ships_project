'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TEAM } from '@/constants/content/team'

/* Компактный мобильный веер партнёров для MobileScrubScene — уменьшенная
   геометрия десктопного FAN (PartnersSection.tsx), без магнитного
   отталкивания на hover (на тач его не будет естественным образом) —
   только лёгкое покачивание на месте, как idle-анимация десктопной версии.
   Управляющий партнёр (Шумская) — по центру, как и в десктопном FAN. */

interface FanPos {
  x: number
  y: number
  rotate: number
  z: number
}

const FAN_COMPACT: FanPos[] = [
  { x: -88, y: 16, rotate: -8, z: 3 }, // левая
  { x: 0, y: -6, rotate: 0, z: 5 }, //    центр (Шумская)
  { x: 88, y: 16, rotate: 8, z: 4 }, //   правая
]

const IDLE_WOBBLE_DURATION = 6

// Фото — готовые визитки с вшитым в JPG именем/должностью (см. TEAM),
// пропорция ~460:307 (как в десктопном FAN, PartnersSection.tsx) — квадратный
// контейнер обрезал бы под object-cover четверть ширины с текстом.
const CARD_WIDTH = 170
const CARD_HEIGHT = Math.round((CARD_WIDTH * 307) / 460)

export function PartnersFanCompact() {
  const arcRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)
      if (!cards.length) return

      const tweens = cards.map((card, i) => {
        const pos = FAN_COMPACT[i] ?? FAN_COMPACT[FAN_COMPACT.length - 1]
        gsap.set(card, { x: pos.x, y: pos.y, rotate: pos.rotate, zIndex: pos.z })
        return gsap.to(card, {
          rotate: pos.rotate + (i % 2 === 0 ? 4 : -4),
          duration: IDLE_WOBBLE_DURATION,
          delay: i * 0.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      return () => {
        tweens.forEach((t) => t.kill())
      }
    },
    { scope: arcRef, dependencies: [] },
  )

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-6">
      <SectionHeading
        id="partners-heading-compact"
        title="Партнёры"
        subtitle="Профессиональная защита в ключевых областях права"
        className="text-center"
      />

      <div
        ref={arcRef}
        className="relative w-full max-w-[320px]"
        style={{ perspective: '900px', height: CARD_HEIGHT + 32 }}
      >
        {TEAM.map((member, i) => (
          <div
            key={member.name}
            ref={(el) => {
              cardsRef.current[i] = el
            }}
            className="absolute left-1/2 top-0"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              marginLeft: -CARD_WIDTH / 2,
              transformOrigin: 'bottom center',
            }}
          >
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden bg-white shadow-[0_20px_40px_-14px_rgba(25,35,10,0.35)] ring-1 ring-black/[0.06]">
              <Image
                src={member.photo!}
                alt={`${member.name} — ${member.role}`}
                fill
                sizes={`${CARD_WIDTH}px`}
                className="object-cover"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
