'use client'

import { useEffect, useRef, useState } from 'react'

/* Разделы страницы кейса как маршрут дела: фабула → задача → что сделали →
   результат. Дело — это последовательность, поэтому на десктопе слева идёт
   линия с узлами этапов; по мере прокрутки она заливается лаймом, узлы
   загораются. Это единственное движение блока, и оно отвечает на скролл.

   Этапы оформлены по смыслу, а не одинаковыми карточками: завязка — белая
   панель с крупным первым абзацем, задача — лаймовая плашка одной фразой,
   действия — шаги с фирменным лайм-квадратиком, результат — чёрная панель
   с лайм-свечением (тот же приём, что оборот карточки кейса), статус дела в
   работе — пульсирующая точка. Тексты дословные; «Что мы сделали» только
   разложен по предложениям на шаги, слова не меняются. */

export type CaseStageKind = 'situation' | 'task' | 'actions' | 'result' | 'status'

export interface CaseStage {
  kind: CaseStageKind
  label: string
  paragraphs: string[]
  /* Итоговая сумма дела — крупно справа в панели результата */
  figure?: { label: string; value: string }
}

const SENTENCE_SPLIT = /(?<=[.!?…])\s+(?=[А-ЯЁA-Z«])/

const PANEL =
  'relative rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 md:p-10'

