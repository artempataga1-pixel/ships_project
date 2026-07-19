'use client'

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TEAM } from '@/constants/content/team'
import type { TeamMember } from '@/types/content'

// useLayoutEffect на сервере даёт warning — на SSR подменяем на useEffect
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

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

// Только для мобильной сетки (см. ниже) — управляющий партнёр первой карточкой.
// sort стабилен (ES2019+), остальные сохраняют исходный порядок TEAM.
const MOBILE_TEAM_ORDER: TeamMember[] = [...TEAM].sort(
  (a, b) => Number(b.role === 'Управляющий партнёр') - Number(a.role === 'Управляющий партнёр'),
)

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

// Мобильная карточка-визитка с переворотом по тапу: лицо — фото, обратная
// сторона — графитовая панель с регалиями (имя/роль уже есть на фото, поэтому
// не дублируем). Обратная сторона НЕ скроллится (см. ниже, топ-5 регалий) —
// собственный скролл внутри карточки конфликтовал с обычным скроллом
// страницы (палец «застревал» в карточке).
function MobilePartnerCard({ member }: { member: TeamMember }) {
  const [flipped, setFlipped] = useState(false)
  // На мобильной обратной стороне регалии не скроллятся (карточка занимает
  // весь экран — скролл по ней конфликтовал с обычным скроллом страницы),
  // поэтому берём не более 5 самых весомых пунктов, а не весь список
  // (полный — только в десктопной выезжающей панели, там своя авто-подгонка).
  const achievements = (member.achievements ?? []).slice(0, 5)

  const toggle = () => setFlipped((v) => !v)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div className="aspect-[3/2] w-full" style={{ perspective: '1200px' }}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${member.name}, ${member.role}. Нажмите, чтобы посмотреть регалии`}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="relative h-full w-full cursor-pointer outline-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Лицевая сторона — готовая фото-визитка (как раньше) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_-14px_rgba(25,35,10,0.3)] ring-1 ring-black/[0.06]"
          style={{ backfaceVisibility: 'hidden', pointerEvents: flipped ? 'none' : 'auto' }}
        >
          <Image
            src={member.photo!}
            alt={`${member.name} — ${member.role}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Подсказка, что карточку можно перевернуть */}
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
            <svg
              aria-hidden
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
              <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.13 5.87l-2.12 2.12M7.99 15.89l-2.12 2.12M18.13 18.13l-2.12-2.12M7.99 8.11 5.87 5.99" />
            </svg>
            Нажмите
          </span>
        </div>

        {/* Обратная сторона — графитовая панель с регалиями. overflow-hidden, не
            overflow-y-auto: своя прокрутка внутри карточки перехватывала
            вертикальный тач-скролл страницы (на iOS палец «упирался» в
            карточку даже когда она не перевёрнута — известный баг WebKit с
            backface-visibility:hidden). pointer-events:none, пока не
            перевёрнута — дополнительная подстраховка от того же перехвата. */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl bg-[#25292c] p-4 ring-1 ring-white/10 shadow-[0_18px_44px_-14px_rgba(25,35,10,0.3)]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: flipped ? 'auto' : 'none',
          }}
        >
          <span
            className="pointer-events-none absolute left-0 top-[8%] h-[84%] w-[3px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
          {achievements.length > 0 ? (
            <ul className="flex h-full flex-col justify-center gap-1.5 pl-2.5">
              {achievements.map((item) => (
                <li key={item} className="flex gap-2 text-[10.5px] leading-[1.3] text-white/85">
                  <span className="mt-[0.45em] h-[0.4em] w-[0.4em] shrink-0 rounded-full bg-[var(--color-lime)]" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="pl-2.5 text-[13px] leading-snug text-white/70">
              Информация о регалиях уточняется.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface PartnersSectionProps {
  /** 'flow' — обычная секция потока; 'story' — оверлей внутри ScrollStory. */
  variant?: 'flow' | 'story'
}

export function PartnersSection({ variant = 'flow' }: PartnersSectionProps) {
  const isStory = variant === 'story'
  const sectionRef = useRef<HTMLElement>(null)
  const arcRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const panelsRef = useRef<(HTMLElement | null)[]>([])
  const panelSpaceRef = useRef<HTMLDivElement>(null)

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

  // Панель регалий может свободно наезжать на карточки (z-index держит карточки
  // читаемыми поверх) — поэтому в качестве доступного места берём почти всю
  // высоту секции, а не только узкую полоску под карточками. Это подстраховка
  // только на случай экстремально низких окон: обычно даже самый длинный
  // список регалий (Анна, 8 пунктов) помещается без какого-либо сжатия.
  useClientLayoutEffect(() => {
    const panels = panelsRef.current.filter((p): p is HTMLElement => p !== null)
    const section = sectionRef.current
    if (!panels.length || !section || !isStory) return

    const MIN_FIT = 0.72
    const lastFactors: number[] = panels.map(() => -1)

    const measure = () => {
      const available = Math.max(0, section.getBoundingClientRect().height - 24)

      panels.forEach((p, i) => {
        const needed = p.scrollHeight
        const factor = needed > available ? Math.max(MIN_FIT, available / needed) : 1
        // gsap.set трогаем только при реальном изменении — иначе на каждый
        // ResizeObserver-тик мы бы переустанавливали scale ПОВЕРХ активного
        // showPanel/hidePanels твина того же элемента (xPercent/rotateY/autoAlpha),
        // рискуя сбить его прямо во время наведения.
        if (factor !== lastFactors[i]) {
          lastFactors[i] = factor
          gsap.set(p, { scale: factor })
        }
        p.style.maxHeight = `${Math.ceil(available / factor)}px`
      })
    }

    measure()

    const ro = new ResizeObserver(measure)
    panels.forEach((p) => ro.observe(p))
    ro.observe(section)

    return () => ro.disconnect()
  }, [isStory])

  return (
    <section
      ref={sectionRef}
      {...(!isStory && { id: 'partners' })}
      className={
        isStory
          ? 'relative flex h-full w-full flex-col justify-center lg:justify-start overflow-hidden'
          : 'relative min-h-svh scroll-mt-16 flex flex-col justify-start overflow-hidden lg:min-h-dvh'
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

      {/* На lg секция прижата к верху (justify-start), заголовок сразу под шапкой —
          внизу остаётся полоса под выезжающую панель с регалиями. */}
      <div className="relative z-[5] max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-28 lg:pt-16 lg:pb-10">
        <SectionHeading
          title="Партнёры"
          subtitle="Профессиональная защита в ключевых областях права"
          className="text-center"
        />

        {/* Плотная дуга-веер карточек — только десктоп */}
        <div
          ref={arcRef}
          className="relative mt-20 lg:mt-8 h-[460px] hidden lg:block"
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

        {/* Мобильная и планшетная раскладка — простая сетка карточек-визиток.
            Управляющий партнёр (Шумская Анна) — первой карточкой: в десктоп-веере
            её акцентирует центральное место, в плоской сетке та же роль работает
            только через порядок. Локальная сортировка не трогает TEAM/cardsRef
            десктопной дуги выше — там позиция в массиве держит fanPosition/panelSide. */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
          {MOBILE_TEAM_ORDER.map((member) => (
            <MobilePartnerCard key={member.name} member={member} />
          ))}
        </div>
      </div>

      {/* Выезжающие 3D-панели с регалиями (десктоп). Абсолютно позиционированы
          от всей секции (не только полоски под карточками) — панель может
          свободно наезжать на карточки. Контент-враппер с карточками — свой
          stacking context (position:relative + z-[5]), поэтому сравнивается с
          этим блоком как единое целое независимо от z-index карточек внутри
          (там до 100 при наведении) — z-[6] здесь гарантирует, что открытая
          панель всегда поверх ВСЕХ карточек, и текст регалий никогда не
          перекрывается их непрозрачными фото. max-w-[1440px] mx-auto — та же
          система координат, что у контент-враппера с карточками, чтобы центры
          совпадали. Сторона вылета — panelSide из TEAM: Максим и Анна справа,
          Арина слева. */}
      <div
        ref={panelSpaceRef}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-[6] mx-auto hidden w-full max-w-[1440px] px-8 lg:block md:px-16"
        style={{ perspective: '1500px' }}
      >
        {TEAM.map((member, i) => {
          // Центральная карточка (Шумская) стоит ровно на линии 50%, по которой
          // обычно режется left-1/2/right-1/2 — из-за этого её собственная панель
          // упиралась прямо в её же фото. Соседние карточки от этой линии смещены
          // (FAN x: ±300), поэтому их не задевает. Отодвигаем внутренний край
          // панели центральной карточки за пределы её увеличенной на hover копии
          // (scale 1.12 → 460×1.12/2 ≈ 258px от центра) с запасом.
          const isCenter = fanPosition(i, TEAM.length).x === 0
          const CENTER_CLEARANCE = 'calc(50% + 290px)'
          return (
            <aside
              key={member.name}
              ref={(el) => {
                panelsRef.current[i] = el
              }}
              aria-hidden
              className={`invisible absolute bottom-0 max-h-full overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[rgba(37,41,44,0.82)] text-white opacity-0 shadow-[0_44px_90px_-26px_rgba(12,18,8,0.65)] backdrop-blur-md ${
                member.panelSide === 'left'
                  ? isCenter
                    ? 'right-1/2'
                    : 'left-6 right-1/2'
                  : isCenter
                    ? 'left-1/2'
                    : 'left-1/2 right-6'
              }`}
              style={{
                // bottom — совпадает с CSS bottom-0 панели: scale (см. измерительный
                // эффект выше) ужимает её к этой же точке, а не «от центра».
                transformOrigin: member.panelSide === 'left' ? 'left bottom' : 'right bottom',
                // Типографика панели масштабируется от высоты вьюпорта: на 2K —
                // крупная (×1.5), на низких экранах ужимается, чтобы панель
                // оставалась в полосе под карточками и не пряталась за ними.
                padding: 'clamp(24px, 3.2vh - 4px, 40px)',
                ...(isCenter && member.panelSide === 'right' ? { left: CENTER_CLEARANCE } : {}),
                ...(isCenter && member.panelSide === 'left' ? { right: CENTER_CLEARANCE } : {}),
              }}
            >
              <span
                className={`pointer-events-none absolute top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)] ${
                  member.panelSide === 'left' ? 'left-0' : 'right-0'
                }`}
                style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
              />
              <p
                className="font-semibold uppercase tracking-[0.22em] text-[var(--color-lime)]"
                style={{ fontSize: 'clamp(11px, 1.1vh + 1px, 16px)' }}
              >
                {member.role}
              </p>
              <h3
                className="mt-2 font-semibold tracking-tight"
                style={{ fontSize: 'clamp(20px, 2.2vh - 1px, 30px)' }}
              >
                {member.name}
              </h3>
              {/* Длинный список регалий — в две колонки, чтобы панель росла вширь,
                  а не только в высоту. */}
              <ul
                className={`mt-5 ${
                  (member.achievements?.length ?? 0) > 4
                    ? 'grid grid-cols-2 gap-x-10 gap-y-3'
                    : 'space-y-3'
                }`}
              >
                {member.achievements?.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 leading-snug text-white/85"
                    style={{ fontSize: 'clamp(13px, 1.1vh + 4px, 19px)' }}
                  >
                    <span
                      className="shrink-0 rounded-full bg-[var(--color-lime)]"
                      style={{ width: '0.5em', height: '0.5em', marginTop: '0.42em' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          )
        })}
      </div>
    </section>
  )
}
