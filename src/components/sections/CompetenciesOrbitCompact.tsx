'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { KEY_COMPETENCIES } from '@/constants/content/key-competencies'

/* Компактный блок компетенций для MobileScrubScene (континуальный скраб, <1280px).

   Здесь была эллиптическая орбита — зеркало десктопной. На 10 карточках она
   перестала работать чисто арифметически: сцена 360×240 даёт внешний эллипс
   rx≈120, а любому второму ярусу остаётся зазор ~53px при карточке 84px, то есть
   карточки неизбежно наезжают друг на друга и текст рвётся. Уместить 10 штук
   одним витком тоже нельзя: периметр эллипса ~660px против ~840px, которые
   требуют карточки.

   Поэтому на узких экранах вместо облёта — две встречные горизонтальные ленты
   по 5 компетенций: верхняя едет влево, нижняя вправо. Движение осталось (блок
   не превращается в статичный список), плашки прямоугольные, поэтому названия
   читаются целиком без ужимания кегля. Десктопная орбита (CompetenciesSection)
   при этом не трогается — там своя геометрия и места хватает.

   Имя компонента и id заголовка сохранены намеренно: `competencies` захардкожен
   в useStoryController/HomeAnchorScroll, переименование ломает навигацию. */

// Скорости лент чуть разные — встречное движение не читается как одно полотно
const ROW_DURATION = [38, 44]
// Ленты дублируются ровно вдвое, поэтому петля бесшовна на xPercent ±50
const LOOP_SHIFT = 50

const ROWS = [KEY_COMPETENCIES.slice(0, 5), KEY_COMPETENCIES.slice(5)]

export function CompetenciesOrbitCompact() {
  const stageRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const rows = rowsRef.current.filter((r): r is HTMLDivElement => r !== null)
      if (!rows.length) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        rows.forEach((row, i) => {
          // Верхняя лента едет влево (0 → -50), нижняя вправо (-50 → 0)
          const goesLeft = i % 2 === 0
          gsap.fromTo(
            row,
            { xPercent: goesLeft ? 0 : -LOOP_SHIFT },
            {
              xPercent: goesLeft ? -LOOP_SHIFT : 0,
              duration: ROW_DURATION[i] ?? ROW_DURATION[0],
              ease: 'none',
              repeat: -1,
            },
          )
        })
      })

      // reduced-motion до этого компонента не доходит (ScrollStory уводит в
      // FlowFallback), но если медиа-условие когда-нибудь поменяют — ленты
      // просто встанут на месте, а не поедут
      mm.add('(prefers-reduced-motion: reduce)', () => {
        rows.forEach((row) => gsap.set(row, { xPercent: 0 }))
      })
    },
    { scope: stageRef, dependencies: [] },
  )

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden">
      <div className="px-6">
        <SectionHeading
          id="competencies-heading-compact"
          title="Ключевые компетенции"
          subtitle="Конкретные задачи, которые мы ведём чаще всего"
          className="text-center"
        />
      </div>

      <div ref={stageRef} className="flex w-full flex-col gap-3">
        {ROWS.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="relative w-full overflow-hidden"
            /* Края лент растворяются, иначе плашки обрубаются по границе экрана */
            style={{
              maskImage:
                'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
          >
            <div
              ref={(el) => {
                rowsRef.current[rowIndex] = el
              }}
              data-competency-row
              className="flex w-max gap-3"
            >
              {/* Контент продублирован ровно вдвое — на этом держится бесшовность */}
              {[...row, ...row].map((competency, i) => (
                <div
                  key={`${competency.id}-${i}`}
                  data-competency-plate
                  className="
                    relative flex h-[62px] w-[176px] shrink-0 items-center
                    rounded-[14px] border border-[var(--color-line)]
                    bg-gradient-to-br from-white to-[var(--color-surface-soft)]
                    pl-4 pr-5 shadow-[0_16px_34px_rgba(0,0,0,0.13)]
                  "
                >
                  <span
                    className="pointer-events-none absolute right-[-1px] top-3 bottom-3 w-[3px] rounded-full bg-[var(--color-lime)]"
                    style={{ boxShadow: '0 0 14px var(--color-lime)' }}
                  />
                  <p className="text-[12px] font-semibold leading-[1.2] text-[var(--color-text)]">
                    {competency.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
