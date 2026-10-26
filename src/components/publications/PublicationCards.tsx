import Image from 'next/image'
import type { Publication } from '@/types/content'
import { AuthorLinks, FieldLabel, PublisherLine, ReadLink, TagList } from './PublicationParts'

/* Карточки основных публикаций: избранная (с фирменной обложкой) и обычная
   (каталог, без фото). Структура обеих — по разделу 6 ТЗ: издание и год →
   заголовок → автор → «О чём материал» → «Для кого» → теги → «Читать».

   Порядок полей повторяет приоритет интерфейса из раздела 15 ТЗ (тема →
   проблема → эксперт → смысл → переход): заголовок крупно, издание мелко.
   Ничего важного не спрятано под hover — на мобиле наведения нет. */

const CARD_BASE =
  'relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]'

/* Тело карточки — общее для избранной и обычной; отличаются только кегль
   заголовка и то, что стоит над телом (обложка или лайм-полоса). */
function CardBody({ item, featured }: { item: Publication; featured?: boolean }) {
  return (
    <div
      className={`flex flex-1 flex-col ${
        featured ? 'gap-6 p-6 sm:p-7 md:max-w-[72ch] md:p-9 lg:p-10' : 'gap-5 p-6 sm:p-7 md:p-8'
      }`}
    >
      <div className="flex flex-col gap-4">
        <PublisherLine>
          {item.publisher} · {item.year}
        </PublisherLine>
        {/* Заголовок не обрезается ни на одной ширине (раздел 12 ТЗ): никаких
            line-clamp, только перенос. break-words — страховка для длинных
            слов в узкой колонке 375px. */}
        <h3
          className={`font-heading font-extrabold leading-[1.16] tracking-[-0.02em] break-words text-[var(--color-text)] ${
            featured ? 'text-[clamp(1.3rem,2.1vw,1.65rem)]' : 'text-[1.2rem] md:text-[1.3rem]'
          }`}
        >
          {item.title}
        </h3>
        <AuthorLinks authors={item.authors} role={item.authorRole} />
      </div>

      <span aria-hidden className="block h-[2px] w-12 rounded-full bg-[var(--color-lime)]" />

      <div className="flex flex-col gap-2">
        <FieldLabel>О чём материал</FieldLabel>
        <p className="text-[0.95rem] leading-[1.65] text-[var(--color-text)]">{item.preview}</p>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel>Для кого</FieldLabel>
        <p className="text-[0.95rem] leading-[1.6] text-[var(--color-muted)]">{item.audience}</p>
      </div>

      {/* mt-auto прижимает теги и кнопку к низу: в ряду карточки одной высоты
          (grid тянет их по самой высокой), и кнопки встают на одну линию.
          Разделитель — отдельный блок с отступами, а не border у тегов: в
          макете заказчика линия ложилась поверх перенесённого тега. */}
      <div className="mt-auto flex flex-col gap-5 pt-2">
        <TagList tags={item.tags} />
        <div className="border-t border-[var(--color-line)] pt-5">
          <ReadLink href={item.url} label="Читать публикацию" title={item.title} />
        </div>
      </div>
    </div>
  )
}

/* Избранная публикация: на мобиле фирменная обложка 4:5 сверху, под ней
   текст; с md — горизонтально, обложка слева, текст справа, по одной
   карточке в ряд. Вертикальная раскладка в две колонки на десктопе давала
   карточку ~1550px: обложка занимала весь экран, текст уезжал за него.

   Обложка — PNG 1080×1350 с впечатанным текстом, поэтому рамка строго 4:5:
   object-cover при совпадающих пропорциях ничего не срезает, а впечатанные
   заголовок и подпись остаются целыми на любой ширине. alt пустой — всё, что
   написано на обложке, продублировано текстом карточки ниже. */
export function FeaturedPublicationCard({ item, eager }: { item: Publication; eager?: boolean }) {
  return (
    <article className={`${CARD_BASE} md:flex-row`}>
      {item.cover && (
        /* Обложка ниже текста карточки — колонка тянется на всю высоту, а
           сама обложка залипает (sticky) и едет вместе с текстом: без этого
           под ней оставалась пустота в 250–350px. */
        <div className="relative w-full shrink-0 border-b border-[var(--color-line)] md:w-[280px] md:self-stretch md:border-b-0 md:border-r lg:w-[340px]">
          <div className="relative aspect-[4/5] w-full bg-[var(--color-surface-soft)] md:sticky md:top-24">
          <Image
            src={item.cover}
            alt=""
            fill
            /* На мобиле во всю ширину, с md — фиксированная колонка 280/340px */
            sizes="(max-width: 767px) 92vw, 340px"
            loading={eager ? 'eager' : 'lazy'}
            className="object-cover"
          />
          </div>
        </div>
      )}
      <CardBody item={item} featured />
    </article>
  )
}

/* Обычная публикация каталога: без фото, лайм-полоса с glow слева — тот же
   акцент, что у панелей страницы практики. Полоса не во всю высоту (как у
   панелей), чтобы не читаться рамкой. */
export function PublicationCard({ item }: { item: Publication }) {
  return (
    <article className={CARD_BASE}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-8 h-16 w-[3px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 22px var(--color-lime-glow)' }}
      />
      <CardBody item={item} />
    </article>
  )
}
