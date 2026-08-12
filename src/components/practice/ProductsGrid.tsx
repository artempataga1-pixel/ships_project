'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import type { Product } from '@/types/content'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CardArtwork } from './CardArtwork'

/* Блок «Продукты» на странице практики.

   Требование заказчика: продукты должны визуально отличаться от перечня услуг —
   клиенту должно быть понятно, что это не ещё один список юридических работ, а
   законченные решения, с которыми можно прийти в фирму.

   Появление карточек — «раздача из колоды»: до входа в вьюпорт все карточки
   сложены стопкой за одной опорной (DECK_ANCHOR_SLUG), а как только она
   показалась — разлетаются по своим местам за ~1,45с. Подробности механики
   ниже, у useDeckDeal.

   Подложка карточки — фирменная графика CardArtwork плюс сгенерированный кадр
   в расфокусе (концепт, кадры позже заменяются) и медленный перелив света
   (.card-sheen в globals.css). Стоковых фотографий у продуктов нет и не будет.

   Вся карточка — ссылка на форму главной с проброшенной темой:
   /?product=<slug>&practice=<slug>#contacts — ContactsSection читает эти
   параметры и предзаполняет «Направление» и «Сообщение». */

const PIXEL_COLS = 12
const PIXEL_ROWS = 8

/* Геометрия волны наведения.

   CUBE_STEP — задержка между соседними диагоналями, CUBE_IN/CUBE_OUT —
   собственная вспышка одного кубика. Их соотношение и есть ширина гребня:
   вспышка 0,35с при шаге 0,055с держит зажжёнными примерно шесть диагоналей
   из восемнадцати, то есть треть карточки. Когда вспышка была длиннее прохода
   (первый заход), к середине анимации горели все 96 кубиков разом — это
   читалось не волной, а сеткой, накрывшей карточку.

   CUBE_MIN_SCALE — масштаб кубика в покое. Уменьшенный кубик «отъезжает» от
   соседей, между лайм-контурами появляется просвет, и карточка читается как
   разбирающаяся на части, а не как наложенная поверх сетка. */
const CUBE_STEP = 0.055
const CUBE_IN = 0.13
const CUBE_OUT = 0.22
const CUBE_MIN_SCALE = 0.55

/* Время прохода гребня по диагонали и полная длительность волны.
   Ключевое свойство: в момент WAVE_TOTAL у САМОГО последнего кубика вспышка
   тоже закончена, то есть конечное состояние волны — все кубики погашены.
   На этом строится защита от залипания (см. useGSAP карточки). */
const WAVE_TRAVEL = (PIXEL_ROWS - 1 + PIXEL_COLS - 1) * CUBE_STEP
const WAVE_TOTAL = WAVE_TRAVEL + CUBE_IN + CUBE_OUT

/* Опорная карточка колоды. Слаг, а не индекс: порядок продуктов в реестре
   ещё меняется, а «Стратегия кредитора» останется той же карточкой. Если слаг
   не найден (другая практика) — колода собирается вокруг средней карточки. */
const DECK_ANCHOR_SLUG = 'strategiya-kreditora'

/* Кадры-концепты для подложек карточек. Свои, сгенерированные — те же, что в
   блоке публикаций: светлые, в фирменном лайме. Идут по кругу; акцент на них
   не делается, поэтому в карточке они приглушены и расфокусированы. */
const CARD_IMAGES = [
  '/images/articles/stat4.jpg',
  '/images/articles/stat1.jpg',
  '/images/articles/stat3.jpg',
  '/images/articles/stat2.jpg',
]

/* Позиции «магнитных» квадратов, по набору на карточку (x%, y%, размер px).
   Наборы чередуются по кругу — соседние карточки не должны выглядеть
   штампованными. Значения из референса. */
