import Link from 'next/link'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { RatingMark } from '@/components/recognition/RatingParts'
import { RATING_OVERVIEW } from '@/constants/content/recognition'

/* Блок «Признание» на главной — переход на /recognition, как у публикаций и
   кейсов: шесть рейтингов знаками, годы и практики — на отдельной странице.
   id="recognition" — якорь пункта меню и возврата «← На главную». */
export function RecognitionTeaser() {
  return (
    <section
      id="recognition"
      className="relative scroll-mt-16 overflow-hidden bg-[var(--color-bg)] px-6 py-24 md:px-8 md:py-32"
    >
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <RevealOnScroll y={30} duration={0.8}>
          <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
            Рейтинги фирмы и партнёров
            <i
              aria-hidden
              className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
            />
          </span>
          <h2 className="mt-8 font-heading text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Признание
          </h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            Работа компании и её партнёров на протяжении многих лет отмечается ведущими российскими и международными
            юридическими рейтингами.
          </p>
          <Link
            href="/recognition"
            className="btn-lime-fill btn-lime-breathe mt-10 inline-flex h-14 items-center justify-center rounded-md px-10 text-base font-semibold md:h-16 md:px-12 md:text-lg"
          >
            Все рейтинги →
          </Link>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15} y={40} duration={0.9}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {RATING_OVERVIEW.map((rating) => (
              <li key={rating.id}>
                <Link
                  href={`/recognition#${rating.id}`}
                  scroll={false}
                  aria-label={`${rating.name}: рейтинги по годам`}
                  className="flex h-24 items-center justify-center sm:h-28 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-lime)] hover:shadow-[0_0_26px_var(--color-lime-glow)] motion-reduce:transition-none"
                >
                  <RatingMark name={rating.name} scale={0.94} />
                </Link>
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  )
}
