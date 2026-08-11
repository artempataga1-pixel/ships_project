'use client'

import Image from 'next/image'
import type { MediaItem } from '@/types/content'
import { BlurIn } from '@/components/ui/BlurIn'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ComingSoonPanel } from './ComingSoonPanel'

/* Блок «Публикации и аналитика» на странице практики.

   Раскладка по референсу Insights: заголовок проявляется из размытия, под ним
   ряд карточек разной высоты (450 / 350 / 450) — на широком экране они выровнены
   по низу, и средняя оказывается ступенькой выше. Карточки выезжают снизу
   каскадом с шагом 0.2с.

   Роль «крупной цифры» из референса играет название издания: у публикации нет
   метрики, которую честно вынести в 60px, а издание — ровно тот якорь, по
   которому читатель узнаёт материал. Кегль при этом меньше референсного и
   резиновый: «ПроБанкротство» в 60px не помещается в карточку ни на одном
   разумном экране.

   Подложка — реальное превью публикации (public/images/articles) под
   градиентом: снизу плотный, кверху прозрачный. Так и кадр виден, и тёмный
   текст внизу гарантированно читается независимо от того, насколько светлым
   окажется само превью.

   У публикаций пока нет ссылок на источник (MediaItem.url не расставлен) —
   поэтому карточка не кликабельна. Появится url — здесь встанет <a>. */

/* Плотность лайм-подсветки по карточкам — аналог трёх разных overlay
   референса: соседние карточки не должны выглядеть под копирку. */
const TONES = [
  'linear-gradient(180deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.62) 46%, rgba(247,250,240,.95) 100%)',
  'linear-gradient(180deg, rgba(255,255,255,.18) 0%, rgba(247,250,240,.7) 44%, rgba(238,244,223,.96) 100%)',
  'linear-gradient(180deg, rgba(255,255,255,.1) 0%, rgba(255,255,255,.58) 48%, rgba(244,248,238,.94) 100%)',
]

const MIN_HEIGHTS = ['min-h-[450px]', 'min-h-[350px]', 'min-h-[450px]']

function ArticleCard({ item, index }: { item: MediaItem; index: number }) {
  return (
    /* min-w-0 обязателен: без него flex-элемент не сжимается уже своего
       min-content, а min-content здесь задаёт название издания в крупном
       кегле. «ПроБанкротство» требовало 424px, «Право.ru» — 263px, и три
       карточки с одинаковым flex-basis всё равно расползались по ширине. */
    /* Наведение — свой сюжет, отличный и от продуктов (пиксельная волна), и от
       кейсов (косой блик + наводка на резкость): карточка приподнимается,
       рамка уходит в лайм, снизу расцветает лайм-подсветка, кадр подъезжает,
       а под названием издания вырастает лайм-подчёркивание. Публикации пока
       не кликабельны (у MediaItem нет url), поэтому отклик намеренно
       спокойный — он показывает, что карточка живая, но ничего не обещает. */
    <article
      className={`group relative flex min-w-0 flex-1 flex-col justify-end overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-line)] p-8 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-[var(--color-lime)] hover:shadow-[0_28px_60px_-26px_var(--color-lime-glow)] motion-reduce:transition-none md:p-10 ${
        MIN_HEIGHTS[index % MIN_HEIGHTS.length]
      }`}
    >
      <Image
        src={item.image}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 1023px) 92vw, 33vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: TONES[index % TONES.length] }}
      />

      {/* Лайм-подсветка снизу — расцветает только при наведении */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background: 'radial-gradient(120% 70% at 50% 118%, var(--color-lime-glow), transparent 62%)',
        }}
      />

      <div className="relative z-10 flex max-w-[388px] flex-col gap-5">
        {/* Кегль подобран по самому длинному названию издания
            («ПроБанкротство», 14 знаков): в 42px референса оно не влезало в
            карточку и рвалось переносом на одну букву. break-words оставлен
            страховкой на случай издания с ещё более длинным именем. */}
        <div>
          <p className="font-heading text-[clamp(1.35rem,2.2vw,1.75rem)] font-black leading-[1.1] tracking-[-0.02em] break-words text-[var(--color-text)]">
            {item.publisher}
          </p>
          <span
            aria-hidden
            className="mt-2.5 block h-[3px] w-0 rounded-full bg-[var(--color-lime)] transition-[width] duration-500 ease-out group-hover:w-16 motion-reduce:transition-none"
          />
        </div>
        <div>
          <h3 className="text-lg leading-snug text-[var(--color-text)] md:text-[22px]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm font-medium text-[var(--color-muted)]">{item.date}</p>
        </div>
      </div>
    </article>
  )
}

export function ArticlesInsights({ articles }: { articles: MediaItem[] }) {
  return (
    <div className="flex flex-col gap-12 md:gap-[90px]">
      <div className="flex max-w-[517px] flex-col gap-8 md:gap-10">
        <BlurIn>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
            Экспертиза
          </p>
          <h2 className="font-heading text-[clamp(1.6rem,3.2vw,2.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]">
            Публикации и аналитика
          </h2>
        </BlurIn>

        {/* Лид намеренно без анимации — как в референсе: если проявляется и
            заголовок, и подпись под ним, блок начинает мерцать по частям. */}
        <p className="max-w-[42ch] text-base text-[var(--color-muted)] md:text-lg">
          Комментарии юристов фирмы и разборы практики в профильных и деловых изданиях.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="flex flex-col items-stretch gap-5 lg:flex-row lg:items-end">
          {articles.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.2} className="flex min-w-0 flex-1">
              {/* Парение в покое живёт на отдельной обёртке, а не на самой
                  карточке: RevealOnScroll пишет transform в свой div, hover
                  карточки — в свой, и третья анимация на любом из них просто
                  перебила бы соседнюю. Период и фаза у каждой карточки свои —
                  синхронное качание троих читается дрожанием вёрстки. */}
              <div
                className="card-drift flex min-w-0 flex-1"
                style={{
                  animationDuration: `${6.4 + index * 1.3}s`,
                  animationDelay: `${-index * 2.1}s`,
                }}
              >
                <ArticleCard item={item} index={index} />
              </div>
            </RevealOnScroll>
          ))}
        </div>
      ) : (
        <ComingSoonPanel title="Публикации по этой практике" />
      )}
    </div>
  )
}
