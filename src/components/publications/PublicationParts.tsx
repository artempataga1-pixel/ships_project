import Link from 'next/link'
import type { PublicationAuthorId } from '@/types/content'
import { PUBLICATION_AUTHORS } from '@/constants/content/publication-meta'
import { MEDIA_MENTIONS } from '@/constants/content/contacts'

/* Общие детали карточек страницы /publications.

   Без хуков и без 'use client': те же кирпичики собирают и клиентский
   каталог с фильтрами, и серверный блок PROбанкротство. */

/* Атрибуты внешней ссылки — по ТЗ все переходы на сайты СМИ открываются в
   новой вкладке, чтобы посетитель не терял сайт фирмы. */
export const EXTERNAL_LINK = { target: '_blank', rel: 'noopener noreferrer' } as const

/* Логотип издания — из того же набора, что бегущая строка «Контактов»
   (MEDIA_MENTIONS). Рисуется маской одним цветом: исходные файлы светло-
   голубые под тёмный фон и на светлых карточках/обложках не читались бы.
   Размер — либо высота в px (строка издания), либо ширина в CSS (оверлей
   на обложке, где всё в процентах от кадра). Нет файла — ничего. */
export function MediaLogo({
  publisher,
  color,
  height,
  width,
  className,
}: {
  publisher: string
  color: string
  height?: number
  width?: string
  className?: string
}) {
  const media = MEDIA_MENTIONS.find((m) => m.name === publisher && m.logo)
  if (!media?.logo || !media.logoWidth || !media.logoHeight) return null
  const ratio = media.logoWidth / media.logoHeight
  const mask = `url(${media.logo}) left center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label={publisher}
      className={`block shrink-0 ${className ?? ''}`}
      style={{
        ...(width ? { width } : { height, width: height ? height * ratio : undefined }),
        aspectRatio: `${media.logoWidth} / ${media.logoHeight}`,
        background: color,
        WebkitMask: mask,
        mask,
      }}
    />
  )
}

/* Строка «ИЗДАНИЕ · ГОД». По ТЗ (раздел 6) издание должно хорошо считываться
   и содержать фирменный логотип при его наличии, но не спорить с заголовком:
   логотип одним приглушённым цветом и небольшой. Широкий однострочный
   («Коммерсантъ») — 13px, компактный двухстрочный («Деловой квартал») — 30px:
   ниже его строки не читаются. Лайм-квадратик — маркер бейджей сайта. */
export function PublisherLine({ publisher, year }: { publisher: string; year: string }) {
  const media = MEDIA_MENTIONS.find((m) => m.name === publisher && m.logo)
  const ratio = media?.logoWidth && media.logoHeight ? media.logoWidth / media.logoHeight : 0
  const logoHeight = ratio >= 4 ? 13 : 30
  return (
    <p className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
      <i
        aria-hidden
        className="block h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 10px var(--color-lime-glow)' }}
      />
      {ratio ? (
        <>
          <MediaLogo publisher={publisher} color="var(--color-muted)" height={logoHeight} />
          <span className="min-w-0">· {year}</span>
        </>
      ) : (
        <span className="min-w-0">
          {publisher} · {year}
        </span>
      )}
    </p>
  )
}

/* Сквозной номер материала из контентной таблицы заказчика — обязательное
   поле обоих шаблонов карточек («10», «18» в правом верхнем углу). Крупно,
   но бледно: это навигационная метка, а не акцент. */
export function PubNumber({ num }: { num: number }) {
  return (
    <span
      aria-label={`Публикация № ${num}`}
      className="shrink-0 font-heading text-[1.6rem] font-black leading-none tabular-nums tracking-[-0.03em] text-[var(--color-muted)]/45"
    >
      {String(num).padStart(2, '0')}
    </span>
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
