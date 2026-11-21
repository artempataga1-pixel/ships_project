import Image from 'next/image'
import Link from 'next/link'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { MediaLogo } from '@/components/publications/PublicationParts'
import {
  COVER_LOGO_COLOR,
  COVER_LOGO_POSITION,
  COVER_LOGO_WIDTH,
} from '@/components/publications/PublicationCards'

/* Блок «Публикации» на главной — только переход в библиотеку. Сама стопка
   карточек с анимацией, каталог и фильтры живут на /publications: на главной
   восемь экранов пина ради публикаций растягивали страницу и прятали кейсы
   с контактами далеко внизу.

   id="articles" сохранён — на него ведут пункт меню «Публикации» и возврат
   «← На главную» со страницы публикаций. Веер — фирменные обложки первых
   избранных материалов; при наведении расходится, приглашая внутрь. */

const FAN = [
  'left-0 top-8 z-0 -rotate-[9deg] group-hover:-translate-x-5 group-hover:-rotate-[13deg]',
  'left-[56px] top-0 z-10 rotate-0 group-hover:-translate-y-3',
  'left-[112px] top-8 z-0 rotate-[9deg] group-hover:translate-x-5 group-hover:rotate-[13deg]',
]

export function PublicationsTeaser({ covers }: { covers: { src: string; publisher: string }[] }) {
  return (
    <section
      id="articles"
      className="relative scroll-mt-16 overflow-hidden bg-[var(--color-bg)] px-6 py-24 md:px-8 md:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <span
          className="absolute left-[-6%] top-[30%] h-[70%] w-[112%] rotate-[-6deg] rounded-[50%] border"
          style={{ borderColor: 'rgba(168,204,51,.34)' }}
        />
        {['left-[4%] top-[22%]', 'right-[5%] bottom-[18%]'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-20">
        <RevealOnScroll y={30} duration={0.8}>
          <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
            Экспертная библиотека
            <i
              aria-hidden
              className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
            />
          </span>

          <h2 className="mt-8 font-heading text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Публикации
          </h2>
          <p className="mt-5 text-lg text-[var(--color-muted)] md:text-xl">
            Экспертная аналитика партнёров фирмы
          </p>

          <Link
            href="/publications"
            className="btn-lime-fill btn-lime-breathe mt-10 inline-flex h-14 items-center justify-center rounded-md px-10 text-base font-semibold md:h-16 md:px-12 md:text-lg"
          >
            Все публикации и комментарии →
          </Link>
        </RevealOnScroll>

        {covers.length > 0 && (
          <RevealOnScroll delay={0.15} y={40} duration={0.9} className="justify-self-center">
            <Link
              href="/publications"
              aria-label="Перейти к публикациям"
              className="group relative block h-[300px] w-[272px] sm:h-[340px] sm:w-[312px]"
            >
              {covers.slice(0, 3).map(({ src, publisher }, i) => (
                <span
                  key={src}
                  className={`absolute block aspect-[4/5] w-[160px] overflow-hidden rounded-[6px] border border-[var(--color-line)] bg-[var(--color-surface-soft)] transition-transform duration-500 ease-out motion-reduce:transition-none sm:w-[200px] ${FAN[i]}`}
                  style={{ boxShadow: 'var(--shadow-card)' }}
                >
                  <Image src={src} alt="" fill sizes="200px" className="object-cover" />
                  <MediaLogo
                    publisher={publisher}
                    color={COVER_LOGO_COLOR}
                    width={COVER_LOGO_WIDTH}
                    className={COVER_LOGO_POSITION}
                  />
                </span>
              ))}
            </Link>
          </RevealOnScroll>
        )}
      </div>
    </section>
  )
}
