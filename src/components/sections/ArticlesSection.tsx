'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { MEDIA } from '@/constants/content/media'
import type { MediaItem } from '@/types/content'

/* Референс — dizain7/8.jpg + 04_article_card_01/05_article_card_02 (одна и та же
   карточка с разным контентом). Секция пинится: первая карточка въезжает снизу
   вверх и занимает экран. Дальше все следующие карточки уже лежат статично друг
   под другом (стопкой), и при скролле верхняя улетает вверх с лёгким поворотом,
   открывая под собой следующую — та никуда не едет, просто открывается.
   На мобильных пин отключён — карточки идут обычным вертикальным списком.
   Механика пина/скраба/прогресса сохранена с тёмной версии — меняется только
   палитра/структура карточки под лайм-редизайн (единый лайм-акцент, без
   чередования цвета). */

// Каждая следующая карточка в стопке чуть смещена вниз-вправо — веером,
// чтобы её край выглядывал из-под текущей, а не пряталась ровно под ней
const PEEK_STEPS = [
  '',
  'xl:translate-x-3 xl:translate-y-3',
  'xl:translate-x-6 xl:translate-y-6',
  'xl:translate-x-9 xl:translate-y-9',
]

function ArticleCard({ item }: { item: MediaItem }) {
  return (
    <article
      className="
        relative flex flex-col justify-center
        min-h-0 xl:h-full w-full
        rounded-2xl md:rounded-[28px]
        border border-[var(--color-line)]
        bg-[var(--color-surface)]
        overflow-hidden
      "
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Лайм-полоса слева с glow — единый акцент карточки редизайна (::before в референсе) */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-7 bottom-7 w-[4px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 42px var(--color-lime)' }}
      />

      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-14 md:py-0 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Левая колонка — копия статьи */}
        <div>
          <div className="mb-8">
            <span className="font-heading text-xs font-black tracking-[0.22em] uppercase text-[var(--color-text)]">
              {item.publisher}
            </span>
          </div>

          <h3 className="font-heading text-[clamp(1.75rem,3.4vw,3.1rem)] font-black leading-[0.98] tracking-[-0.05em] text-[var(--color-text)]">
            {item.title}
          </h3>

          <div className="mt-9 flex items-center gap-6 text-[var(--color-text)]">
            <span className="text-sm md:text-base">{item.date}</span>
            <span aria-hidden className="h-[22px] w-px bg-[var(--color-line)]" />
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Читать статью «${item.title}»`}
              className="flex items-center gap-1.5 text-sm md:text-base font-extrabold text-[var(--color-lime-ink)] hover:underline underline-offset-4"
            >
              Читать{' '}
              <span aria-hidden className="text-xl">
                →
              </span>
            </a>
          </div>
        </div>

        {/* Правая колонка — готовое фото-превью статьи. Пропорция рамки = 3/2
            (как у фото), object-contain вписывает кадр целиком, не обрезая;
            для 16:9-кадра остаются лишь узкие поля в цвет подложки. */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-[6px] border border-[var(--color-line)] bg-[var(--color-surface-soft)]">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 80vw, 40vw"
            className="object-contain"
          />
          <span className="absolute left-5 bottom-5 flex items-center gap-2.5 h-[34px] px-3.5 rounded-[7px] bg-[var(--color-surface)] text-[11px] font-black tracking-[0.13em] uppercase text-[var(--color-text)] shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
            {item.publisher}
            <i aria-hidden className="h-2 w-2 rounded-[2px] bg-[var(--color-lime)]" />
          </span>
        </div>
      </div>
    </article>
  )
}

export function ArticlesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const pinWrap = pinRef.current
      const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null)
      if (!pinWrap || cards.length < 2) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1280px)', () => {
        // Первая карточка стартует за нижним краем экрана. Пока она едет наверх,
        // её бокс физически ниже экрана и не закрывает карточки под собой —
        // поэтому остальные прячем (autoAlpha 0) и открываем только когда она доедет
        gsap.set(cards[0], { yPercent: 100, rotate: 0 })
        gsap.set(cards.slice(1), { yPercent: 0, rotate: 0, autoAlpha: 0 })
        if (progressRef.current) gsap.set(progressRef.current, { scaleX: 0 })
        if (headingRef.current) gsap.set(headingRef.current, { autoAlpha: 1 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinWrap,
            start: 'top top',
            end: () => `+=${cards.length * window.innerHeight}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Въезд первой карточки снизу вверх, следом открываем лежащую под ней стопку
        tl.to(cards[0], { yPercent: 0, ease: 'none' }, 0)
        tl.set(cards.slice(1), { autoAlpha: 1 }, 1)

        // Заголовок секции виден только на старте (пока верх пуст). Как только
        // пошёл скролл и карточка поехала — он уходит и при прокрутке его нет.
        if (headingRef.current) {
          tl.to(headingRef.current, { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0)
        }

        // Каждая карточка, кроме последней, улетает вверх с лёгким поворотом,
        // открывая статично лежащую под ней следующую
        cards.slice(0, -1).forEach((card, i) => {
          tl.to(card, { yPercent: -120, rotate: i % 2 === 0 ? -6 : 6, ease: 'none' }, i + 1)
        })

        if (progressRef.current) {
          tl.to(progressRef.current, { scaleX: 1, ease: 'none', duration: cards.length }, 0)
        }

        return () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })

      // Мобильный/планшетный вариант: карточки идут обычным вертикальным
      // списком (без пина) — каждая появляется лёгким reveal при входе в вьюпорт
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 1279px)', () => {
        cards.forEach((card) => {
          gsap.from(card, {
            autoAlpha: 0,
            y: 40,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          })
        })
      })
    },
    { scope: sectionRef },
  )

  return (
    <section id="articles" ref={sectionRef} className="relative scroll-mt-16 bg-[var(--color-bg)]">
      <div
        ref={pinRef}
        className="relative mt-12 xl:mt-0 flex flex-col gap-6 xl:gap-0 xl:h-dvh xl:overflow-hidden"
      >
        {/* Фоновый декор экрана — светлый градиент + эллиптические орбиты и лайм-точки,
            видны в полях вокруг стопки (как в референс-коде .card-orbit/.dot) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 hidden xl:block"
          style={{
            background:
              'radial-gradient(circle at 72% 42%, var(--color-lime-soft), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
          }}
        >
          <span
            className="absolute left-[-6%] top-[34%] h-[62%] w-[112%] rounded-[50%] border rotate-[-8deg]"
            style={{ borderColor: 'rgba(201,255,31,.42)' }}
          />
          <span
            className="absolute left-[2%] top-[52%] h-[52%] w-[104%] rounded-[50%] border rotate-[-6deg]"
            style={{ borderColor: 'rgba(0,0,0,.08)' }}
          />
          {['left-[9%] top-[54%]', 'right-[6%] top-[26%]', 'left-[62%] bottom-[15%]'].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
              style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
            />
          ))}
        </div>

        {MEDIA.map((item, i) => (
          <div
            key={item.title}
            ref={(el) => {
              cardsRef.current[i] = el
            }}
            className={`relative xl:absolute xl:inset-x-[18%] xl:inset-y-[20%] ${PEEK_STEPS[Math.min(i, PEEK_STEPS.length - 1)]}`}
            style={{ zIndex: MEDIA.length - i }}
          >
            {/* На мобильных — заголовок секции вплотную над первой карточкой
                (без отступа). На десктопе скрыт: вместо него внутри пина
                работает вариант, оседающий в нижней полосе (см. ниже) */}
            {i === 0 && (
              <div className="xl:hidden max-w-[1440px] w-full mx-auto px-8">
                <SectionHeading title="Статьи" subtitle="Публикации и комментарии экспертов компании" />
              </div>
            )}
            <ArticleCard item={item} />
          </div>
        ))}

        {/* Заголовок секции — по центру верхней свободной зоны пина, пока снизу
            сменяются карточки. z-30 — всегда поверх стопки (карточки уезжают вверх
            за ним). Позиция фиксированная, при скролле не двигается. */}
        <div
          ref={headingRef}
          className="
            hidden xl:flex absolute inset-x-0 top-[8%] z-30
            flex-col items-center gap-3 text-center
          "
        >
          <h2 className="font-heading text-[clamp(2.5rem,4vw,4.25rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-[var(--color-text)]">
            Статьи
          </h2>
          <p className="text-base lg:text-lg text-[var(--color-muted)]">
            Что о нас говорят в медиа
          </p>
        </div>

        {/* Полоска прогресса пина — заполняется по мере смены карточек (только десктоп) */}
        <div className="hidden xl:block absolute bottom-0 inset-x-0 h-[3px] bg-[var(--color-line)] z-20">
          <div
            ref={progressRef}
            className="h-full w-full origin-left bg-gradient-to-r from-[var(--color-lime-ink)] to-[var(--color-lime)]"
          />
        </div>
      </div>
    </section>
  )
}
