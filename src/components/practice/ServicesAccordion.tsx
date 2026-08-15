'use client'

import { useId, useState } from 'react'
import type { PracticeServiceGroup } from '@/types/content'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SpotlightBorder } from '@/components/ui/SpotlightBorder'
import { Typewriter } from '@/components/ui/Typewriter'

/* Блок «Что мы делаем» на странице практики.

   Перечень услуг в отдельных практиках доходит до 23 пунктов — прямое
   требование заказчика: не выводить их одной сплошной колонкой. Решение —
   смысловые группы в аккордеоне.

   Раскладка по референсу «Course Curriculum»: центрированная шапка с
   пилюлей-бейджем, все группы внутри ОДНОЙ карточки (а не в отдельных панелях,
   как было раньше), строки разделены тонкими линиями, у каждой справа круглая
   кнопка-шеврон. По контуру карточки за курсором ходит лайм-свечение
   (SpotlightBorder) — в референсе оно белое, но на светлой теме белое по
   белому не видно, поэтому взят фирменный лайм.

   Раскрыта ровно одна группа — так же, как в референсе; раньше можно было
   раскрыть несколько сразу. Первая открыта на старте: страница сразу читается,
   но не превращается в простыню.

   Пункты идут одной колонкой (раньше на desktop было две): разделители-линии
   между строками — часть узнаваемости референса, а в две колонки они
   превращаются в кашу из-за разной высоты соседних строк.

   Анимация высоты — через grid-template-rows 0fr→1fr: не требует измерения
   контента в JS и не ломается при переносах строк на узких экранах.
   Свёрнутая группа получает inert — её пункты выпадают из фокуса и из дерева
   доступности, хотя физически остаются в DOM ради анимации. */

function Chevron() {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 14 14" fill="none" className="shrink-0">
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

function Check() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path
        d="M2.5 6.3l2.4 2.4L9.5 3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ServiceGroupRow({
  group,
  index,
  open,
  onToggle,
  baseId,
}: {
  group: PracticeServiceGroup
  index: number
  open: boolean
  onToggle: () => void
  baseId: string
}) {
  const panelId = `${baseId}-panel-${index}`
  const buttonId = `${baseId}-button-${index}`

  return (
    <div>
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-lime-ink)]"
        >
          {/* Надстрочная метка «Направление NN» и счётчик пунктов справа сняты
              по правке заказчика: нумерация дублировала порядок строк, а число
              услуг в группе читалось как техническая подробность. */}
          <span className="min-w-0">
            <span className="block font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] sm:text-xl">
              {group.title}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-4">
            {/* Круглая кнопка-шеврон 36px, поворот 180° за 300ms */}
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-out motion-reduce:transition-none ${
                open ? 'rotate-180' : ''
              }`}
              style={{
                borderColor: open ? 'var(--color-lime)' : 'var(--color-line)',
                background: open ? 'var(--color-lime-soft)' : 'transparent',
                color: open ? 'var(--color-lime-ink)' : 'var(--color-muted)',
              }}
            >
              <Chevron />
            </span>
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        {/* Раскрытие: строки не просто появляются вместе с высотой панели, а
            печатаются одна за другой (Typewriter, шаг между строками 0.06с).
            Печать держится в полусекунде — список из двух десятков пунктов не
            должен заставлять ждать. Чек-буллет подъезжает CSS-переходом с той
            же лесенкой задержек: он не текст, и SplitText его не касается. */}
        <div className="overflow-hidden">
          <ul className="pb-6">
            {group.items.map((item, itemIndex) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-[var(--color-line)] py-4 text-base leading-relaxed text-[var(--color-text)]"
              >
                <span
                  className={`mt-[0.2em] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[var(--color-lime-ink)] transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                    open ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                  }`}
                  style={{
                    borderColor: 'var(--color-lime)',
                    background: 'var(--color-lime-soft)',
                    transitionDelay: `${itemIndex * 60}ms`,
                  }}
                >
                  <Check />
                </span>
                <Typewriter
                  as="span"
                  active={open}
                  delay={0.08 + itemIndex * 0.06}
                  speed={0.008}
                  maxDuration={0.45}
                  className="min-w-0"
                >
                  {item}
                </Typewriter>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function ServicesAccordion({ groups }: { groups: PracticeServiceGroup[] }) {
  // Первая группа раскрыта по умолчанию; повторный клик по открытой — закрывает.
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  return (
    <div className="mx-auto max-w-[1080px]">
      {/* ── Шапка блока ────────────────────────────────────────────────────
          Заголовок живёт внутри компонента, а не приходит снаружи через
          SectionTitle: в этой раскладке он центрирован и идёт в паре с
          пилюлей-бейджем — разнесённые по разным файлам, они бы разъезжались
          при любой правке отступов. */}
      <div className="mb-12 flex flex-col items-center text-center">
        <RevealOnScroll>
          {/* Кегль пилюли поднят ещё раз по правке заказчика после пилота:
              0.75rem → 1.125rem → 1.375rem. На фоне живого видео и декора
              героя лёгкий (font-medium) текст в 18px терялся; вес поднят до
              semibold, паддинги и точка выросли в той же пропорции. */}
          <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-[1.35rem] py-2 text-[1.375rem] font-semibold leading-none text-[var(--color-text)]">
            <span
              className="h-2.5 w-2.5 rounded-full bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 10px var(--color-lime-glow)' }}
            />
            Услуги
          </span>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <h2 className="font-heading text-[clamp(1.6rem,3.2vw,2.5rem)] font-black leading-[1.08] tracking-[-0.02em] text-[var(--color-text)]">
            Что мы делаем
          </h2>
        </RevealOnScroll>
      </div>

      {/* Внешний радиус xl, внутренний lg — разница ровно в толщину рамки-паддинга,
          иначе скругления смотрятся вложенными неточно. */}
      <SpotlightBorder radius="xl" size={520} intensity={0.5} className="w-full p-2 sm:p-3">
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-6 sm:px-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {groups.map((group, index) => (
            <RevealOnScroll
              key={group.title}
              delay={0.15 * index}
              className="border-b border-[var(--color-line)] last:border-b-0"
            >
              <ServiceGroupRow
                group={group}
                index={index}
                baseId={baseId}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </RevealOnScroll>
          ))}
        </div>
      </SpotlightBorder>
    </div>
  )
}
