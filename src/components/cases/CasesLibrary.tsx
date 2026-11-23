'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CaseStudy } from '@/types/content'
import { ScrollTrigger } from '@/lib/gsap'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CaseCard } from '@/components/practice/RelatedCasesShowcase'

/* Каталог /cases: все дела карточками (та же двусторонняя карточка, что в
   «Связанных кейсах» практики) и фильтр по практикам. Выбранная практика
   пишется в адрес (?practice=slug) — ссылку можно переслать, а блок «Кейсы»
   на главной ведёт сразу на нужную практику. */

export interface PracticeFilter {
  id: string
  slug: string
  label: string
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
        active
          ? 'border-[var(--color-lime)] bg-[var(--color-lime)] text-[var(--color-text)] shadow-[0_0_18px_var(--color-lime-glow)]'
          : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-lime)]'
      }`}
    >
      {children}
    </button>
  )
}

export function CasesLibrary({ cases, practices }: { cases: CaseStudy[]; practices: PracticeFilter[] }) {
  const [active, setActive] = useState<string>('all')

  // Практика из адреса — после гидрации, чтобы серверная разметка совпадала
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('practice')
    const match = practices.find((p) => p.slug === slug)
    if (match) setActive(match.id)
  }, [practices])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of practices) map.set(p.id, cases.filter((c) => c.practiceIds?.includes(p.id)).length)
    return map
  }, [cases, practices])

  const visible = useMemo(
    () => (active === 'all' ? cases : cases.filter((c) => c.practiceIds?.includes(active))),
    [active, cases],
  )

  // Сетка поменяла высоту — пересчитать триггеры появления карточек
  useEffect(() => {
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => window.cancelAnimationFrame(id)
  }, [active])

  const choose = (id: string) => {
    setActive(id)
    const url = new URL(window.location.href)
    const practice = practices.find((p) => p.id === id)
    if (practice) url.searchParams.set('practice', practice.slug)
    else url.searchParams.delete('practice')
    url.hash = ''
    window.history.replaceState(window.history.state, '', url)
  }

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {/* На мобиле ряд листается вбок, выведен к краям экрана */}
      <div
        role="group"
        aria-label="Практика"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        <Chip active={active === 'all'} onClick={() => choose('all')}>
          Все дела <span className="tabular-nums text-[var(--color-muted)]">{cases.length}</span>
        </Chip>
        {practices.map((p) => (
          <Chip key={p.id} active={active === p.id} onClick={() => choose(p.id)}>
            {p.label} <span className="tabular-nums text-[var(--color-muted)]">{counts.get(p.id)}</span>
          </Chip>
        ))}
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <RevealOnScroll key={item.slug} delay={0.05} y={20} duration={0.6} className="h-full">
            {/* Индекс по полному списку — у карточки свой кадр и графика,
                не меняющиеся при переключении фильтра */}
            <CaseCard item={item} index={cases.indexOf(item)} />
          </RevealOnScroll>
        ))}
      </div>
    </div>
  )
}
