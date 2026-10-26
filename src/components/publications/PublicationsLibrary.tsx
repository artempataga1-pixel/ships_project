'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Publication, PublicationAuthorId, PublicationTopic, PublicationTopicId } from '@/types/content'
import { PUBLICATION_AUTHORS } from '@/constants/content/publication-meta'
import { ScrollTrigger } from '@/lib/gsap'
import { FeaturedPublicationCard, PublicationCard } from './PublicationCards'
import { SectionHead } from './SectionHead'

/* Фильтры + «Избранные публикации» + «Все публикации».

   Фильтр действует на оба блока сразу (раздел 9 ТЗ): материал виден, если
   совпали И автор, И тема. Блок, в котором после фильтра ничего не осталось,
   скрывается целиком — пустой заголовок без карточек выглядит поломкой.
   Если пусто везде — сообщение и кнопка сброса.

   Блок PROбанкротство живёт отдельно (серверный, ниже по странице) и
   фильтрами не затрагивается — это самостоятельный раздел из ТЗ. */

type AuthorFilter = 'all' | PublicationAuthorId
type TopicFilter = 'all' | PublicationTopicId

/* «1 материал / 3 материала / 5 материалов» */
function pluralMaterials(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} материал`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} материала`
  return `${n} материалов`
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
      /* shrink-0 + whitespace-nowrap: на мобиле ряд чипов скроллится вбок,
         и чип не должен сжиматься и рвать подпись на две строки. */
      className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
        active
          ? 'border-[var(--color-lime)] bg-[var(--color-lime)] text-[var(--color-text)] shadow-[0_0_18px_var(--color-lime-glow)]'
          : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-lime)]'
      }`}
    >
      {children}
    </button>
  )
}

/* Строка чипов одной группы. На мобиле — горизонтальный скролл без видимого
   скроллбара, вынесенный к краям экрана (-mx-6 px-6): так видно, что ряд
   продолжается за краем. С md чипы переносятся на новые строки. */
function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] md:w-20 md:shrink-0 md:pt-3.5">
        {label}
      </p>
      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {children}
      </div>
    </div>
  )
}

export function PublicationsLibrary({
  featured,
  catalog,
  topics,
}: {
  featured: Publication[]
  catalog: Publication[]
  topics: PublicationTopic[]
}) {
  const [author, setAuthor] = useState<AuthorFilter>('all')
  const [topic, setTopic] = useState<TopicFilter>('all')

  const matches = useCallback(
    (item: Publication) =>
      (author === 'all' || item.authors.includes(author)) &&
      (topic === 'all' || item.topics.includes(topic)),
    [author, topic],
  )

  const visibleFeatured = useMemo(() => featured.filter(matches), [featured, matches])
  const visibleCatalog = useMemo(() => catalog.filter(matches), [catalog, matches])
  const total = visibleFeatured.length + visibleCatalog.length
  const isFiltered = author !== 'all' || topic !== 'all'

  /* После фильтра высота страницы меняется скачком, а ScrollTrigger помнит
     старые координаты: триггеры появления ниже (блок PROбанкротство, CTA)
     срабатывали бы не там, а при сильном сокращении страницы — вообще никогда,
     и карточки остались бы прозрачными. Пересчитываем после раскладки. */
  useEffect(() => {
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => window.cancelAnimationFrame(id)
  }, [author, topic])

  const reset = () => {
    setAuthor('all')
    setTopic('all')
  }

  const authorIds = Object.keys(PUBLICATION_AUTHORS) as PublicationAuthorId[]

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      {/* ── Фильтры ── */}
      <section
        aria-label="Фильтры публикаций"
        className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] md:p-8"
      >
        <div className="flex flex-col gap-5">
          <ChipRow label="Автор">
            <Chip active={author === 'all'} onClick={() => setAuthor('all')}>
              Все
            </Chip>
            {authorIds.map((id) => (
              <Chip key={id} active={author === id} onClick={() => setAuthor(id)}>
                {PUBLICATION_AUTHORS[id].name}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="Тема">
            <Chip active={topic === 'all'} onClick={() => setTopic('all')}>
              Все темы
            </Chip>
            {topics.map((t) => (
              <Chip key={t.id} active={topic === t.id} onClick={() => setTopic(t.id)}>
                {t.label}
              </Chip>
            ))}
          </ChipRow>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-5">
          {/* aria-live — скринридер озвучит результат фильтра без перехода фокуса */}
          <p aria-live="polite" className="text-sm text-[var(--color-muted)]">
            {isFiltered
              ? `Найдено: ${pluralMaterials(total)}`
              : `Публикаций: ${pluralMaterials(total)} · комментарии PROбанкротство — отдельным блоком ниже`}
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-text)] underline decoration-[var(--color-lime)] decoration-2 underline-offset-[5px] hover:text-[var(--color-lime-ink)]"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </section>

      {/* ── I. Избранные публикации ── */}
      {visibleFeatured.length > 0 && (
        <section aria-labelledby="pub-featured" className="flex flex-col gap-10 md:gap-14">
          <SectionHead
            id="pub-featured"
            eyebrow="Избранное"
            title="Избранные публикации"
            lead="Материалы, которые точнее всего показывают, с какими вопросами работают партнёры фирмы."
          />
          {/* Избранные — по одной в ряд: карточка горизонтальная (обложка слева) */}
          <div className="grid grid-cols-1 gap-6 md:gap-7">
            {visibleFeatured.map((item, index) => (
              <FeaturedPublicationCard key={item.num} item={item} eager={index < 2} />
            ))}
          </div>
        </section>
      )}

      {/* ── II. Каталог ── */}
      {visibleCatalog.length > 0 && (
        <section aria-labelledby="pub-catalog" className="flex flex-col gap-10 md:gap-14">
          <SectionHead id="pub-catalog" eyebrow="Каталог" title="Все публикации" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleCatalog.map((item) => (
              <PublicationCard key={item.num} item={item} />
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-line)] bg-[var(--color-surface-soft)] p-8 md:p-10">
          <p className="font-heading text-xl font-extrabold tracking-[-0.01em] text-[var(--color-text)]">
            По выбранным фильтрам материалов пока нет
          </p>
          <p className="max-w-[52ch] text-base leading-relaxed text-[var(--color-muted)]">
            Попробуйте выбрать другую тему или другого автора — или посмотрите все публикации сразу.
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
