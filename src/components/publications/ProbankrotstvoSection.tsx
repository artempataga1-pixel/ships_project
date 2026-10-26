import type { Publication } from '@/types/content'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { AuthorLinks, EXTERNAL_LINK, FieldLabel, ReadLink, TagList } from './PublicationParts'
import { SectionHead } from './SectionHead'

/* Блок «Экспертные комментарии Анны Шумской на PROбанкротство» (разделы 10–11
   ТЗ). Самостоятельный раздел: фильтры страницы его не трогают, поэтому он
   серверный и живёт вне PublicationsLibrary.

   Карточки компактнее основных — структура по макету заказчика: шапка
   источника, рубрика, заголовок, автор + дата, «Ключевой смысл», «Для кого»,
   теги, «Читать комментарий». Цвета макета (тёмно-зелёный, беж) не берём —
   палитра сайта лаймовая. Баг макета, где строка «Для кого» наезжала на
   кнопку, здесь исключён: кнопка в общем потоке, прижата mt-auto. */

function ProbankrotstvoCard({ item }: { item: Publication }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {/* Шапка источника — мягкая лайм-плашка: сразу видно, что это не
          авторская колонка, а комментарий на профильном ресурсе. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[var(--color-line)] bg-[var(--color-lime-soft)] px-6 py-3.5">
        <span className="font-heading text-[0.8rem] font-black uppercase tracking-[0.08em] text-[var(--color-text)]">
          PROбанкротство
        </span>
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-lime-ink)]">
          экспертный комментарий
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        {item.rubric && (
          <span className="self-start rounded-md border border-[var(--color-line)] bg-[var(--color-surface-soft)] px-2.5 py-1 text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.12em] text-[var(--color-text)]">
            {item.rubric}
          </span>
        )}
        <h3 className="font-heading text-[1.08rem] font-extrabold leading-[1.2] tracking-[-0.015em] break-words text-[var(--color-text)]">
          {item.title}
        </h3>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <AuthorLinks authors={item.authors} className="text-sm" />
          {item.date && (
            <time
              /* ДД.ММ.ГГГГ → ГГГГ-ММ-ДД для машиночитаемого dateTime */
              dateTime={item.date.split('.').reverse().join('-')}
              className="text-xs font-medium tabular-nums text-[var(--color-muted)]"
            >
              {item.date}
            </time>
          )}
        </div>

        <span aria-hidden className="block h-[2px] w-10 rounded-full bg-[var(--color-lime)]" />

        <div className="flex flex-col gap-1.5">
          <FieldLabel>Ключевой смысл</FieldLabel>
          <p className="text-sm leading-[1.6] text-[var(--color-text)]">{item.preview}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Для кого</FieldLabel>
          <p className="text-sm leading-[1.55] text-[var(--color-muted)]">{item.audience}</p>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-1">
          <TagList tags={item.tags} />
          <div className="border-t border-[var(--color-line)] pt-4">
            <ReadLink href={item.url} label="Читать комментарий" title={item.title} />
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProbankrotstvoSection({
  items,
  profileUrl,
}: {
  items: Publication[]
  profileUrl: string
}) {
  if (items.length === 0) return null

  return (
    <section aria-labelledby="pub-probankrotstvo" className="flex flex-col gap-10 md:gap-14">
      <SectionHead
        id="pub-probankrotstvo"
        eyebrow="Профильное издание"
        title="Экспертные комментарии Анны Шумской на PROбанкротство"
        lead="Короткие комментарии к свежей судебной практике по банкротству: субсидиарная ответственность, оспаривание сделок, защита активов, долги супругов."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          /* Каскад по колонкам, а не по всему списку: восьмая карточка с
             задержкой 1.2с ощущалась бы зависанием. */
          <RevealOnScroll
            key={item.num}
            delay={(index % 4) * 0.1}
            y={24}
            duration={0.7}
            blur={0}
            ease="expo.out"
            className="h-full"
          >
            <ProbankrotstvoCard item={item} />
          </RevealOnScroll>
        ))}
      </div>

      {/* Ссылка на профиль — крупная панель, а не строка текста: по ТЗ она
          должна быть заметной, и по ней должно быть видно, что это переход на
          внешний ресурс (↗ + домен). */}
      <a
        href={profileUrl}
        {...EXTERNAL_LINK}
        className="group flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-lime)] bg-[var(--color-surface)] p-6 shadow-[0_0_30px_var(--color-lime-soft)] transition-[box-shadow,background-color] duration-300 hover:bg-[var(--color-lime-soft)] hover:shadow-[0_0_34px_var(--color-lime-glow)] motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between md:p-8"
      >
        <span className="flex flex-col gap-1.5">
          <span className="font-heading text-[clamp(1.05rem,2vw,1.35rem)] font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)]">
            Все комментарии Анны Шумской на PROбанкротство&nbsp;<span aria-hidden>→</span>
          </span>
          <span className="text-sm text-[var(--color-muted)]">
            probankrotstvo.ru · внешний ресурс, откроется в новой вкладке
          </span>
        </span>
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)] text-xl font-bold text-[var(--color-text)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
        >
          ↗
        </span>
      </a>
    </section>
  )
}
