import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { MediaLogo } from '@/components/publications/PublicationParts'
import { FIRM_RATINGS, type RatingSource } from '@/constants/content/recognition'

/* «Признание» — рейтинги фирмы по годам (файл регалий заказчика). Три
   источника — три колонки; внутри годы по убыванию. Ранг вынесен в плашку:
   высшие позиции (1 Band, «Лидеры», «Рекомендованная фирма») — лаймом, чтобы
   при беглом взгляде было видно, где фирма в первой группе. */

const isTopRank = (rank: string) => /^1 /.test(rank) || rank === 'Лидеры' || rank === 'Рекомендованная фирма'

function SourceMark({ name }: { name: string }) {
  if (name === 'Коммерсантъ') {
    return <MediaLogo publisher={name} color="var(--color-text)" height={22} />
  }
  if (name === 'ПРАВО-300') {
    /* Название уже набрано в самом логотипе («ПРАВО 300») */
    return <MediaLogo publisher={name} color="var(--color-text)" height={44} />
  }
  return (
    <span className="font-heading text-xl font-black tracking-[-0.01em] text-[var(--color-text)]">{name}</span>
  )
}

function SourceCard({ source }: { source: RatingSource }) {
  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 md:p-8"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-8 h-12 w-[3px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 22px var(--color-lime-glow)' }}
      />
      <h3 className="flex min-h-10 items-center">
        <SourceMark name={source.name} />
      </h3>

      <div className="mt-6 flex flex-col gap-7">
        {source.years.map((year) => (
          <section key={year.year} aria-label={`${source.name}, ${year.year}`}>
            <p className="font-heading text-2xl font-black tabular-nums tracking-[-0.02em] text-[var(--color-lime-ink)]">
              {year.year}
            </p>
            {year.groups.map((group, gi) => (
              <div key={gi} className="mt-3">
                {group.title && (
                  <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {group.title}
                  </p>
                )}
                <ul className="flex flex-col gap-2.5">
                  {group.entries.map((entry) => (
                    <li key={entry.rank + entry.practice} className="flex items-start gap-3">
                      <span
                        className={`mt-[1px] shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-[0.7rem] font-semibold leading-[1.5] ${
                          isTopRank(entry.rank)
                            ? 'bg-[var(--color-lime)] text-[var(--color-text)]'
                            : 'border border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-text)]'
                        }`}
                      >
                        {entry.rank}
                      </span>
                      <span className="text-sm leading-[1.55] text-[var(--color-text)]">{entry.practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export function RecognitionSection() {
  return (
    <section id="recognition" className="relative scroll-mt-16 bg-[var(--color-bg)] px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        <RevealOnScroll y={30} duration={0.8}>
          <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
            Рейтинги фирмы
            <i
              aria-hidden
              className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
            />
          </span>
          <h2 className="mt-8 font-heading text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Признание
          </h2>
        </RevealOnScroll>

        <div className="mt-14 grid items-start gap-6 md:mt-16 lg:grid-cols-3">
          {FIRM_RATINGS.map((source, i) => (
            <RevealOnScroll key={source.name} delay={i * 0.08} y={30} duration={0.8}>
              <SourceCard source={source} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
