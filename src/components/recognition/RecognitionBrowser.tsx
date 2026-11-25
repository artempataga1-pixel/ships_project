'use client'

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import Link from 'next/link'
import { useLenis } from 'lenis/react'
import { ScrollTrigger } from '@/lib/gsap'
import {
  FIRM_RATINGS,
  PARTNER_RATING_SOURCES,
  RATING_OVERVIEW,
  type RatedPartnerId,
} from '@/constants/content/recognition'
import { PersonalYears, RatingMark, YearColumns } from '@/components/recognition/RatingParts'

/* Страница «Признание» от общего к частному (прототип заказчика): шесть
   карточек рейтингов → вкладки «Компания / партнёры» → строки рейтингов,
   которые раскрываются в годы и практики.

   Всё содержимое есть в серверной разметке — вкладки и строки только прячут
   его. Адреса: /recognition#kommersant раскрывает строку рейтинга,
   /recognition#anna-shumskaya открывает вкладку партнёра. Раскрытые строки
   друг друга не закрывают: иначе строка под курсором уезжала бы вверх. */

export interface RecognitionPartner {
  id: RatedPartnerId
  name: string
  role: string
}

type TabId = 'company' | RatedPartnerId

const HEADING =
  'font-heading text-[clamp(1.8rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]'
const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--color-lime-ink)]'