function StageLabel({ children, onDark = false }: { children: string; onDark?: boolean }) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-[0.22em] ${
        onDark ? 'text-[var(--color-lime)]' : 'text-[var(--color-lime-ink)]'
      }`}
    >
      {children}
    </h2>
  )
}

function LimeMarker() {
  return (
    <i
      aria-hidden
      className="mt-[0.62em] block h-[9px] w-[9px] shrink-0 rounded-[2px] bg-[var(--color-lime)]"
      style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
    />
  )
}

function StagePanel({ stage }: { stage: CaseStage }) {
  switch (stage.kind) {
    case 'situation':
      return (
        <div className={PANEL} style={{ boxShadow: 'var(--shadow-card)' }}>
          <StageLabel>{stage.label}</StageLabel>
          <div className="mt-5 flex max-w-[68ch] flex-col gap-4">
            {stage.paragraphs.map((text, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'font-heading text-lg font-semibold leading-[1.45] tracking-[-0.01em] text-[var(--color-text)] md:text-[1.3rem]'
                    : 'text-base leading-[1.7] text-[var(--color-text)]/85 md:text-lg'
                }
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      )

    case 'task':
      return (
        <div
          className="relative rounded-[var(--radius-lg)] border p-7 md:p-10"
          style={{ background: 'rgba(185,230,41,.12)', borderColor: 'rgba(93,115,21,.22)' }}
        >
          <StageLabel>{stage.label}</StageLabel>
          {stage.paragraphs.map((text, i) => (
            <p
              key={i}
              className="mt-4 max-w-[60ch] font-heading text-lg font-bold leading-[1.45] text-[var(--color-text)] md:text-xl"
            >
              {text}
            </p>
          ))}
        </div>
      )

    case 'actions': {
      const steps = stage.paragraphs.flatMap((p) => p.split(SENTENCE_SPLIT))
      return (
        <div className={PANEL} style={{ boxShadow: 'var(--shadow-card)' }}>
          <StageLabel>{stage.label}</StageLabel>
          <ul className="mt-4 max-w-[68ch]">
            {steps.map((text, i) => (
              <li
                key={i}
                className={`flex gap-4 py-4 ${i > 0 ? 'border-t border-[var(--color-line)]' : ''}`}
              >
                <LimeMarker />
                <p className="text-base leading-[1.7] text-[var(--color-text)] md:text-lg">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      )
    }

    case 'result':
      return (
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-lime)]/50 bg-[var(--color-black)] p-8 md:p-11"
          style={{ boxShadow: '0 30px 80px rgba(0,0,0,.18), 0 0 46px rgba(185,230,41,.16)' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(110% 90% at 88% 0%, rgba(185,230,41,.22), transparent 60%)' }}
          />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
            <div>
              <StageLabel onDark>{stage.label}</StageLabel>
              <div className="mt-5 flex max-w-[62ch] flex-col gap-4">
                {stage.paragraphs.map((text, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? 'font-heading text-lg font-semibold leading-[1.5] text-white md:text-[1.35rem]'
                        : 'text-base leading-[1.7] text-white/80 md:text-lg'
                    }
                  >
                    {text}
                  </p>
                ))}
              </div>
            </div>
            {stage.figure && (
              <div className="border-t border-white/15 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  {stage.figure.label}
                </span>
                <span
                  className="mt-2 block whitespace-nowrap font-heading text-[clamp(2.25rem,4vw,3.5rem)] font-black leading-none tracking-[-0.03em] text-[var(--color-lime)]"
                  style={{ textShadow: '0 0 28px rgba(185,230,41,.35)' }}
                >
                  {stage.figure.value}
                </span>
              </div>
            )}
          </div>
        </div>
      )

    case 'status':
      return (
        <div className={PANEL} style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StageLabel>{stage.label}</StageLabel>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]">
              <i
                aria-hidden
                className="block h-2 w-2 rounded-full bg-[var(--color-lime)] motion-safe:animate-pulse"
                style={{ boxShadow: '0 0 10px var(--color-lime-glow)' }}
              />
              Дело в работе
            </span>
          </div>
          {stage.paragraphs.map((text, i) => (
            <p
              key={i}
              className="mt-4 max-w-[62ch] font-heading text-lg font-semibold leading-[1.5] text-[var(--color-text)] md:text-xl"
            >
              {text}
            </p>
          ))}
        </div>
      )
  }
}

export function CaseRoute({ stages }: { stages: CaseStage[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  // Индекс последнего этапа, до которого дошла прокрутка (-1 — ни одного)
  const [reached, setReached] = useState(-1)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = Array.from(list.querySelectorAll<HTMLElement>('[data-route-node]'))
    let raf = 0

    const update = () => {
      raf = 0
      if (reduce) {
        if (fillRef.current) fillRef.current.style.height = '100%'
        setReached(nodes.length - 1)
        return
      }
      // Линия заливается до уровня чуть ниже середины экрана
      const anchor = window.innerHeight * 0.6
      const rect = list.getBoundingClientRect()
      const filled = Math.min(Math.max(anchor - rect.top, 0), rect.height)
      if (fillRef.current) fillRef.current.style.height = `${filled}px`
      let idx = -1
      nodes.forEach((node, i) => {
        if (node.getBoundingClientRect().top < anchor) idx = i
      })
      setReached(idx)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <ol ref={listRef} className="relative mt-14 flex flex-col gap-6 md:mt-16 md:gap-8 lg:pl-20">
      {/* Линия маршрута — только с lg: на узком экране она отъедала бы ширину
          у текста. Центр линии и узлов — 16px от левого края списка. */}
      <span
        aria-hidden
        className="absolute bottom-6 left-[15px] top-6 hidden w-[2px] rounded-full bg-[var(--color-line)] lg:block"
      >
        <span
          ref={fillRef}
          className="absolute left-0 top-0 block w-full rounded-full bg-[var(--color-lime)]"
          style={{ height: 0, boxShadow: '0 0 14px var(--color-lime-glow)' }}
        />
      </span>

      {stages.map((stage, i) => {
        const lit = i <= reached
        return (
          <li key={stage.kind} className="relative">
            <span
              aria-hidden
              data-route-node
              className={`absolute -left-20 top-9 hidden h-8 w-8 items-center justify-center rounded-full border bg-[var(--color-surface)] transition-colors duration-300 motion-reduce:transition-none lg:flex ${
                lit ? 'border-[var(--color-lime)]' : 'border-[var(--color-line)]'
              }`}
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                  lit ? 'bg-[var(--color-lime)]' : 'bg-[var(--color-line)]'
                }`}
                style={lit ? { boxShadow: '0 0 12px var(--color-lime-glow)' } : undefined}
              />
            </span>
            <StagePanel stage={stage} />
          </li>
        )
      })}
    </ol>
  )
}
