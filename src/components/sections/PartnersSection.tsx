'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TEAM } from '@/constants/content/team'
import type { TeamMember } from '@/types/content'

/* Блок «Партнёры» — колода из 3 готовых карточек-визиток (фото + имя + роль
   впечатаны в PNG, public/images/team). Карточки раскрываются тесным веером
   при входе в вьюпорт и покачиваются на месте. При наведении — магнитное
   отталкивание (референс mt-webdesign.ru/repulsion, адаптирован с jQuery+Tilda
   на GSAP): активная карточка встаёт ровно и вырастает, соседи разлетаются в
   стороны с 3D-наклоном и уменьшаются. Управляющий партнёр Шумская — по центру. */

const IDLE_WOBBLE_DURATION = 7
// Магнитное отталкивание: на сколько px сосед отъезжает от активной карточки.
const REPEL_X = 120
const REPEL_Y = 30

// Целевые позиции веера для 3 горизонтальных карточек (центр — управляющий).
type FanPos = { x: number; y: number; rotate: number; z: number; opacity: number }
const FAN: FanPos[] = [
  { x: -300, y: 48, rotate: -9, z: 3, opacity: 0.94 }, // левая
  { x: 0, y: -8, rotate: 0, z: 5, opacity: 1 }, //        центр (Шумская)
  { x: 300, y: 48, rotate: 9, z: 4, opacity: 0.94 }, //   правая
]

// Fallback-геометрия на случай, если состав TEAM изменят (не 3 персоны).
function arcFallback(index: number, total: number): FanPos {
  const offset = index - (total - 1) / 2
  return {
    x: offset * 300,
    y: Math.abs(offset) * 48,
    rotate: offset * 9,
    z: Math.round(total - Math.abs(offset)),
    opacity: 1 - Math.abs(offset) * 0.06,
  }
}

function fanPosition(index: number, total: number): FanPos {
  return total === FAN.length ? FAN[index] : arcFallback(index, total)
}

// Готовая карточка-визитка: контент (фото, имя, роль) впечатан в JPG,
// а «карточность» — скругление, белую подложку и тень — даёт обёртка.
function PartnerCard({ member }: { member: TeamMember }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-18px_rgba(25,35,10,0.35)] ring-1 ring-black/[0.06]">
      <Image
        src={member.photo!}
        alt={`${member.name} — ${member.role}`}
        fill
        sizes="460px"
        className="object-cover"
        draggable={false}
      />
    </div>
  )
}

interface PartnersSectionProps {
  /** 'flow' — обычная секция потока; 'story' — оверлей внутри ScrollStory. */
  variant?: 'flow' | 'story'
}

