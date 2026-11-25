import { MediaLogo } from '@/components/publications/PublicationParts'
import type { RatingEntry, RatingYear } from '@/constants/content/recognition'

/* Детали рейтингов, общие для страницы /recognition и блока на главной */

/* Высота логотипа подобрана под его пропорции, чтобы рядом они читались одним
   кеглем: однострочный «Коммерсантъ» низкий, двухстрочный «Деловой квартал»
   и квадратный «ПРАВО 300» — выше. */
const LOGO_HEIGHT: Record<string, number> = {
  Коммерсантъ: 23,
  'ПРАВО-300': 54,
  'Российская газета': 23,
  'Best Lawyers': 36,
  'Деловой квартал': 50,
}

/* Знак рейтинга. У «PROбанкротства» файла логотипа нет — набран шрифтом так
   же, как в прототипе заказчика: жирное PRO и светлое БАНКРОТСТВО. */
export function RatingMark({ name, scale = 1 }: { name: string; scale?: number }) {
  if (name === 'PROбанкротство') {
    return (
      <span
        role="img"
        aria-label={name}
        className="block whitespace-nowrap font-heading leading-none tracking-[-0.02em] text-[var(--color-text)]"
        style={{ fontSize: 23 * scale }}
      >
        <b className="font-black">PRO</b>
        <span className="font-light">БАНКРОТСТВО</span>
      </span>
    )
  }
  const height = Math.round((LOGO_HEIGHT[name] ?? 24) * scale)
  return (
    <span
      className="block shrink-0"
      /* У файла «Делового квартала» справа пустое поле в пятую часть ширины —
         убираем, иначе по центру плитки знак стоит со сдвигом */
      style={name === 'Деловой квартал' ? { marginRight: -0.4 * height } : undefined}
    >
      <MediaLogo publisher={name} color="var(--color-text)" height={height} />
    </span>
  )
}

/* Высшие позиции — лаймом: при беглом взгляде видно, где первая группа */
const isTopRank = (rank: string) =>
  /^1 /.test(rank) || ['Лидеры', 'Рекомендованная фирма', 'Юрист года'].includes(rank)

export function RankList({ entries }: { entries: RatingEntry[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <li key={entry.rank + entry.practice} className="flex items-start gap-3">
          {entry.rank && (
            <span
              className={`mt-[1px] shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-[0.7rem] font-semibold leading-[1.5] ${
                isTopRank(entry.rank)
                  ? 'bg-[var(--color-lime)] text-[var(--color-text)]'
                  : 'border border-[var(--color-line)] bg-[var(--color-surface-soft)] text-[var(--color-text)]'
              }`}
            >
              {entry.rank}
            </span>
          )}
          <span className="min-w-0 text-sm leading-[1.55] text-[var(--color-text)]">{entry.practice}</span>
        </li>
      ))}
    </ul>
  )
}

export function YearLabel({ children }: { children: string }) {
  return (
    <p className="font-heading text-2xl font-black tabular-nums tracking-[-0.02em] text-[var(--color-lime-ink)]">
      {children}
    </p>
  )
}

/* Годы рейтинга фирмы колонками. Год с двумя подгруппами (Коммерсантъ 2026:
   отраслевые и правовые практики) занимает две колонки — иначе тринадцать
   строк вытягивались бы в одну длинную. */
export function YearColumns({ years }: { years: RatingYear[] }) {
  const columns = years.reduce((sum, y) => sum + y.groups.length, 0)
  const grid = columns >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
  return (
    <div className={`grid gap-x-8 gap-y-9 ${grid}`}>
      {years.map((year) => (
        <div
          key={year.year}
          className={`border-t border-[var(--color-line)] pt-5 ${year.groups.length > 1 ? 'md:col-span-2' : ''}`}
        >
          <YearLabel>{year.year}</YearLabel>
          <div className={`mt-4 grid gap-x-8 gap-y-6 ${year.groups.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {year.groups.map((group, i) => (
              <div key={group.title ?? i}>
                {group.title && (
                  <p className="mb-3 text-sm font-semibold text-[var(--color-muted)]">{group.title}</p>
                )}
                <RankList entries={group.entries} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* Личные регалии: год слева, строки справа. Если годов в рейтинге нет вовсе,
   колонка года не нужна; keepGutter оставляет её ради общей вертикали. */
export function PersonalYears({ years, keepGutter = false }: { years: RatingYear[]; keepGutter?: boolean }) {
  const gutter = keepGutter || years.some((y) => y.year)
  return (
    <div className="flex flex-col gap-5">
      {years.map((year, i) => (
        <div key={i} className={`grid gap-x-6 gap-y-2 ${gutter ? 'sm:grid-cols-[92px_1fr]' : ''}`}>
          {year.year ? (
            <p className="font-heading text-base font-black tabular-nums leading-[1.35] text-[var(--color-lime-ink)]">
              {year.year}
            </p>
          ) : (
            gutter && <span aria-hidden className="hidden sm:block" />
          )}
          <RankList entries={year.groups.flatMap((g) => g.entries)} />
        </div>
      ))}
    </div>
  )
}
