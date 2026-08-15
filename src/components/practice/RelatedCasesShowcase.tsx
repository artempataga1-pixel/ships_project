'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CaseStudy } from '@/types/content'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Typewriter } from '@/components/ui/Typewriter'
import { CardArtwork } from './CardArtwork'
import { ComingSoonPanel } from './ComingSoonPanel'

/* Блок «Связанные кейсы» на странице практики.

   Раскладка по референсу services-секции: счётчик-метка, заголовок и лид в
   один ряд (заголовок узкой колонкой слева, пояснение справа), под ними сетка
   карточек с медиа-областью 4/3. Заголовок выезжает пословно.

   Три отступления от референса, все — ради содержания:
   — фон вместо сплошного серого #C5C5C5 взят фирменный --color-surface-soft:
     блок так же отделяется от страницы, но не выпадает из светлой гаммы сайта;
   — вместо height: 100vh — авто-высота: у практики может быть и два кейса, и
     восемь, и в оба края жёсткий экран ломается (то дыра, то обрезка);
   — число колонок считается от числа кейсов, а не прибито к трём: у пилотной
     практики их два, и растянутая на треть экрана пара смотрелась бы сиротливо.

   Медиа-область — фирменная графика (CardArtwork), а не фотография: подбирать
   банкротному спору стоковый кадр значит обесценить сам кейс. */

/* Ширина сетки под фактическое число кейсов. Больше трёх в ряд не ставим —
   карточка становится уже своей подписи. */
function gridColumnsClass(count: number): string {
  if (count === 1) return 'md:grid-cols-1 md:max-w-[520px]'
  if (count === 2) return 'md:grid-cols-2'
  return 'md:grid-cols-2 lg:grid-cols-3'
}

/* Кадры-концепты под карточки кейсов (свои, сгенерированные). Смещены по
   кругу относительно набора блока «Продукты», чтобы соседние блоки страницы
   не показывали один и тот же кадр. Позже заменяются на кадры кейсов. */
const CASE_IMAGES = [
  '/images/articles/stat2.jpg',
  '/images/articles/stat3.jpg',
  '/images/articles/stat1.jpg',
  '/images/articles/stat4.jpg',
]

function CaseCard({ item, index }: { item: CaseStudy; index: number }) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      className="case-flip group flex h-full flex-col rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-lime-ink)]"
    >
      {/* Медиа-область: двусторонняя карточка. Лицо — заблюренный кадр с
          заголовком поверх (заголовок переехал НА кадр по правке заказчика,
          чтобы картинка стала подложкой, а не самостоятельным акцентом).

          Наведение — переворот через ребро на чёрный оборот: там категория,
          год, название дела и кнопка перехода. Прежний сюжет (наводка на
          резкость + косой блик) снят: под переворотом его всё равно не видно,
          а лишние transition на том же элементе дёргали карточку.

          z-10 на сцене — потому что довёрнутая на 6° карточка выходит за свою
          ячейку примерно на 15px книзу и без него ныряла бы под описание. */}
      <div className="case-flip-scene relative z-10 aspect-[16/10] w-full">
        <div className="case-flip-inner">
          {/* ЛИЦО */}
          <div className="case-flip-face border border-[var(--color-line)]">
            <CardArtwork variant={index} />

            <Image
              src={CASE_IMAGES[index % CASE_IMAGES.length]}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 34vw"
              className="scale-[1.08] object-cover opacity-95 blur-[4px]"
            />

            {/* Светлая вуаль — плотнее книзу: заголовок тёмный, и без неё он
                тонул бы в светлых участках кадра. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.5) 54%, rgba(255,255,255,.9) 100%)',
              }}
            />

            <span className="absolute left-5 top-4 z-10 inline-flex items-center gap-2.5 rounded-md bg-[var(--color-surface)] px-3 py-1.5 font-heading text-[0.62rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
              {item.category}
              <i
                aria-hidden
                className="block h-[8px] w-[8px] rounded-[2px] bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
              />
            </span>

            <h3 className="absolute inset-x-5 bottom-5 z-10 font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] md:text-xl">
              {/* as="span" — обёртка стоит внутри заголовка, а не вокруг него:
                  h3 позиционирован абсолютно по кадру, и лишний блочный
                  контейнер снаружи сбил бы привязку к нижнему краю. */}
              <Typewriter as="span" delay={0.35} speed={0.012} maxDuration={0.8}>
                {item.title}
              </Typewriter>
            </h3>
          </div>

          {/* ОБОРОТ. aria-hidden — всё, что здесь написано, уже есть на лице и
              в тексте под карточкой; без него скринридер зачитывал бы ссылку
              дважды. Ничего уникального сюда не кладём намеренно: на тач-
              экранах оборота нет, и содержательный текст там был бы потерян. */}
          <div
            aria-hidden
            className="case-flip-face case-flip-face-back flex flex-col justify-between border border-[var(--color-lime)] bg-[var(--color-black)] p-6"
          >
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(122% 92% at 84% 6%, rgba(185,230,41,.22), transparent 62%)',
              }}
            />

            <div className="relative flex items-center justify-between gap-4">
              <span className="font-heading text-[0.62rem] font-black uppercase tracking-[0.12em] text-[var(--color-lime)]">
                {item.category}
              </span>
              <span className="text-xs font-medium tabular-nums text-white/55">{item.year}</span>
            </div>

            <p className="relative max-w-[22ch] font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-white md:text-xl">
              {item.title}
            </p>

            <span className="case-flip-cta relative inline-flex items-center gap-3 font-heading text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--color-lime)]">
              Смотреть кейс
              <i
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-lime)] text-sm not-italic text-[var(--color-black)]"
                style={{ boxShadow: '0 0 18px var(--color-lime-glow)' }}
              >
                →
              </i>
            </span>
          </div>
        </div>
      </div>

      {/* Под карточкой — описание. Кегль поднят с 13px до 16px: в прежнем
          размере текст читался подписью к картинке, хотя именно он объясняет,
          что за дело было. */}
      <p className="mt-5 px-1 text-base leading-[1.6] text-[var(--color-text)] md:text-[1.0625rem] md:leading-[1.65]">
        <Typewriter as="span" delay={0.5} speed={0.012} maxDuration={1.1}>
          {item.summary}
        </Typewriter>
      </p>

      {/* Сумма и год. Сумма спора — самый сильный аргумент на карточке, поэтому
          она идёт крупно и лаймом, а не служебной строкой; год рядом приглушён
          и моноширинными цифрами, чтобы у соседних карточек он вставал в одну
          вертикаль. Отделены тонкой линией — иначе цифры прилипали к последней
          строке описания и читались его продолжением. */}
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--color-line)] px-1 pt-4">
        <span className="font-heading text-xl font-black tracking-[-0.02em] text-[var(--color-lime-ink)] md:text-[1.4rem]">
          {item.amount}
        </span>
        <span className="text-sm font-medium tabular-nums text-[var(--color-muted)]">
          {item.year}
        </span>
      </div>
    </Link>
  )
}