export function PartnersSection({ variant = 'flow' }: PartnersSectionProps) {
  const isStory = variant === 'story'
  const arcRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const panelsRef = useRef<(HTMLElement | null)[]>([])

  useGSAP(
    () => {
      const cards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null)
      if (!cards.length) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const idleTweens: gsap.core.Tween[] = []
        const listeners: Array<{ el: HTMLDivElement; enter: () => void; leave: () => void }> = []
        const positions = cards.map((_, i) => fanPosition(i, TEAM.length))
        const panels = panelsRef.current

        // Панели-регалии спрятаны за краем экрана, повернуты «в глубину» (3D).
        const panelDir = (i: number) => (TEAM[i]?.panelSide === 'left' ? -1 : 1)
        panels.forEach((panel, i) => {
          if (panel) gsap.set(panel, { xPercent: panelDir(i) * 118, rotateY: panelDir(i) * -42, autoAlpha: 0 })
        })
        const showPanel = (i: number) => {
          panels.forEach((panel, j) => {
            if (!panel) return
            gsap.to(panel, {
              xPercent: j === i ? 0 : panelDir(j) * 118,
              rotateY: j === i ? panelDir(j) * -7 : panelDir(j) * -42,
              autoAlpha: j === i ? 1 : 0,
              duration: j === i ? 0.85 : 0.4,
              ease: j === i ? 'power4.out' : 'power2.in',
              overwrite: 'auto',
            })
          })
        }
        const hidePanels = () => {
          panels.forEach((panel, j) => {
            if (!panel) return
            gsap.to(panel, {
              xPercent: panelDir(j) * 118,
              rotateY: panelDir(j) * -42,
              autoAlpha: 0,
              duration: 0.5,
              ease: 'power2.in',
              overwrite: 'auto',
            })
          })
        }

        const startWobble = (card: HTMLDivElement, i: number, rotate: number) => {
          idleTweens[i] = gsap.to(card, {
            rotate: rotate + (i % 2 === 0 ? 5 : -5),
            duration: IDLE_WOBBLE_DURATION,
            delay: i * 0.25,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        }

        cards.forEach((card, i) => {
          const { x, y, rotate, z, opacity } = positions[i]

          if (isStory) {
            // В story появлением рулит таймлайн стори (opacity оверлея) — веер
            // сразу разложен и покачивается, без scroll-триггерного въезда.
            gsap.set(card, { x, y, rotate, opacity, zIndex: z })
            startWobble(card, i, rotate)
            return
          }

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
            onComplete: () => startWobble(card, i, rotate),
          })
        })

        // Магнитное отталкивание: активная встаёт ровно и вырастает, соседи
        // разлетаются с 3D-наклоном. Перспективу даёт arcRef (perspective в стиле).
        cards.forEach((card, i) => {
          const onEnter = () => {
            idleTweens.forEach((tween) => tween?.pause())
            showPanel(i)

            cards.forEach((other, j) => {
              gsap.killTweensOf(other)
              if (j === i) {
                // активная — прямо, крупнее, поверх соседей, чуть выше
                other.style.zIndex = '100'
                gsap.to(other, {
                  x: positions[j].x,
                  y: positions[j].y - 26,
                  rotate: 0,
                  rotationX: 0,
                  rotationY: 0,
                  scale: 1.12,
                  transformOrigin: 'center center',
                  duration: 1.1,
                  ease: 'elastic.out(0.5, 0.3)',
                  overwrite: 'auto',
                })
                return
              }
              // сосед — отталкивается от активной, наклоняется, уменьшается
              const dirX = j < i ? -1 : 1
              const dirY = j % 2 === 0 ? -1 : 1
              const distance = Math.abs(i - j)
              const tiltX = dirY * Math.max(3, 10 - distance * 2)
              const tiltY = -dirX * Math.max(8, 30 - distance * 6)
              other.style.zIndex = String(positions[j].z)
              gsap.to(other, {
                x: positions[j].x + dirX * REPEL_X,
                y: positions[j].y + dirY * REPEL_Y,
                rotate: positions[j].rotate,
                rotationX: tiltX,
                rotationY: tiltY,
                scale: 0.9,
                transformOrigin: 'center center',
                duration: 1.1,
                ease: 'elastic.out(0.5, 0.3)',
                overwrite: 'auto',
              })
            })
          }
          const onLeave = () => {
            hidePanels()
            cards.forEach((other, j) => {
              gsap.killTweensOf(other)
              other.style.zIndex = String(positions[j].z)
              gsap.to(other, {
                x: positions[j].x,
                y: positions[j].y,
                rotate: positions[j].rotate,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 1.1,
                ease: 'elastic.out(0.5, 0.3)',
                overwrite: 'auto',
                onComplete: () => idleTweens[j]?.resume(),
              })
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
          const { x, y, rotate, z, opacity } = fanPosition(i, TEAM.length)
          gsap.set(card, { x, y, rotate, zIndex: z, opacity })
        })
      })
    },
    { scope: arcRef, dependencies: [] },
  )

  return (
    <section
      {...(!isStory && { id: 'partners' })}
      className={
        isStory
          ? 'relative flex h-full w-full flex-col justify-center overflow-hidden'
          : 'relative min-h-dvh flex flex-col justify-center overflow-hidden'
      }
      style={
        isStory
          ? // прозрачный радиальный glow — под ним виден замерший кадр видео
            {
              background:
                'radial-gradient(circle at 63% 48%, var(--color-lime-soft), transparent 30%)',
            }
          : {
              background:
                'radial-gradient(circle at 63% 48%, var(--color-lime-soft), transparent 26%), linear-gradient(180deg,#ffffff 0%,#f9f9f8 72%,var(--color-surface-soft) 100%)',
            }
      }
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

      {/* На lg контент поднят выше (py-14 вместо py-28), чтобы внизу оставалась
          полоса под выезжающую панель с регалиями и она не накрывала карточки. */}
      <div className="relative z-[5] max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-28 lg:py-14">
        <SectionHeading
          title="Партнёры"
          subtitle="Профессиональная защита в ключевых областях права"
          className="text-center"
        />

        {/* Плотная дуга-веер карточек — только десктоп */}
        <div
          ref={arcRef}
          className="relative mt-20 lg:mt-12 h-[460px] hidden lg:block"
          style={{ perspective: '1600px' }}
        >
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              ref={(el) => {
                cardsRef.current[i] = el
              }}
              className="absolute left-1/2 top-6 w-[460px] h-[307px] -ml-[230px]"
              style={{ transformOrigin: 'bottom center' }}
            >
              <PartnerCard member={member} />
            </div>
          ))}
        </div>

        {/* Мобильная и планшетная раскладка — простая сетка карточек-визиток */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="relative w-full aspect-[3/2] overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_-14px_rgba(25,35,10,0.3)] ring-1 ring-black/[0.06]"
            >
              <Image
                src={member.photo!}
                alt={`${member.name} — ${member.role}`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Выезжающие 3D-панели с регалиями (десктоп). Живут в нижней полосе секции
          под карточками (z-[4] < z-[5] контента), поэтому карточки не перекрывают.
          Сторона вылета — panelSide из TEAM: Максим и Анна справа, Арина слева. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-[4] hidden lg:block"
        style={{ perspective: '1500px' }}
      >
        {TEAM.map((member, i) => (
          <aside
            key={member.name}
            ref={(el) => {
              panelsRef.current[i] = el
            }}
            aria-hidden
            className={`invisible absolute bottom-0 w-[min(680px,46vw)] rounded-2xl border border-white/10 bg-[rgba(37,41,44,0.82)] p-7 text-white opacity-0 shadow-[0_44px_90px_-26px_rgba(12,18,8,0.65)] backdrop-blur-md ${
              member.panelSide === 'left' ? 'left-6' : 'right-6'
            }`}
            style={{
              transformOrigin: member.panelSide === 'left' ? 'left center' : 'right center',
            }}
          >
            <span
              className={`pointer-events-none absolute top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)] ${
                member.panelSide === 'left' ? 'left-0' : 'right-0'
              }`}
              style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-lime)]">
              {member.role}
            </p>
            <h3 className="mt-1.5 text-xl font-semibold tracking-tight">{member.name}</h3>
            <ul className="mt-4 space-y-2">
              {member.achievements?.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-snug text-white/80">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        ))}
      </div>
    </section>
  )
}
