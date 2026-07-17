import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import type { CaseStudy } from '@/types/content'

/* Референс — dizain6.jpg + 02_cases_archive (заголовочный экран). Механика
   прежняя: заголовок прилипает по центру экрана (sticky), а карточки кейсов
   обычным потоком проезжают ПОВЕРХ него снизу вверх. Раскладка чередуется:
   слева → справа → по центру. Меняется только палитра/форма карточек под
   лайм-редизайн — светлый фон, белые панели с лайм-полосой справа. */

type Align = 'left' | 'right' | 'center'

const ALIGN_CYCLE: Align[] = ['left', 'right', 'center']

const ALIGN_CLASSES: Record<Align, string> = {
  left: 'self-start ml-[4vw] w-[70vw] md:w-[38vw]',
  right: 'self-end mr-[4vw] w-[70vw] md:w-[44vw]',
  center: 'self-center w-[80vw] md:w-[44vw]',
}

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

function FloatingCaseCard({ item, align }: { item: CaseStudy; align: Align }) {
  return (
    <Link
      id={`case-${item.slug}`}
      href={`/cases/${item.slug}`}
      aria-label={`Кейс «${item.title}» — подробнее`}
      className={`group block scroll-mt-[30dvh] ${ALIGN_CLASSES[align]}`}
    >
      {/* Белая панель с лайм-полосой справа — общая схема карточки редизайна */}
      <div
        className="
          relative aspect-[16/10] overflow-hidden
          rounded-[var(--radius-lg)] border border-[var(--color-line)]
          bg-gradient-to-b from-white to-[var(--color-surface-soft)]
          transition-transform duration-500 ease-out
          group-hover:scale-[1.02]
        "
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Мягкий лайм-glow из нижнего правого угла (декор ::after в референсе) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2"
          style={{
            background:
              'radial-gradient(circle, rgba(201,255,31,.28), transparent 62%)',
          }}
        />

        {/* Лайм-полоса у правого края + glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-[8%] h-[84%] w-[5px] bg-[var(--color-lime)]"
          style={{ boxShadow: '0 0 34px var(--color-lime-glow)' }}
        />

        {/* Плашка категории — пилюля с лайм-квадратиком */}
        <span
          className="
            absolute left-[6%] top-[9%]
            inline-flex items-center gap-3
            rounded-md border border-[var(--color-line)] bg-white
            px-4 py-2
            text-[0.7rem] font-heading font-black uppercase tracking-[0.12em]
            text-[var(--color-text)]
          "
        >
          {item.category}
          <i
            aria-hidden
            className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
          />
        </span>

        {/* Год — приглушённо в правом верхнем углу */}
        <span className="absolute right-[8%] top-[10%] text-sm font-medium text-[var(--color-muted)]">
          {item.year}
        </span>

        {/* Сумма — крупным чёрным текстом по центру карточки */}
        <span
          className="
            absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2
            whitespace-nowrap font-heading font-black tracking-[-0.03em]
            text-[clamp(1.75rem,4vw,3rem)] text-[var(--color-text)]
          "
        >
          {item.amount}
        </span>

        {/* Название дела + «Подробнее» — снизу карточки */}
        <div className="absolute inset-x-[6%] bottom-[9%] flex items-end justify-between gap-4">
          <span className="max-w-[70%] font-heading text-sm md:text-base font-semibold leading-snug text-[var(--color-text)]">
            {item.title}
          </span>
          <span className="shrink-0 text-sm font-semibold text-[var(--color-lime-ink)] transition-transform duration-300 group-hover:translate-x-1">
            Подробнее →
          </span>
        </div>
      </div>
    </Link>
  )
}

export function CasesSection() {
  return (
    <section
      id="cases"
      className="relative bg-[var(--color-bg)]"
      style={{
        background:
          'radial-gradient(circle at 72% 42%, rgba(201,255,31,.08), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
      }}
    >
      {/* Прилипающий заголовок: стоит по центру экрана, пока мимо едут карточки */}
      <div
        className="
          sticky top-0 z-0 h-svh overflow-hidden lg:h-dvh
          flex flex-col items-center justify-center gap-6
          text-center px-6
        "
      >
        {/* Фоновые эллиптические орбиты */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[96%] max-w-[1530px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
          style={{ borderColor: 'rgba(201,255,31,.42)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[72%] max-w-[1100px] -translate-x-1/2 -translate-y-[42%] rounded-[50%] border rotate-[8deg]"
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

        {/* Контурная лого-скобка — декор справа, как в референсе */}
        <LogoOutline className="right-[9%] top-[24%]" />

        {/* Контент заголовочного экрана */}
        <div className="relative z-[4] flex flex-col items-center gap-6">
          <span className="text-sm md:text-base tracking-[0.3em] uppercase text-[var(--color-muted)]">
            ( кейсы )
          </span>
          <h2
            className="
              font-heading font-black uppercase
              text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.045em]
              text-[var(--color-text)]
            "
          >
            Архив
            <br />
            избранных дел
            <br />
            бюро
          </h2>
          <span className="text-base md:text-lg text-[var(--color-muted)]">
            Отрасли, суммы и результаты
          </span>
        </div>
      </div>

      {/* Поток карточек: поднят на высоту экрана, чтобы ехать поверх заголовка */}
      <div className="relative z-10 -mt-[100dvh] flex flex-col">
        {/* Первый экран — заголовок виден чистым, карточки ждут за нижней кромкой */}
        <div className="h-[85dvh]" aria-hidden="true" />

        {CASE_STUDIES.map((item, i) => (
          <div key={item.slug} className={i === 0 ? 'flex flex-col' : 'mt-[30dvh] lg:mt-[45dvh] flex flex-col'}>
            <FloatingCaseCard item={item} align={ALIGN_CYCLE[i % 3]} />
          </div>
        ))}

        {/* Хвост — последняя карточка уезжает, заголовок снова остаётся один */}
        <div className="h-[70dvh]" aria-hidden="true" />
      </div>
    </section>
  )
}