const MAGNETIC_SETS: { x: number; y: number; size: number }[][] = [
  [
    { x: 5, y: 30, size: 16 },
    { x: 10, y: 42, size: 10 },
    { x: 3, y: 52, size: 7 },
    { x: 80, y: 70, size: 14 },
    { x: 85, y: 82, size: 9 },
    { x: 78, y: 60, size: 6 },
  ],
  [
    { x: 82, y: 55, size: 16 },
    { x: 88, y: 68, size: 10 },
    { x: 78, y: 72, size: 7 },
    { x: 85, y: 42, size: 6 },
    { x: 90, y: 80, size: 8 },
  ],
  [
    { x: 4, y: 24, size: 16 },
    { x: 10, y: 36, size: 10 },
    { x: 2, y: 44, size: 7 },
    { x: 78, y: 78, size: 14 },
    { x: 84, y: 88, size: 8 },
  ],
  [
    { x: 82, y: 26, size: 14 },
    { x: 88, y: 38, size: 10 },
    { x: 78, y: 44, size: 7 },
    { x: 84, y: 54, size: 5 },
    { x: 90, y: 60, size: 8 },
  ],
]

/* Парящие квадраты в шапке блока (x%, y%, размер px) — значения из референса. */
const FLOATING_SQUARES = [
  { x: 6, y: 20, size: 12 },
  { x: 12, y: 32, size: 8 },
  { x: 8, y: 44, size: 6 },
  { x: 88, y: 18, size: 10 },
  { x: 92, y: 30, size: 14 },
  { x: 85, y: 42, size: 7 },
  { x: 90, y: 52, size: 5 },
  { x: 14, y: 56, size: 5 },
]

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.75 6V15.75C18.75 15.949 18.671 16.14 18.53 16.28C18.39 16.421 18.199 16.5 18 16.5C17.801 16.5 17.61 16.421 17.47 16.28C17.329 16.14 17.25 15.949 17.25 15.75V7.81L6.53 18.53C6.39 18.671 6.199 18.75 6 18.75C5.801 18.75 5.61 18.671 5.47 18.53C5.329 18.39 5.25 18.199 5.25 18C5.25 17.801 5.329 17.61 5.47 17.47L16.19 6.75H8.25C8.051 6.75 7.86 6.671 7.72 6.53C7.579 6.39 7.5 6.199 7.5 6C7.5 5.801 7.579 5.61 7.72 5.47C7.86 5.329 8.051 5.25 8.25 5.25H18C18.199 5.25 18.39 5.329 18.53 5.47C18.671 5.61 18.75 5.801 18.75 6Z" />
    </svg>
  )
}

/* ── Парящие квадраты шапки ──────────────────────────────────────────────
   Два движения на квадрат, и они намеренно разнесены по двум вложенным
   элементам: параллакс от прогресса скролла живёт на обёртке, покачивание —
   на внутреннем span. Обе анимации двигают y, и на одном элементе вторая
   просто перебила бы первую. */
