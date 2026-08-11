'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import type { CaseStudy } from '@/types/content'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
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
      className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-lime-ink)]"
    >
      {/* Медиа-область: заблюренный кадр, поверх него — заголовок кейса.
          Раньше здесь лежала только фирменная графика, а заголовок стоял под
          карточкой; по правке заказчика заголовок переехал НА кадр, чтобы
          картинка перестала быть самостоятельным акцентом и стала подложкой.

          Наведение — свой сюжет, не тот, что у продуктов: кадр наводится на
          резкость и подъезжает, по карточке один раз проходит косой блик,
          заголовок приподнимается. Пиксельной волны здесь нет намеренно. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border border-[var(--color-line)] transition-colors duration-300 group-hover:border-[var(--color-lime)] motion-reduce:transition-none">
        <CardArtwork variant={index} />

        <Image
          src={CASE_IMAGES[index % CASE_IMAGES.length]}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 34vw"
          className="scale-[1.08] object-cover opacity-95 blur-[4px] transition-[filter,transform,opacity] duration-700 ease-out group-hover:scale-[1.14] group-hover:blur-[1px] motion-reduce:transition-none"
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

        {/* Косой блик — проходит по карточке один раз за наведение */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 -translate-x-[220%] transition-transform duration-[900ms] ease-out group-hover:translate-x-[560%] motion-reduce:transition-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.75) 45%, rgba(226,243,168,.6) 60%, rgba(255,255,255,0) 100%)',
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

        <h3 className="absolute inset-x-5 bottom-5 z-10 font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none md:text-xl">
          {item.title}
        </h3>
      </div>

      {/* Под карточкой — описание. Кегль поднят с 13px до 16px: в прежнем
          размере текст читался подписью к картинке, хотя именно он объясняет,
          что за дело было. */}
      <p className="mt-5 px-1 text-base leading-[1.6] text-[var(--color-text)] md:text-[1.0625rem] md:leading-[1.65]">
        {item.summary}
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
  const headingRef = useRef<HTMLHeadingElement>(null)
  const words = 'Связанные кейсы'.split(' ')

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.set('[data-word]', { opacity: 0, y: 28 })
      gsap.to('[data-word]', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: 0.1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%', once: true },
      })
    },
    { scope: headingRef },
  )

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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:gap-12">
          <h2
            ref={headingRef}
            className="flex max-w-[320px] shrink-0 flex-wrap gap-x-[0.25em] font-heading text-[clamp(26px,3vw,42px)] font-black uppercase leading-[1.05] tracking-[-0.01em] text-[var(--color-text)] md:w-[32%]"
          >
            {words.map((word) => (
              <span key={word} data-word className="inline-block">
                {word}
              </span>
            ))}
          </h2>

          <div className="flex-1 pt-2">
            <RevealOnScroll delay={0.25}>
              <p className="max-w-[46ch] text-sm leading-[1.65] text-[var(--color-muted)]">
                Разбор реальных дел практики: что было на входе, какую позицию мы заняли и чем
                закончилось.
              </p>
            </RevealOnScroll>
          </div>
        </div>

        {cases.length > 0 ? (
          <div className={`grid items-stretch gap-5 ${gridColumnsClass(cases.length)}`}>
            {cases.map((item, index) => (
              <RevealOnScroll key={item.slug} delay={0.4 + index * 0.15} className="h-full">
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
