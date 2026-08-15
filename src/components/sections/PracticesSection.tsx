'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { PRACTICE_QUOTES, PRACTICES_SLOGAN } from '@/constants/content/practice'
import { PRACTICE_ITEMS } from '@/constants/content/practices'
import type { Practice } from '@/types/content'

/* Референс — dizain5.jpg + 03_practices_intro (заголовочный экран). Сначала
   светлый экран-заголовок с ghost-panel, орбитами и лайм-glow; затем секция
   прилипает и вертикальный скролл превращается в горизонтальный проезд коллажа:
   карточки разных размеров на разной высоте, подписи-ярлыки над ними, между
   карточками — цитаты. Когда коллаж доехал до конца, пин отпускает и
   вертикальный скролл плавно продолжается к следующему блоку.
   Механика скролла/пина/параллакса сохранена с тёмной версии — меняется
   только палитра/шрифт под лайм-редизайн. */

interface CardVariant {
  /* вертикальная посадка в коллаже: верх / центр / низ со сдвигами */
  align: string
  width: string
}

/* Пропорция рамки берётся из данных (Practice.imageRatio) и ставится инлайном
   через aspect-ratio: класс aspect-[…] Tailwind собрать из переменной не может,
   а форма рамки обязана повторять форму снимка — иначе object-cover режет кадр.
   Здесь остаются только посадка и ширина. Ширины подобраны так, чтобы самая
   высокая карточка (9/16 и 2/3) на 1280×720 умещалась в 88dvh пина. */
const CARD_VARIANTS: CardVariant[] = [
  { align: 'lg:self-start lg:mt-[10dvh]', width: 'w-full lg:w-[32vw] lg:min-w-[380px]' }, // 01 Банкротство · 3/2
  { align: 'lg:self-end lg:mb-[12dvh]', width: 'w-full lg:w-[22vw] lg:min-w-[300px]' },   // 02 Корпоративное · 10/13
  { align: 'lg:self-start lg:mt-[8dvh]', width: 'w-full lg:w-[30vw] lg:min-w-[360px]' },  // 03 Строительство · 4/3
  { align: 'lg:self-center', width: 'w-full lg:w-[23vw] lg:min-w-[290px]' },              // 04 Судебные споры · 2/3
  { align: 'lg:self-center', width: 'w-full lg:w-[19vw] lg:min-w-[250px]' },              // 05 Семейное · 9/16
]

/* Контурный логотип-скобка (декор фона заголовочного экрана, ~16% opacity) —
   угловые border-рамки + три бара, как .logo-outline в референс-коде. */