export function RelatedCasesShowcase({ cases }: { cases: CaseStudy[] }) {
  return (
    /* Линии сверху и снизу — не декор: --color-surface-soft отличается от
       --color-bg на пару процентов яркости, и без границ блок не читался как
       отдельный, просто «страница слегка посерела». В референсе ту же работу
       делал сплошной серый #C5C5C5, который в нашу гамму не ложится. */
    <section className="relative border-y border-[var(--color-line)] bg-[var(--color-surface-soft)] px-[18px] py-[60px] md:px-8 md:py-[80px]">
      <div className="mx-auto max-w-[1120px]">
        {/* Счётчик-метка «06 / 08» снята по правке заказчика: нумерация
            разделов из референса на нашей странице ничего не навигировала —
            переходов по номерам нет, и подпись читалась случайной. */}
        {/* Заголовок и лид печатаются посимвольно — так же, как заголовок и
            подзаголовок в референсе services-секции (Typewriter, шаг 0.012с,
            подпись с задержкой 0.1с относительно заголовка). Прежний пословный
            выезд снят: пословный стаггер теперь работает в герое, а здесь
            печать связывает блок с остальным текстом страницы. */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:gap-12">
          <Typewriter speed={0.012} maxDuration={0.9} className="shrink-0 md:w-[32%]">
            <h2 className="max-w-[320px] font-heading text-[clamp(26px,3vw,42px)] font-black uppercase leading-[1.05] tracking-[-0.01em] text-[var(--color-text)]">
              Связанные кейсы
            </h2>
          </Typewriter>

          <div className="flex-1 pt-2">
            <Typewriter delay={0.1} speed={0.012} maxDuration={1.2}>
              <p className="max-w-[46ch] text-sm leading-[1.65] text-[var(--color-muted)]">
                Разбор реальных дел практики: что было на входе, какую позицию мы заняли и чем
                закончилось.
              </p>
            </Typewriter>
          </div>
        </div>

        {cases.length > 0 ? (
          /* Карточки выходят снизу как колонки в референсе: y 20, 0.6с,
             easeOut, общая задержка 0.1с — без каскада между карточками, он в
             референсе тоже одинаковый; разнообразие даёт печать текста внутри. */
          <div className={`grid items-stretch gap-5 ${gridColumnsClass(cases.length)}`}>
            {cases.map((item, index) => (
              <RevealOnScroll
                key={item.slug}
                delay={0.1}
                y={20}
                duration={0.6}
                className="h-full"
              >
                <CaseCard item={item} index={index} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <ComingSoonPanel title="Кейсы по этой практике" />
        )}
      </div>
    </section>
  )
}
