import Link from 'next/link'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { getHomeCases, getPracticesSorted } from '@/lib/content'
import { byPractices, pluralCases } from '@/lib/ruNumbers'

/* Блок «Кейсы» на главной — переход в каталог /cases. Прежний поток из шести
   карточек поверх прилипающего заголовка занимал около десяти экранов; здесь
   — заголовок, вход по практикам и три дела для примера, остальное на /cases.

   id="cases" сохранён: на него ведут пункт меню «Кейсы», «← На главную» с
   /cases и редиректы со старых адресов. */

export function CasesTeaser() {
  const practices = getPracticesSorted()
  const preview = getHomeCases().slice(0, 3)
  const total = CASE_STUDIES.length

  return (
    <section
      id="cases"
      className="relative scroll-mt-16 overflow-hidden px-6 py-24 md:px-8 md:py-32"
      style={{
        background:
          'radial-gradient(circle at 78% 40%, rgba(168,204,51,.08), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <span
          className="absolute left-[-6%] top-[28%] h-[70%] w-[112%] rotate-[4deg] rounded-[50%] border"
          style={{ borderColor: 'rgba(168,204,51,.34)' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <RevealOnScroll y={30} duration={0.8}>
          <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
            Избранные дела компании
            <i
              aria-hidden
              className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
            />
          </span>

          <h2 className="mt-8 font-heading text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Кейсы
          </h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            Задачи клиентов и результаты нашей работы — {pluralCases(total)} {byPractices(practices.length)} фирмы.
          </p>

          {/* Вход сразу в нужную практику каталога */}
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Кейсы по практикам">
            {practices.map((p) => {
              const count = CASE_STUDIES.filter((c) => c.practiceIds?.includes(p.id)).length
              return (
                <li key={p.id}>
                  <Link
                    href={`/cases?practice=${p.slug}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-medium text-[var(--color-text)] transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-lime)] hover:shadow-[0_0_18px_var(--color-lime-glow)]"
                  >
                    {p.label}
                    <span className="tabular-nums text-[var(--color-muted)]">{count}</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          <Link
            href="/cases"
            className="btn-lime-fill btn-lime-breathe mt-10 inline-flex h-14 items-center justify-center rounded-md px-10 text-base font-semibold md:h-16 md:px-12 md:text-lg"
          >
            Все кейсы →
          </Link>
        </RevealOnScroll>

        {/* Три дела для примера — компактные тёмные плашки в стиле оборота
            карточки кейса: категория, суть, итоговая сумма */}
        <RevealOnScroll delay={0.15} y={40} duration={0.9}>
          <ul className="flex flex-col gap-4">
            {preview.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/cases/${item.slug}`}
                  className="group relative flex items-center gap-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-lime)]/40 bg-[var(--color-black)] p-6 transition-transform duration-500 ease-out hover:-translate-y-1 motion-reduce:transition-none md:p-7"
                  style={{ boxShadow: '0 24px 60px rgba(0,0,0,.14)' }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'radial-gradient(110% 90% at 90% 0%, rgba(185,230,41,.18), transparent 60%)' }}
                  />
                  <span className="relative min-w-0 flex-1">
                    <span className="block text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--color-lime)]">
                      {item.category}
                    </span>
                    <span className="mt-2 block font-heading text-base font-extrabold leading-snug text-white md:text-lg">
                      {item.shortTitle ?? item.title}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/60 transition-colors group-hover:text-[var(--color-lime)]">
                      Смотреть кейс <span aria-hidden>→</span>
                    </span>
                  </span>
                  {item.amount && (
                    <span
                      className="relative shrink-0 whitespace-nowrap font-heading text-[clamp(1.4rem,2.4vw,2rem)] font-black tracking-[-0.03em] text-[var(--color-lime)]"
                      style={{ textShadow: '0 0 24px rgba(185,230,41,.3)' }}
                    >
                      {item.amount}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  )
}