function LogoOutline({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute hidden h-[230px] w-[230px] opacity-[0.16] lg:block ${className ?? ''}`}
    >
      <span
        className="absolute bottom-0 left-0 h-[136px] w-[86px] border-b border-l"
        style={{ borderColor: '#bfdc54' }}
      />
      <span
        className="absolute right-0 top-0 h-[136px] w-[86px] border-r border-t"
        style={{ borderColor: '#bfdc54' }}
      />
      {[76, 124, 170].map((left) => (
        <span
          key={left}
          className="absolute bottom-[66px] h-[118px] w-[28px] border"
          style={{ left, borderColor: '#bfdc54' }}
        />
      ))}
    </div>
  )
}

/* Иконка «карточку можно перевернуть» — только на тач-экранах, где переворот
   висит на тапе и иначе ничем не обозначен (риск №1 шага 1.6). */
function FlipHintIcon() {
  return (
    <svg
      aria-hidden
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2" />
      <path d="M18.5 2.5v3.5H15M5.5 21.5V18H9" />
    </svg>
  )
}

/* Карточка практики: лицо — фото с названием поверх кадра, оборот — чёрная
   панель с кратким описанием. Десктоп переворачивает по наведению (CSS,
   .practice-flip*), тач — по тапу (data-flipped). */
function PracticeCard({
  item,
  variant,
  isTouch,
}: {
  item: Practice
  variant: CardVariant
  isTouch: boolean
}) {
  const [flipped, setFlipped] = useState(false)
  const href = `/practices/${item.slug}`

  // Состояние тапа учитывается только в тач-режиме: на десктопе переворотом
  // управляет CSS (:hover/:focus-within). Так карточка не останется залипшей на
  // обороте, если режим сменился на лету — планшет повернули, подключили мышь.
  const tapFlipped = isTouch && flipped

  const face = (
    <>
      {/* Фото направления. Пропорция рамки = пропорция кадра, поэтому снимок
          садится целиком, без обрезки object-cover. Декоративное — весь смысл
          несёт текст поверх, поэтому alt пустой. */}
      <Image
        src={item.image}
        alt=""
        fill
        sizes="(max-width: 1023px) 92vw, 34vw"
        className="object-cover"
      />

      {/* Затемнение раздельное — низ под заголовок, верх под ярлык, середина
          кадра остаётся чистой (сплошная вуаль по всей карточке превращала
          фото в тёмное пятно). Нижняя ступень 0.82–0.92 alpha держит контраст
          белого текста с запасом даже на самом светлом из пяти кадров:
          на белом (255) итог 255·0.18 ≈ 46 → 13:1. Посчитано скриптом
          tmp/check-practice-contrast.mjs, а не на глаз. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.82) 20%, rgba(0,0,0,.34) 46%, rgba(0,0,0,0) 66%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[26%]"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,.34) 0%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Лайм-полоса у правого края — общая схема карточки редизайна */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-[3px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 22px var(--color-lime-glow)' }}
      />

      {/* Ярлык — теперь внутри кадра, как «QATAR, 2024» в референсе. Своя
          подложка, а не расчёт на градиент: 11px белым по светлому верху всех
          пяти кадров контраст 4.5:1 не давали, а темнить верх карточки до
          нужной плотности значило похоронить само фото. */}
      <span className="absolute left-[clamp(14px,1.1vw,22px)] top-[clamp(12px,1vw,20px)] rounded-full bg-black/60 px-2.5 py-1 text-[11px] tracking-[0.25em] uppercase text-white backdrop-blur-sm">
        {item.num} / {item.label}
      </span>

      {/* Название практики — поверх фотографии, главное изменение шага 1.6.
          На тач-экранах справа внизу стоит подсказка о перевороте, поэтому
          заголовку там отводится место под неё. */}
      <span
        className={`absolute bottom-[clamp(14px,1.1vw,22px)] left-[clamp(14px,1.1vw,22px)] block font-heading font-extrabold leading-[1.12] text-white text-[clamp(1.0625rem,1.35vw,1.75rem)] ${
          isTouch ? 'right-[104px]' : 'right-[clamp(14px,1.1vw,22px)]'
        }`}
      >
        {item.title}
      </span>

      {/* Подсказка о перевороте — только на тач-экранах, где переворот висит на
          тапе. Стоит в нижнем углу, а не в верхнем: наверху длинные ярлыки
          («02 / КОРПОРАТИВНОЕ ПРАВО») налезали на неё на 390px. */}
      {isTouch && !tapFlipped && (
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
          <FlipHintIcon />
          Нажмите
        </span>
      )}
    </>
  )

  const back = (
    <>
      <span className="text-[11px] tracking-[0.25em] uppercase text-[var(--color-lime)]">
        {item.num} / {item.label}
      </span>
      {/* my-auto — текст встаёт по центру между ярлыком и ссылкой: у широких
          карточек (3/2) описание короче высоты панели, и прижатый к верху абзац
          оставлял полпанели пустой. Кегль по плану не мельче 15px; верхняя
          граница clamp добита до 19px, иначе на 32vw-карточке текст теряется. */}
      <p className="my-auto text-white/90 text-[clamp(0.9375rem,0.95vw,1.1875rem)] leading-[1.5]">
        {item.cardSummary}
      </p>
      {isTouch ? (
        <Link
          href={href}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-[var(--color-lime)]"
        >
          Узнать подробнее
          <span aria-hidden>→</span>
        </Link>
      ) : (
        /* На десктопе ссылка — вся карточка (лицевая грань), поэтому здесь
           только надпись: второй фокусируемый элемент на ту же практику
           лишний раз гоняет Tab и дублирует ссылку для скринридера. */
        <span className="inline-flex items-center gap-1 self-start text-sm font-semibold text-[var(--color-lime)]">
          Узнать подробнее
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      )}
    </>
  )

  const faceClassName =
    'practice-flip-face practice-flip-face-front block h-full w-full text-left outline-none border border-[var(--color-line)]'

  return (
    <div
      id={`practice-${item.slug}`}
      data-flipped={tapFlipped ? 'true' : 'false'}
      className={`practice-flip group scroll-mt-[30dvh] shrink-0 sm:mx-auto sm:max-w-[340px] lg:mx-0 lg:ml-[5vw] lg:max-w-none ${variant.align} ${variant.width}`}
    >
      {/* Внешний слой параллакса — снаружи 3D-сцены: второй transform внутри
          preserve-3d давал дрожание грани и протекание оборота в WebKit.
          overflow здесь не ставить — он схлопывает 3D-контекст. */}
      <div data-parallax>
        {/* min-h до lg: на 390px карточка по пропорции кадра (3/2 → 228px)
            короче, чем её же оборот с описанием, и текст упирался в границу
            панели. Прокрутка внутри оборота исключена — на iOS она перехватывает
            вертикальный тач-скролл страницы (см. MobilePartnerCard), поэтому
            высоту добирает сама карточка, а кадр досаживает object-cover. */}
        <div
          className="practice-flip-scene relative min-h-[330px] w-full rounded-[var(--radius-md)] lg:min-h-0"
          style={{ aspectRatio: item.imageRatio, boxShadow: 'var(--shadow-card)' }}
        >
          <div className="practice-flip-inner">
            {isTouch ? (
              <button
                type="button"
                onClick={() => setFlipped((v) => !v)}
                aria-pressed={tapFlipped}
                aria-label={`Практика «${item.title}» — показать краткое описание`}
                className={`${faceClassName} cursor-pointer`}
              >
                {face}
              </button>
            ) : (
              <Link
                href={href}
                aria-label={`Практика «${item.title}» — узнать подробнее`}
                className={faceClassName}
              >
                {face}
              </Link>
            )}

            <div
              onClick={isTouch ? () => setFlipped(false) : undefined}
              className="practice-flip-face practice-flip-face-back flex flex-col gap-[clamp(10px,0.9vw,16px)] border border-[var(--color-lime)] bg-[#0b0d0a] p-[clamp(16px,1.2vw,26px)]"
              style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
            >
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuoteBlock({ text }: { text: string }) {
  return (
    <div className="shrink-0 w-full lg:self-center lg:ml-[7vw] lg:w-[26vw] lg:min-w-[300px]">
      <p className="font-heading italic font-semibold text-[var(--color-lime-ink)] text-[clamp(1.25rem,1.8vw,1.75rem)] leading-snug">
        {text}
      </p>
    </div>
  )
}

export function PracticesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  /* Тач или мышь. Определяется один раз на всю секцию (а не в каждой карточке)
     и только на клиенте: на сервере рендерится десктопный вариант — карточка
     остаётся честной ссылкой <a> в разметке, что важно и для SEO, и на случай,
     если JS не отработал. Слушаем change: подключение мыши к планшету или
     поворот устройства меняют режим на лету. */
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setIsTouch(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useGSAP(
    () => {
      const pinWrap = pinRef.current
      const track = trackRef.current
      if (!pinWrap || !track) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const dist = () => track.scrollWidth - window.innerWidth

        // Вертикальный скролл конвертируется в горизонтальный сдвиг трека;
        // когда трек доехал до конца — пин отпускает и страница едет дальше вниз
        const scrollTween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            id: 'practices-collage',
            trigger: pinWrap,
            start: 'top top',
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // Лёгкий параллакс — глубина, как в референсе. С шага 1.6 двигается вся
        // карточка, а не фото внутри рамки: слой с xPercent внутри 3D-сцены
        // флипа давал дрожание грани в WebKit. Амплитуда уменьшена (было ±5%
        // ширины кадра, стало ±3.5% ширины карточки) — сдвиг остаётся заметно
        // меньше зазора lg:ml-[5vw], карточки не наезжают друг на друга.
        track.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -3.5 },
            {
              xPercent: 3.5,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                containerAnimation: scrollTween,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })
      })

      // Reduced motion: без пина — обычная горизонтальная прокрутка коллажа
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: reduce)', () => {
        pinWrap.classList.add('overflow-x-auto')
        return () => pinWrap.classList.remove('overflow-x-auto')
      })

      // Высоты карточек коллажа изменились (шаг 1.6) — пересчитать длину пина
      // после того, как раскладка устаканилась (мина №6 плана)
      requestAnimationFrame(() => ScrollTrigger.refresh())
    },
    { scope: sectionRef },
  )

  return (
    <section id="practices" ref={sectionRef} className="relative bg-[var(--color-bg)]">
      {/* Экран-заголовок: уезжает вверх обычным скроллом, как интро в референсе */}
      <div className="relative flex flex-col items-center justify-start overflow-hidden px-6 pt-28 pb-16 text-center lg:h-dvh lg:justify-center lg:pt-0 lg:pb-0">
        {/* Светлый градиент секции + мягкий лайм-glow за заголовком */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 52% 48%, var(--color-lime-soft), transparent 30%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
          }}
        />

        {/* Ghost-panel за заголовком — полупрозрачная скруглённая панель */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[560px] w-[min(1230px,86vw)] -translate-x-1/2 -translate-y-1/2 rounded-[42px] lg:block"
          style={{
            background: 'rgba(255,255,255,.64)',
            border: '1px solid rgba(255,255,255,.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,.95),0 30px 90px rgba(0,0,0,.04)',
          }}
        />

        {/* Фоновые эллиптические орбиты */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[96%] max-w-[1530px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[-15deg]"
          style={{ borderColor: 'rgba(168,204,51,.42)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[510px] w-[86%] max-w-[1380px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[-11deg]"
          style={{ borderColor: 'rgba(0,0,0,.08)' }}
        />

        {/* Лайм-точки по периметру орбит */}
        {[
          'left-[10%] top-[46%]',
          'right-[11%] top-[22%]',
          'left-[38%] bottom-[8%]',
          'right-[14%] top-[56%]',
          'right-[24%] bottom-[16%]',
          'left-[16%] top-[26%]',
        ].map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={`pointer-events-none absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
        ))}

        {/* Контурные лого-скобки — декор по углам, как в референсе */}
        <LogoOutline className="bottom-[8%] left-[10%]" />
        <LogoOutline className="right-[9%] top-[24%]" />

        {/* Контент заголовочного экрана */}
        <div className="relative z-[4]">
          <h2
            className="
              mt-8 font-heading font-black uppercase
              text-[clamp(3rem,9vw,8.5rem)] leading-[0.9] tracking-[-0.06em]
              text-[var(--color-text)]
            "
          >
            Наши
            <br />
            практики
          </h2>
          <p className="mx-auto mt-10 max-w-3xl font-heading italic text-[var(--color-muted)] text-[clamp(1.25rem,2vw,1.9rem)] leading-snug">
            {PRACTICES_SLOGAN}
          </p>
        </div>
      </div>

      {/* Пин-экран: коллаж карточек, едущий горизонтально */}
      <div ref={pinRef} className="relative lg:h-dvh lg:overflow-hidden">
        <div
          ref={trackRef}
          id="practices-track"
          className="flex flex-col gap-14 px-6 py-16 lg:h-full lg:w-max lg:flex-row lg:items-stretch lg:gap-0 lg:px-0 lg:py-[6dvh]"
        >
          {/* Отступ старта: первая карточка входит из-за правого края не впритык */}
          <div className="hidden w-[6vw] shrink-0 lg:block" aria-hidden="true" />

          {PRACTICE_ITEMS.map((item, i) => (
            <Fragment key={item.slug}>
              {/* Цитаты — перед 3-й и 5-й карточками, как реплики в референсе */}
              {i === 2 && <QuoteBlock text={PRACTICE_QUOTES[0]} />}
              {i === 4 && <QuoteBlock text={PRACTICE_QUOTES[1]} />}
              <PracticeCard
                item={item}
                variant={CARD_VARIANTS[i % CARD_VARIANTS.length]}
                isTouch={isTouch}
              />
            </Fragment>
          ))}

          {/* Хвост: последняя карточка останавливается не у самого края */}
          <div className="hidden w-[10vw] shrink-0 lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
