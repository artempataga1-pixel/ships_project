import type { Product } from '@/types/content'

/* Блок «Продукты» на странице практики.

   Требование заказчика: продукты должны визуально отличаться от перечня услуг —
   клиенту должно быть понятно, что это не ещё один список юридических работ, а
   законченные решения, с которыми можно прийти в фирму.

   Поэтому контраст с ServicesAccordion сделан по трём осям сразу:
   — панели услуг полупрозрачные с backdrop-blur, карточки продуктов — плотные
     белые (тот же паттерн, что у карточек кейсов: рамка --color-line,
     --shadow-card, лайм-полоса у правого края);
   — услуги идут списком с маркерами, продукты — сеткой карточек;
   — у каждого продукта есть действие (кнопка), у пункта услуги действия нет.

   Кнопка ведёт на форму главной с проброшенной темой:
   /?product=<slug>&practice=<slug>#contacts — ContactsSection читает эти
   параметры и предзаполняет «Направление» и «Сообщение».

   hasPage — задел под будущие /products/<slug>: сейчас у всех продуктов false,
   поэтому «Подробнее» не рендерится и страницы не создаются. */

function ArrowRight() {
  return (
    <svg aria-hidden width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ProductsGrid({
  products,
  practiceSlug,
}: {
  products: Product[]
  practiceSlug: string
}) {
  if (products.length === 0) return null

  return (
    <>
      {/* Поясняющий подзаголовок над блоком — разводит продукты и перечень
          услуг словами, а не только вёрсткой. */}
      <p className="mb-8 max-w-[62ch] text-base leading-relaxed text-[var(--color-muted)] md:mb-10 md:text-lg">
        Законченные решения с понятным объёмом работ и результатом — с ними можно
        обратиться сразу, не собирая задачу из отдельных услуг.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="relative flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 md:p-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          {/* Лайм-полоса у правого края + glow — паттерн карточки сайта */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[14%] h-[72%] w-[4px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
          />

          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
            Продукт
          </p>

          <h3 className="mt-4 font-heading text-lg font-extrabold leading-snug tracking-[-0.01em] text-[var(--color-text)] md:text-xl">
            {product.title}
          </h3>

          {product.description && (
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-muted)]">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
            {/* Обычный <a>, не next/link, и это осознанно: нужна полная загрузка
                главной, чтобы отработала ветка «переход с якорем» в
                HomeAnchorScroll (оверлей + серия попыток, пока пины не устаканят
                раскладку) и чтобы ContactsSection прочитал query-параметры при
                монтировании. Тот же приём, что у CTA страницы практики. */}
            <a
              href={`/?product=${product.slug}&practice=${practiceSlug}#contacts`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-5 text-sm font-semibold text-[var(--color-text)] transition-colors duration-200 hover:border-[var(--color-lime)] hover:bg-[var(--color-lime)] focus-visible:border-[var(--color-lime)] focus-visible:bg-[var(--color-lime)] motion-reduce:transition-none"
            >
              Обсудить задачу
              <ArrowRight />
            </a>

            {/* Отдельных страниц продуктов пока нет — у всех hasPage: false.
                Ветка живёт здесь, чтобы включение страниц не требовало правки
                вёрстки (прямое требование заказчика по расширяемости). */}
            {product.hasPage && (
              <a
                href={`/products/${product.slug}`}
                className="text-sm font-semibold text-[var(--color-lime-ink)] underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none"
              >
                Подробнее
              </a>
            )}
          </div>
          </article>
        ))}
      </div>
    </>
  )
}