export function RecognitionBrowser({ partners }: { partners: RecognitionPartner[] }) {
  const lenis = useLenis()
  const [tab, setTab] = useState<TabId>('company')
  const [open, setOpen] = useState<string[]>([RATING_OVERVIEW[0].id])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const tabs: { id: TabId; label: string }[] = [
    { id: 'company', label: 'Компания' },
    ...partners.map((p) => ({ id: p.id as TabId, label: p.name })),
  ]

  const applyHash = useCallback(
    (hash: string) => {
      const id = hash.replace(/^#/, '')
      if (RATING_OVERVIEW.some((r) => r.id === id)) {
        setTab('company')
        setOpen((list) => (list.includes(id) ? list : [...list, id]))
      } else if (partners.some((p) => p.id === id)) {
        setTab(id as TabId)
      }
    },
    [partners],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- адрес известен только в браузере
    applyHash(window.location.hash)
    const onHash = () => applyHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [applyHash])

  // Высота страницы поменялась — пересчитать триггеры блоков ниже
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 420)
    return () => window.clearTimeout(t)
  }, [tab, open])

  /* Отступ под шапку Lenis берёт из scroll-mt строки.
     «Подробнее»: сначала раскрываем строку (она могла быть в скрытой вкладке),
     потом едем к ней. Событие дальше не пускаем — Lenis сам ловит клики по
     якорям и поехал бы к ещё не раскрытой строке. */
  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    flushSync(() => applyHash(id))
    window.history.replaceState(window.history.state, '', `#${id}`)
    const row = document.getElementById(id)
    if (!row) return
    if (lenis) lenis.scrollTo(row)
    else row.scrollIntoView({ block: 'start' })
    row.querySelector('button')?.focus({ preventScroll: true })
  }

  const toggle = (id: string) =>
    setOpen((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const onTabKey = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + tabs.length) % tabs.length
    setTab(tabs[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      {/* ── Общее: кто нас отмечает ── */}
      <section aria-labelledby="recognition-overview">
        <h2 id="recognition-overview" className={HEADING}>
          Нас отмечают
        </h2>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
          Профессионализм, экспертиза и высокие стандарты работы нашей команды получают признание ведущих российских и
          международных рейтингов.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {RATING_OVERVIEW.map((rating) => (
            <li key={rating.id}>
              <a
                href={`#${rating.id}`}
                onClick={(e) => goTo(e, rating.id)}
                className={`group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-lime)] hover:shadow-[0_0_26px_var(--color-lime-glow)] motion-reduce:transition-none md:p-8 ${FOCUS}`}
              >
                <h3 className="flex h-14 items-center">
                  <RatingMark name={rating.name} />
                </h3>
                <span className="mt-6 block text-[0.95rem] leading-[1.6] text-[var(--color-muted)]">{rating.card}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-[var(--color-text)]">
                  Подробнее
                  <span
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Частное: компания и партнёры ── */}
      <div
        role="tablist"
        aria-label="Чьё признание показать"
        className="-mx-6 mt-20 flex gap-1 overflow-x-auto border-b border-[var(--color-line)] px-6 [scrollbar-width:none] sm:mx-0 sm:px-0 md:mt-28 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t, i) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              id={t.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${t.id}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`relative min-h-12 shrink-0 scroll-mt-28 whitespace-nowrap px-4 text-base font-semibold transition-colors duration-200 md:px-5 md:text-lg ${FOCUS} ${
                active ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {t.label}
              <span
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-[3px] bg-[var(--color-lime)] transition-opacity duration-200 ${
                  active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          )
        })}
      </div>

      <section role="tabpanel" id="company-panel" aria-labelledby="company" hidden={tab !== 'company'} className="pt-12 md:pt-14">
        <h2 className={HEADING}>Признание компании</h2>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
          Рейтинги ежегодно отмечают высокое качество нашей работы, глубину экспертизы и устойчивые результаты в ключевых
          направлениях.
        </p>

        <div
          className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {RATING_OVERVIEW.map((rating) => {
            const isOpen = open.includes(rating.id)
            const firm = FIRM_RATINGS.find((s) => s.name === rating.name)
            const personal = partners.flatMap((p) => {
              const source = PARTNER_RATING_SOURCES[p.id].find((s) => s.name === rating.name)
              return source ? [{ partner: p, source }] : []
            })
            return (
              <div
                key={rating.id}
                id={rating.id}
                className="scroll-mt-24 border-b border-[var(--color-line)] last:border-b-0"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${rating.id}-details`}
                    onClick={() => toggle(rating.id)}
                    className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 px-6 py-6 text-left transition-colors duration-200 hover:bg-[var(--color-surface-soft)] md:grid-cols-[230px_1fr_auto] md:px-8 ${FOCUS}`}
                  >
                    <span className="flex min-h-10 items-center">
                      <RatingMark name={rating.name} scale={0.84} />
                    </span>
                    <span className="order-last col-span-2 text-[0.95rem] font-normal leading-[1.55] text-[var(--color-muted)] md:order-none md:col-span-1">
                      {rating.line}
                    </span>
                    <span
                      aria-hidden
                      className={`relative block h-8 w-8 shrink-0 rounded-full border transition-colors duration-300 ${
                        isOpen ? 'border-[var(--color-lime)] bg-[var(--color-lime)]' : 'border-[var(--color-line)]'
                      }`}
                    >
                      <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-text)]" />
                      <span
                        className={`absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[var(--color-text)] transition-transform duration-300 motion-reduce:transition-none ${
                          isOpen ? 'scale-y-0' : 'scale-y-100'
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`${rating.id}-details`}
                  inert={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-[380ms] ease-out motion-reduce:transition-none ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-6 pb-9 pt-2 md:px-8">
                      {firm ? (
                        <YearColumns years={firm.years} />
                      ) : (
                        <div className="grid gap-x-12 gap-y-9 md:grid-cols-2">
                          {personal.map(({ partner, source }) => (
                            <div key={partner.id} className="border-t border-[var(--color-line)] pt-5">
                              <p className="mb-4 font-heading text-lg font-black tracking-[-0.01em] text-[var(--color-text)]">
                                {partner.name}
                              </p>
                              <PersonalYears years={source.years} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {partners.map((partner) => (
        <section
          key={partner.id}
          role="tabpanel"
          id={`${partner.id}-panel`}
          aria-labelledby={partner.id}
          hidden={tab !== partner.id}
          className="pt-12 md:pt-14"
        >
          <h2 className={HEADING}>{partner.name}</h2>
          <p className="mt-4 text-base text-[var(--color-muted)] md:text-lg">
            {partner.role}.{' '}
            <Link
              href={`/partners/${partner.id}`}
              className="font-semibold text-[var(--color-text)] underline decoration-[var(--color-lime)] decoration-2 underline-offset-4 hover:text-[var(--color-lime-ink)]"
            >
              Страница партнёра
            </Link>
          </p>
          <div
            className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {PARTNER_RATING_SOURCES[partner.id].map((source) => (
              <div
                key={source.name}
                className="grid gap-x-6 gap-y-5 border-b border-[var(--color-line)] px-6 py-7 last:border-b-0 md:grid-cols-[230px_1fr] md:px-8"
              >
                <h3 className="flex min-h-10 items-start">
                  <RatingMark name={source.name} scale={0.84} />
                </h3>
                <PersonalYears years={source.years} keepGutter />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
