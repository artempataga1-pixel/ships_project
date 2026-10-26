import Link from 'next/link'
import type { PublicationAuthorId } from '@/types/content'
import { PUBLICATION_AUTHORS } from '@/constants/content/publication-meta'

/* Общие детали карточек страницы /publications.

   Без хуков и без 'use client': те же кирпичики собирают и клиентский
   каталог с фильтрами, и серверный блок PROбанкротство. */

/* Атрибуты внешней ссылки — по ТЗ все переходы на сайты СМИ открываются в
   новой вкладке, чтобы посетитель не терял сайт фирмы. */
export const EXTERNAL_LINK = { target: '_blank', rel: 'noopener noreferrer' } as const

/* Строка «ИЗДАНИЕ · ГОД». Мелко, капсом и приглушённо: по ТЗ издание должно
   считываться, но не спорить с заголовком материала. Лайм-квадратик — тот же
   маркер, что у бейджей практик, он держит строку в стилистике сайта. */
export function PublisherLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
      <i
        aria-hidden
        className="block h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 10px var(--color-lime-glow)' }}
      />
      <span className="min-w-0">{children}</span>
    </p>
  )
}

/* Подпись поля карточки («О чём материал», «Для кого»). */
export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-lime-ink)]">
      {children}
    </p>
  )
}

/* Автор(ы) материала. Каждое имя — отдельная ссылка на страницу партнёра:
   карточка целиком не кликабельна, поэтому ссылка в ссылке не возникает.
   Роль («интервью», «экспертный комментарий») идёт приглушённо после имён —
   так видно, что материал не авторская колонка. */
export function AuthorLinks({
  authors,
  role,
  className,
}: {
  authors: PublicationAuthorId[]
  role?: string
  className?: string
}) {
  return (
    <p className={`text-[0.95rem] leading-snug text-[var(--color-text)] ${className ?? ''}`}>
      {authors.map((id, index) => (
        <span key={id}>
          {index > 0 && ', '}
          <Link
            href={PUBLICATION_AUTHORS[id].href}
            className="font-semibold underline decoration-[var(--color-lime)] decoration-2 underline-offset-[5px] transition-colors hover:text-[var(--color-lime-ink)]"
          >
            {PUBLICATION_AUTHORS[id].name}
          </Link>
        </span>
      ))}
      {role && <span className="text-[var(--color-muted)]"> · {role}</span>}
    </p>
  )
}

/* Теги-пилюли. flex-wrap обязателен: по ТЗ на мобиле теги переносятся на
   несколько строк, а не уезжают за край. */
export function TagList({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Темы материала">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-3 py-1 text-xs leading-snug text-[var(--color-text)]"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}

/* Кнопка перехода на оригинал. Высота 44px — минимальная зона нажатия на
   мобиле; ширина по содержимому, чтобы кнопка не превращалась в полосу. */
export function ReadLink({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <a
      href={href}
      {...EXTERNAL_LINK}
      /* aria-label уточняет, КАКОЙ материал откроется: в списке из двадцати
         одинаковых «Читать публикацию» скринридер иначе не различит ссылки. */
      aria-label={`${label}: «${title}» (откроется в новой вкладке)`}
      className="btn-lime-fill inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md px-5 text-sm font-semibold"
    >
      {label}
      <span aria-hidden>→</span>
    </a>
  )
}