function FloatingSquares({ sectionRef }: { sectionRef: React.RefObject<HTMLDivElement | null> }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const wraps = gsap.utils.toArray<HTMLElement>('[data-float-wrap]', rootRef.current)
      const bobs = gsap.utils.toArray<HTMLElement>('[data-float-bob]', rootRef.current)

      wraps.forEach((wrap, index) => {
        gsap.to(wrap, {
          y: -(80 + index * 30),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })

      bobs.forEach((bob, index) => {
        gsap.to(bob, {
          y: -10,
          duration: 1.5 + index * 0.2,
          delay: index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATING_SQUARES.map((square) => (
        <div
          key={`${square.x}-${square.y}`}
          data-float-wrap
          className="absolute"
          style={{ left: `${square.x}%`, top: `${square.y}%` }}
        >
          <span
            data-float-bob
            className="block bg-[var(--color-lime)]"
            style={{
              width: square.size,
              height: square.size,
              boxShadow: '0 0 16px var(--color-lime-glow)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* ── Раздача карточек из колоды ──────────────────────────────────────────
   Карточки остаются на своих местах в гриде — двигаются только transform'ы,
   поэтому раскладка не пересчитывается ни на одном кадре: браузеру остаётся
   композитинг, отсюда и плавность на семи карточках сразу.

   Стартовое состояние собирается ПОСЛЕ вёрстки (useGSAP работает в
   useLayoutEffect): у каждой карточки замеряется смещение до опорной, и она
   сдвигается ровно на него — стопка получается точной при любой ширине
   колонки. Лёгкий разворот и уменьшение дают видимый веер колоды.

   Раздача идёт одной timeline: очередь — от опорной карточки к дальним, шаг
   0,1с, длительность броска 0,85с. Итого ~1,45с, как и просил заказчик.
   ScrollTrigger стоит на самой опорной карточке (once), поэтому раздача
   стартует ровно когда пользователь её увидел, и повторно не запускается.

   Одна колонка (мобильный) в раздаче не участвует: карточкам пришлось бы
   лететь через несколько экранов, и «колода» превращалась бы в мельтешение —
   там остаётся обычный подъём снизу с задержкой. */
function useDeckDeal({
  gridRef,
  cardsRef,
  anchorIndex,
  count,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>
  cardsRef: React.RefObject<(HTMLAnchorElement | null)[]>
  anchorIndex: number
  count: number
}) {
  useGSAP(
    () => {
      const grid = gridRef.current
      const cards = cardsRef.current.filter(Boolean) as HTMLAnchorElement[]
      if (!grid || cards.length !== count || count < 2) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const singleColumn = window.matchMedia('(max-width: 767px)').matches

      if (reduced) return

      if (singleColumn) {
        cards.forEach((card, index) => {
          gsap.set(card, { opacity: 0, y: 36 })
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: (index % 3) * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          })
        })
        return
      }

      const anchor = cards[anchorIndex]
      const anchorRect = anchor.getBoundingClientRect()

      // Очередь раздачи: ближние к опорной уходят первыми, дальние последними.
      const order = cards
        .map((card, index) => ({ card, index, rect: card.getBoundingClientRect() }))
        .filter((entry) => entry.index !== anchorIndex)
        .map((entry) => ({
          ...entry,
          distance: Math.hypot(
            entry.rect.left - anchorRect.left,
            entry.rect.top - anchorRect.top,
          ),
        }))
        .sort((a, b) => a.distance - b.distance)

      order.forEach((entry, queue) => {
        gsap.set(entry.card, {
          x: anchorRect.left - entry.rect.left,
          y: anchorRect.top - entry.rect.top,
          // Веер колоды: знак разворота чередуется, амплитуда растёт вглубь
          // стопки — так видно, что карточек много, но края не разлетаются.
          rotation: (queue % 2 === 0 ? 1 : -1) * (1.6 + queue * 0.55),
          scale: 0.96 - queue * 0.008,
          transformOrigin: '50% 50%',
          zIndex: 10 - queue,
          willChange: 'transform',
        })
      })
      gsap.set(anchor, { zIndex: 11 })

      gsap.timeline({
        scrollTrigger: { trigger: anchor, start: 'top 82%', once: true },
        onComplete: () => {
          // Снимаем transform и слой композитинга: иначе карточка остаётся
          // собственным контекстом наложения, а постоянный will-change на
          // семи карточках — лишняя память компоузитора.
          gsap.set(cards, { clearProps: 'transform,zIndex,willChange' })
        },
      }).to(
        order.map((entry) => entry.card),
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.1,
        },
      )
    },
    { scope: gridRef, dependencies: [anchorIndex, count] },
  )
}

function ProductCard({
  product,
  practiceSlug,
  index,
  withPointerEffects,
  cardRef,
}: {
  product: Product
  practiceSlug: string
  index: number
  withPointerEffects: boolean
  cardRef: (node: HTMLAnchorElement | null) => void
}) {
  const rootRef = useRef<HTMLAnchorElement | null>(null)
  const pixelsRef = useRef<HTMLDivElement>(null)
  const magnetsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLSpanElement>(null)
  const waveRef = useRef<gsap.core.Tween | null>(null)
  const resetWaveRef = useRef<(() => void) | null>(null)
  const ctaTweenRef = useRef<gsap.core.Timeline | null>(null)
  const moveTo = useRef<{ x: (v: number) => void; y: (v: number) => void }[]>([])

  const magnets = MAGNETIC_SETS[index % MAGNETIC_SETS.length]

  useGSAP(
    () => {
      if (!withPointerEffects) return

      const squares = gsap.utils.toArray<HTMLElement>('[data-magnet]', magnetsRef.current)
      // quickTo вместо повторных gsap.to на каждое движение мыши: одна
      // переиспользуемая твина на свойство, без пересоздания на каждый кадр.
      moveTo.current = squares.map((square) => ({
        x: gsap.quickTo(square, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(square, 'y', { duration: 0.6, ease: 'power3.out' }),
      }))

      const blocks = gsap.utils.toArray<HTMLElement>('[data-pixel]', pixelsRef.current)
      gsap.set(ctaRef.current, { opacity: 0, y: 10 })

      /* ── Волна, которая ПРОХОДИТ по карточке и уходит ──────────────────

         Первый заход был сделан «в лоб»: по два твина на кубик, сложенные в
         одну timeline со сдвигом по диагонали. Работало, но давало 192 твина
         на карточку и 1344 на блок — при быстром проведении курсором по сетке
         GSAP не успевал их прокручивать, включалось сглаживание лага, и волны
         доигрывали СЕКУНДАМИ позже: карточка, с которой курсор давно ушёл,
         вдруг зажигалась сама по себе.

         Теперь анимация одна на карточку — тикает единственный твин по
         числовому времени, а раскладку кубиков считает paintWave(). Дешевле
         на три порядка по количеству объектов GSAP и, что важнее, ПО ПОСТРОЕНИЮ
         не может залипнуть: состояние кубиков — чистая функция от времени, а
         не результат накопленных твинов. В точке WAVE_TOTAL вспышка последнего
         кубика уже закончена, поэтому финал всегда один — сетка погашена.
         Откуда бы волну ни перезапустили (restart), она пересчитывает всё с
         нуля; onComplete дорисовывает финальный кадр принудительно. */
      const starts = blocks.map((_, blockIndex) => {
        const row = Math.floor(blockIndex / PIXEL_COLS)
        const col = blockIndex % PIXEL_COLS
        return (row + col) * CUBE_STEP
      })

      const paintWave = (time: number) => {
        for (let i = 0; i < blocks.length; i += 1) {
          const local = time - starts[i]
          let k = 0
          if (local > 0 && local < CUBE_IN + CUBE_OUT) {
            k = local < CUBE_IN ? local / CUBE_IN : 1 - (local - CUBE_IN) / CUBE_OUT
          }
          const style = blocks[i].style
          style.opacity = k === 0 ? '0' : `${k}`
          style.transform = `scale(${CUBE_MIN_SCALE + (1 - CUBE_MIN_SCALE) * k})`
        }
      }

      paintWave(WAVE_TOTAL) // исходное состояние = финальному, сетка погашена
      resetWaveRef.current = () => paintWave(WAVE_TOTAL)

      const cursor = { time: 0 }
      // fromTo, а не to: каждый перезапуск обязан начинаться с нуля, иначе
      // волна пойдёт от своего прошлого конца и не нарисует ничего.
      // immediateRender: false — твин не должен рисовать кадр при создании.
      waveRef.current = gsap.fromTo(
        cursor,
        { time: 0 },
        {
          time: WAVE_TOTAL,
          duration: WAVE_TOTAL,
          ease: 'none',
          paused: true,
          immediateRender: false,
          onUpdate: () => paintWave(cursor.time),
          onComplete: () => paintWave(WAVE_TOTAL),
        },
      )

      /* Кнопка — своя короткая timeline, отдельная от волны: волна только
         объявляет наведение и уходит, а кнопка держится всё время, пока
         курсор на карточке. Её тоже собираем заранее и проигрываем вперёд/
         назад, а не создаём твин в обработчике: так анимация принадлежит
         gsap-контексту (сама снимется при размонтировании) и не может
         зависнуть на промежуточной прозрачности при дёрганом наведении. */
      ctaTweenRef.current = gsap
        .timeline({ paused: true })
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    },
    { scope: rootRef, dependencies: [withPointerEffects] },
  )

  const setHover = (active: boolean) => {
    const wave = waveRef.current
    if (active) {
      // Волна запускается только на входе и всегда с нуля: догонять её
      // реверсом нечего — она и так заканчивается погашенной сеткой.
      wave?.restart()
    } else if (wave && !wave.isActive()) {
      // Страховка на уход курсора: если волна уже не идёт, дорисовываем
      // финальный кадр. Стоит один проход по сетке и закрывает случай, когда
      // твин был убит (перемонтирование, revert контекста) до onComplete.
      resetWaveRef.current?.()
    }

    const cta = ctaTweenRef.current
    if (!cta) return
    // Уход быстрее прихода — курсор уже увели, задерживать нечем.
    cta.timeScale(active ? 1 : 1.5)
    if (active) cta.play()
    else cta.reverse()
  }

  const handleMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!withPointerEffects || moveTo.current.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    moveTo.current.forEach((to) => {
      to.x(px * 40)
      to.y(py * 40)
    })
  }

  const resetMagnets = () => {
    moveTo.current.forEach((to) => {
      to.x(0)
      to.y(0)
    })
  }

  return (
    <a
      ref={(node) => {
        rootRef.current = node
        cardRef(node)
      }}
      href={`/?product=${product.slug}&practice=${practiceSlug}#contacts`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false)
        resetMagnets()
      }}
      onPointerMove={handleMove}
      // Клавиатура должна получать тот же отклик, что и мышь: карточка —
      // ссылка, и без этого при табуляции она выглядела бы мёртвой.
      onFocus={() => setHover(true)}
      onBlur={() => {
        setHover(false)
        resetMagnets()
      }}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-lime-ink)]"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* 1. Фирменная подложка: лайм-градиент + контурная лого-скобка */}
      <CardArtwork variant={index} />

      {/* 2. Кадр-концепт. Слегка расфокусирован и приглушён: он здесь фактура,
             а не иллюстрация — на нём не должно быть акцента. При наведении
             не меняется: волна кубиков проходит и уходит, карточка должна
             вернуться ровно к спокойному виду. */}
      <Image
        src={CARD_IMAGES[index % CARD_IMAGES.length]}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 32vw"
        className="scale-[1.05] object-cover opacity-[0.62] blur-[1.5px]"
      />

      {/* 3. Перелив — медленная полоса света поперёк кадра. Отрицательная
             задержка разводит соседние карточки по фазе, чтобы блик не шёл
             по всей сетке строем (см. .card-sheen в globals.css). */}
      <span
        aria-hidden
        className="card-sheen pointer-events-none absolute inset-0"
        style={{ animationDelay: `${-index * 2.3}s` }}
      />

      {/* 4. Осветление низа — плашка с названием должна читаться при любом кадре */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.42) 100%)',
        }}
      />

      {/* 5. Магнитные квадраты — разбегаются в сторону курсора */}
      <div ref={magnetsRef} aria-hidden className="pointer-events-none absolute inset-0">
        {magnets.map((magnet) => (
          <span
            key={`${magnet.x}-${magnet.y}`}
            data-magnet
            className="absolute rounded-[3px] bg-[var(--color-lime)] opacity-70"
            style={{
              left: `${magnet.x}%`,
              top: `${magnet.y}%`,
              width: magnet.size,
              height: magnet.size,
              boxShadow: '0 0 12px var(--color-lime-glow)',
            }}
          />
        ))}
      </div>

      {/* 6. Сетка кубиков 12×8, по которой прокатывается волна наведения.
             Кубик — пустой контур, а не залитый блок: заливка (сначала
             чёрная, потом светлая) закрашивала и кадр, и фирменный лайм —
             карточка на секунду превращалась в другую карточку. Прозрачная
             середина плюс лайм-шов по краю читаются ровно тем, что нужно:
             карточка со своим фоном на мгновение разбирается на кубики.

             Лайм-шов даёт inset-тень в 1px по контуру, наружная — мягкое
             свечение. Соседние кубики перекрываются на пиксель (см. ниже), их
             контуры совпадают, и шов остаётся одной линией, а не двойной. */}
      {withPointerEffects && (
        <div ref={pixelsRef} aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: PIXEL_COLS * PIXEL_ROWS }, (_, blockIndex) => {
            const row = Math.floor(blockIndex / PIXEL_COLS)
            const col = blockIndex % PIXEL_COLS
            return (
              <span
                key={blockIndex}
                data-pixel
                className="absolute block"
                style={{
                  left: `${(col * 100) / PIXEL_COLS}%`,
                  top: `${(row * 100) / PIXEL_ROWS}%`,
                  /* +1px к каждому блоку: доли процента (8.333%, 12.5%) после
                     округления браузером не сходятся, и между рядами
                     оставались рваные щели. Лишний пиксель уходит под
                     соседний блок, крайние — под overflow-hidden карточки. */
                  width: `calc(${100 / PIXEL_COLS}% + 1px)`,
                  height: `calc(${100 / PIXEL_ROWS}% + 1px)`,
                  boxShadow:
                    'inset 0 0 0 1px rgba(168,204,51,.95), 0 0 10px rgba(191,220,84,.35)',
                }}
              />
            )
          })}
        </div>
      )}

      {/* 7. Подпись действия — лайм-кнопка. Живёт отдельно от волны и не
             исчезает вместе с ней: волна лишь объявляет наведение, а кнопка
             держится всё время, пока курсор на карточке. */}
      {withPointerEffects && (
        <span className="pointer-events-none absolute inset-x-0 top-0 bottom-[76px] z-10 flex items-center justify-center">
          <span
            ref={ctaRef}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-lime)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)]"
            style={{ boxShadow: '0 6px 24px var(--color-lime-glow)' }}
          >
            Обсудить задачу
            <ArrowUpRight />
          </span>
        </span>
      )}

      {/* 8. Плашка с названием — в самом левом нижнем углу карточки, без
             отступа: отодвинутая от краёв, она висела в поле кадра отдельным
             объектом. Скругления сохранены — снизу слева повторяет радиус
             карточки, сверху справа своё; прямых углов, из-за которых плашку
             и просили скруглить, не осталось. */}
      <span className="absolute bottom-0 left-0 z-20 block max-w-[88%] rounded-br-none rounded-bl-[var(--radius-md)] rounded-tl-none rounded-tr-[16px] bg-[var(--color-surface)] px-4 py-3">
        <span className="block font-heading text-base font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] md:text-lg">
          {product.title}
        </span>
      </span>
    </a>
  )
}

