'use client'

import { useId, useState } from 'react'
import type { PracticeServiceGroup } from '@/types/content'

/* Блок «Что мы делаем» на странице практики.

   Перечень услуг в отдельных практиках доходит до 23 пунктов — прямое
   требование заказчика: не выводить их одной сплошной колонкой. Решение —
   смысловые группы в раскрывающихся ghost-панелях (тот же паттерн, что у
   блока «Результат»: белая полупрозрачная панель, backdrop-blur, лайм-полоса),
   внутри группы на desktop две колонки, на мобиле одна.

   Первая группа раскрыта, остальные свёрнуты — страница сразу читается,
   но не превращается в простыню.

   Анимация высоты — через grid-template-rows 0fr→1fr: не требует измерения
   контента в JS и не ломается при переносах строк на узких экранах.
   Свёрнутая группа получает inert — её пункты выпадают из фокуса и из дерева
   доступности, хотя физически остаются в DOM ради анимации. */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      className={`shrink-0 text-[var(--color-muted)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M2 5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ServicesAccordion({ groups }: { groups: PracticeServiceGroup[] }) {
  // Первая группа раскрыта по умолчанию, остальные свёрнуты.
  const [openIndexes, setOpenIndexes] = useState<number[]>([0])
  const baseId = useId()

  const toggle = (index: number) =>
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {groups.map((group, index) => {
        const open = openIndexes.includes(index)
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <section
            key={group.title}
            className="relative overflow-hidden rounded-[var(--radius-lg)] border"
            style={{
              background: 'rgba(255,255,255,.64)',
              borderColor: 'rgba(255,255,255,.85)',
              backdropFilter: 'blur(8px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Лайм-полоса слева — проявляется у раскрытой группы (паттерн из
                панели «Результат»), у свёрнутой приглушена до тонкой метки. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute left-0 top-[12%] w-[3px] bg-[var(--color-lime)] transition-all duration-300 ease-out motion-reduce:transition-none ${
                open ? 'h-[76%] opacity-100' : 'h-[34%] opacity-45'
              }`}
              style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
            />

            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full items-center gap-4 px-6 py-6 text-left transition-colors duration-200 hover:bg-white/45 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-lime-ink)] motion-reduce:transition-none md:gap-6 md:px-9 md:py-7"
              >
                <span className="font-heading text-[0.7rem] font-black tabular-nums tracking-[0.12em] text-[var(--color-lime-ink)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] md:text-[1.375rem]">
                  {group.title}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-muted)]">
                  {group.items.length}
                </span>
                <Chevron open={open} />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-[400ms] ease-out motion-reduce:transition-none ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                {/* columns вместо grid: пункты заполняют сначала левую колонку
                    сверху вниз, потом правую — так перечень читается как список,
                    а не как таблица. break-inside-avoid держит пункт целиком
                    в одной колонке. */}
                <ul className="px-6 pb-8 md:columns-2 md:gap-x-12 md:px-9 md:pb-10">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="relative mb-5 break-inside-avoid pl-7 text-base leading-relaxed text-[var(--color-text)] md:mb-6 md:text-[1.0625rem]"
                    >
                      {/* Лайм-квадратик 9×9 со свечением — тот же маркер, что
                          у плашек категорий на странице практики. */}
                      <i
                        aria-hidden
                        className="absolute left-0 top-[0.5em] block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                        style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
