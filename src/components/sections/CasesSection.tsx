import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import type { CaseStudy } from '@/types/content'

/* Референс — nudot.com.tw (reference 2/keys.mp4): заголовок прилипает
   по центру экрана, а карточки кейсов обычным потоком проезжают ПОВЕРХ
   него снизу вверх. Раскладка чередуется: слева → справа → по центру. */

type Align = 'left' | 'right' | 'center'

const ALIGN_CYCLE: Align[] = ['left', 'right', 'center']

const ALIGN_CLASSES: Record<Align, string> = {
  left: 'self-start ml-[4vw] w-[70vw] md:w-[38vw]',
  right: 'self-end mr-[4vw] w-[70vw] md:w-[44vw]',
  center: 'self-center w-[80vw] md:w-[44vw]',
}

function FloatingCaseCard({ item, align }: { item: CaseStudy; align: Align }) {
  return (
    <Link
      href={`/cases/${item.slug}`}
      aria-label={`Кейс «${item.title}» — подробнее`}
      className={`group block ${ALIGN_CLASSES[align]}`}
    >
      {/* Заглушка вместо фото — потом заменим на реальные изображения */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          className="
            absolute inset-0
            bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900
            transition-transform duration-700 ease-out
            group-hover:scale-[1.04]
          "
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-4xl md:text-5xl font-extrabold text-hero-bronze">
              {item.amount}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <span
          className="
            absolute top-4 left-4
            text-xs font-heading tracking-[0.15em] uppercase
            text-white/80 bg-black/50 backdrop-blur-sm
            px-3 py-1.5 rounded
          "
        >
          {item.category}
        </span>
      </div>

      {/* Подпись под фото, как у референса — мелко и сдержанно */}
      <div className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-white/75">{item.title}</span>
        <span className="text-white/35 shrink-0">{item.year}</span>
      </div>
    </Link>
  )
}

export function CasesSection() {
  return (
    <section id="cases" className="relative bg-black">
      {/* Прилипающий заголовок: стоит по центру экрана, пока мимо едут карточки */}
      <div
        className="
          sticky top-0 z-0 h-dvh
          flex flex-col items-center justify-center gap-6
          text-center px-6
        "
      >
        <span className="text-xs tracking-[0.3em] uppercase text-white/40">
          ( Кейсы )
        </span>
        <h2
          className="
            font-heading font-extrabold uppercase
            text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02]
          "
        >
          Архив
          <br />
          избранных дел
          <br />
          бюро
        </h2>
        <span className="text-sm text-white/40">
          Отрасли, суммы и результаты
        </span>
      </div>

      {/* Поток карточек: поднят на высоту экрана, чтобы ехать поверх заголовка */}
      <div className="relative z-10 -mt-[100dvh] flex flex-col">
        {/* Первый экран — заголовок виден чистым, карточки ждут за нижней кромкой */}
        <div className="h-[85dvh]" aria-hidden="true" />

        {CASE_STUDIES.map((item, i) => (
          <div key={item.slug} className={i === 0 ? 'flex flex-col' : 'mt-[45dvh] flex flex-col'}>
            <FloatingCaseCard item={item} align={ALIGN_CYCLE[i % 3]} />
          </div>
        ))}

        {/* Хвост — последняя карточка уезжает, заголовок снова остаётся один */}
        <div className="h-[70dvh]" aria-hidden="true" />
      </div>
    </section>
  )
}