export function ProductsGrid({
  products,
  practiceSlug,
}: {
  products: Product[]
  practiceSlug: string
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])

  /* Пиксельная шторка и магнитные квадраты имеют смысл только там, где есть
     курсор. На тач-устройствах это 96 лишних узлов DOM на карточку и эффект,
     который либо не сработает, либо залипнет после тапа. Считаем после
     монтирования — на сервере о вводе пользователя знать неоткуда. */
  const [withPointerEffects, setWithPointerEffects] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const apply = () => setWithPointerEffects(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const anchorFromSlug = products.findIndex((product) => product.slug === DECK_ANCHOR_SLUG)
  const anchorIndex = anchorFromSlug >= 0 ? anchorFromSlug : Math.floor(products.length / 2)

  useDeckDeal({ gridRef, cardsRef, anchorIndex, count: products.length })

  if (products.length === 0) return null

  return (
    <div ref={sectionRef} className="relative">
      {/* ── Шапка блока ─────────────────────────────────────────────────── */}
      <div className="relative pb-12 md:pb-16">
        <FloatingSquares sectionRef={sectionRef} />

        <div className="relative mx-auto max-w-3xl text-center">
          <RevealOnScroll>
            {/* Пилюля-бейдж вместо прежней тёмной плашки — тот же элемент, что
                над заголовком «Что мы делаем», и в том же увеличенном кегле:
                два соседних блока страницы должны читаться одной системой. */}
            <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-[1.125rem] py-1.5 text-[1.125rem] font-medium leading-none text-[var(--color-text)]">
              <span
                className="h-2 w-2 rounded-full bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 10px var(--color-lime-glow)' }}
              />
              Продукты
            </span>
            <h2 className="font-heading text-[clamp(1.6rem,3.2vw,2.5rem)] font-black leading-[1.15] tracking-[-0.02em]">
              <span className="text-[var(--color-text)]">Предлагаем готовые </span>
              <span className="text-[var(--color-muted)]">решения</span>
            </h2>
          </RevealOnScroll>
        </div>
      </div>

      {/* ── Сетка карточек ──────────────────────────────────────────────────
          Три колонки на широком экране, а не две, как в референсе: там четыре
          карточки-кейса с фотографиями, а у практики продуктов семь. В две
          колонки блок вытягивается почти на два экрана, и внутри каждой
          карточки 4/3 остаётся пустое поле, которое нечем занять.

          RevealOnScroll на карточках снят: появлением теперь заведует раздача
          из колоды (useDeckDeal), а два независимых механизма писали бы
          в один и тот же transform. */}
      <div ref={gridRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            practiceSlug={practiceSlug}
            index={index}
            withPointerEffects={withPointerEffects}
            cardRef={(node) => {
              cardsRef.current[index] = node
            }}
          />
        ))}
      </div>
    </div>
  )
}
