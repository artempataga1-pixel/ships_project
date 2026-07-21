'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PRACTICES } from '@/constants/content/practice'

/* Компактная мобильная орбита для MobileScrubScene (континуальный скраб,
   <1280px) — тот же приём облёта карточек по эллипсу, что у десктопной
   CompetenciesSection, но: без mouse-parallax/hover-физики (на тач их
   естественно не будет — код для них просто не нужен) и без scroll-triggered
   fade-in (появлением рулит оверлей MobileScrubScene).

   В отличие от десктопа заголовок НЕ по центру орбиты — на узком экране
   карточки за полный оборот проходят через любую высоту (включая линию
   заголовка), а горизонтального просвета по бокам от текста на 360-430px
   ширины физически нет. Поэтому заголовок и орбита — раздельные блоки друг
   под другом, орбита крутится в своей собственной фиксированной по высоте
   зоне, где заголовку взяться неоткуда. */

const ORBIT_DURATION = 30
const CARD_TILT = 5
const STAGE_HEIGHT = 240

function orbitPoint(angleDeg: number, radius: { x: number; y: number }) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: Math.cos(rad) * radius.x, y: Math.sin(rad) * radius.y }
}

export function CompetenciesOrbitCompact() {
  const stageRef = useRef<HTMLDivElement>(null)
  const orbitRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)
      const stage = stageRef.current
      if (!cards.length || !stage) return

      const computeRadius = () => {
        const cardHalf = (cardsRef.current[0]?.clientWidth ?? 84) / 2
        return {
          x: Math.max(70, stage.clientWidth / 2 - cardHalf - 8),
          y: Math.max(56, stage.clientHeight / 2 - cardHalf - 6),
        }
      }
      let radius = computeRadius()
      const onResize = () => {
        radius = computeRadius()
      }
      window.addEventListener('resize', onResize)

      gsap.set(orbitRef.current, { opacity: 1 })

      const tweens = cards.map((card, i) => {
        const startAngle = (360 / PRACTICES.length) * i - 90
        const state = { angle: startAngle }
        const tilt = i % 2 === 0 ? CARD_TILT : -CARD_TILT
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          ...orbitPoint(startAngle, radius),
          rotation: tilt,
        })
        const setX = gsap.quickSetter(card, 'x', 'px')
        const setY = gsap.quickSetter(card, 'y', 'px')
        return gsap.to(state, {
          angle: startAngle + 360,
          duration: ORBIT_DURATION,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            const p = orbitPoint(state.angle, radius)
            setX(p.x)
            setY(p.y)
          },
        })
      })

      return () => {
        window.removeEventListener('resize', onResize)
        tweens.forEach((t) => t.kill())
      }
    },
    { scope: stageRef, dependencies: [] },
  )

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-6">
      <SectionHeading
        id="competencies-heading-compact"
        title="Наши компетенции"
        subtitle="Профессионалы с многолетним опытом"
        className="text-center"
      />

      <div
        ref={stageRef}
        className="relative w-full max-w-[360px]"
        style={{ height: STAGE_HEIGHT }}
      >
        <div ref={orbitRef} className="absolute inset-0" style={{ opacity: 0 }}>
          {PRACTICES.map((practice, i) => (
            <div
              key={practice.title}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute left-1/2 top-1/2 w-[84px]"
            >
              <div className="relative flex aspect-square items-center justify-center rounded-[14px] border border-[var(--color-line)] bg-gradient-to-br from-white to-[var(--color-surface-soft)] shadow-[0_16px_34px_rgba(0,0,0,0.13)]">
                <span
                  className="pointer-events-none absolute right-[-1px] top-2 bottom-2 w-[3px] rounded-full bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 14px var(--color-lime)' }}
                />
                <p className="px-2 text-center text-[9.5px] font-semibold leading-[1.15] text-[var(--color-text)]">
                  {practice.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
