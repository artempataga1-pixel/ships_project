import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import {
  ADJACENT_EXPERTISE,
  ADJACENT_EXPERTISE_INTRO,
} from '@/constants/content/adjacent-expertise'

/* Блок «Смежная экспертиза» — второй уровень раздела «Практики» (шаг 2.1).

   Живёт внутри секции #practices, сразу после горизонтального коллажа и вне
   его пина: пин коллажа отпускает — и дальше блок идёт обычным потоком, до
   «Статей». Своего ScrollTrigger у блока нет (только reveal карточек), высоту
   секции он меняет уже ПОСЛЕ пина, поэтому на расчёт пина не влияет.

   Прямое требование заказчика: «визуально отличаться от пяти основных практик
   и быть очевидно вторым уровнем — компактнее, спокойнее». Отсюда все отличия
   от карточек коллажа, и они намеренные:
   — нет фотографии, нет переворота, нет параллакса и hover-механики;
   — карточка не ссылка: отдельных страниц у этих направлений нет и не будет
     на этом этапе, поэтому и кликать не на что;
   — фон --color-surface-soft вместо белого и никакой тени: карточка читается
     мягким полем на фоне секции, а не выступающим объектом;
   — заголовок 18px bold против clamp-заголовков основных карточек;
   — из фирменной лайм-графики оставлена одна короткая черта без свечения.

   Ноль вёрстки завязано на количество направлений: сетка 3/2/1 колонки
   принимает любое их число, удаление или добавление правится только в
   constants/content/adjacent-expertise.ts. */

function ExpertiseCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-6 sm:p-7">
      {/* Приглушённая лайм-графика: короткая черта без glow. Свечение здесь
          спорило бы с акцентами основных карточек — а блок обязан читаться
          тише них. */}
      <span aria-hidden className="mb-5 block h-[2px] w-7 bg-[var(--color-lime)]" />

      <h4 className="font-heading text-[1.125rem] font-bold leading-snug tracking-[-0.01em] text-[var(--color-text)]">
        {title}
      </h4>

      <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">{description}</p>
    </article>
  )
}

export function AdjacentExpertiseSection() {
  if (ADJACENT_EXPERTISE.length === 0) return null

  return (
    <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-24 pt-16 lg:pb-32 lg:pt-24">
      {/* Тонкая линия-разделитель: коллаж закончился, начинается подраздел.
          Идёт по ширине контента, а не через весь экран — блок должен читаться
          частью «Практик», а не новой секцией сайта. */}
      <div aria-hidden className="mb-14 h-px w-full bg-[var(--color-line)] lg:mb-16" />

      <div className="mx-auto max-w-3xl text-center">
        <RevealOnScroll y={24} blur={0}>
          {/* Надстрочная метка — «дополнительные направления», а не «второй
              уровень»: второй уровень это внутренняя терминология брифа, на
              витрине она посетителю ничего не объясняет. */}
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--color-lime)]" />
            Дополнительные направления
          </span>
          {/* h3, а не h2: заголовок секции — «Наши практики», а это её
              подраздел, и структура заголовков должна это показывать. */}
          <h3 className="mt-5 font-heading text-[clamp(1.6rem,3vw,2.375rem)] font-black leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]">
            Смежная экспертиза
          </h3>
        </RevealOnScroll>

        <RevealOnScroll y={24} blur={0} delay={0.1}>
          <p className="mt-6 text-[1.0625rem] leading-relaxed text-[var(--color-muted)]">
            {ADJACENT_EXPERTISE_INTRO}
          </p>
        </RevealOnScroll>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {ADJACENT_EXPERTISE.map((item, index) => (
          <RevealOnScroll
            key={item.id}
            className="h-full"
            /* Лесенка внутри ряда, а не по всему списку: на трёх колонках
               карточки одного ряда появляются друг за другом, а не через
               нарастающую паузу к пятой. */
            delay={(index % 3) * 0.08}
            y={24}
            blur={0}
            duration={0.65}
          >
            <ExpertiseCard title={item.title} description={item.description} />
          </RevealOnScroll>
        ))}
      </div>
    </div>
  )
}
