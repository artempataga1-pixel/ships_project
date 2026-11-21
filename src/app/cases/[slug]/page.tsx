import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { getCaseBySlug, getPracticesSorted } from '@/lib/content'
import type { CaseStudy } from '@/types/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

interface CasePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return CASE_STUDIES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params
  const item = getCaseBySlug(slug)
  if (!item) return {}
  return {
    title: `${item.title} — Шумская и Партнёры`,
    description: item.summary,
    /* Демо-кейс главной с выдуманными суммами — поисковикам не отдаём */
    ...(item.onHome ? { robots: { index: false, follow: true } } : {}),
  }
}

/* Контурная лого-скобка — тот же декор фона, что в CasesSection/Practices
   (угловые border-рамки + три бара, ~16% opacity). */
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

/* Куда ведёт «← Все кейсы». Демо-кейсы живут на главной — возврат к их
   карточке там. Настоящие кейсы выводятся на странице своей практики —
   возврат к карточке в блоке «Связанные кейсы» (якорь case-<slug>,
   до него довозит ScrollTopOnLoad страницы практики). */
function backHref(item: CaseStudy): string {
  const practiceId = item.practiceIds?.[0]
  const practice = practiceId ? getPracticesSorted().find((p) => p.id === practiceId) : undefined
  if (!item.onHome && practice) return `/practices/${practice.slug}#case-${item.slug}`
  return `/#case-${item.slug}`
}

/* Заголовок раздела страницы кейса — та же лайм-подпись, что у «Результата» */
function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
      {children}
    </h2>
  )
}

/* Раздел из абзацев: «Фабула», «Задача», «Что мы сделали» */
function TextSection({ label, paragraphs }: { label: string; paragraphs: string[] }) {
  return (
    <section className="mt-14 md:mt-16">
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-5 flex max-w-[70ch] flex-col gap-4">
        {paragraphs.map((text, i) => (
          <p
            key={i}
            className="text-base leading-[1.7] text-[var(--color-text)] md:text-lg md:leading-[1.7]"
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  )
}

export default async function CaseStudyPage({ params }: CasePageProps) {
  const { slug } = await params
  const item = getCaseBySlug(slug)
  if (!item) notFound()

  /* Настоящие кейсы практик расписаны по разделам; у демо-кейсов главной
     есть только краткий итог — для них прежняя раскладка «Результат». */
  const detailed = Boolean(item.situation?.length)
  const hasResult = Boolean(item.result?.length)
  const resultLabel = hasResult ? 'Результат' : 'Статус'
  const resultParagraphs = hasResult ? (item.result ?? []) : item.status ? [item.status] : []
  /* Длинные заголовки настоящих кейсов (до 150 знаков) в кегле демо-кейсов
     занимали бы пол-экрана — для них кегль ступенью ниже. */
  const longTitle = item.title.length > 70

  return (
    <main
      className="relative min-h-svh lg:min-h-dvh overflow-hidden bg-[var(--color-bg)]"
      style={{
        background:
          'radial-gradient(circle at 74% 30%, rgba(168,204,51,.09), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 58%,#f7f7f5 100%)',
        clipPath: 'inset(0)',
      }}
    >
      <ScrollTopOnLoad />
      {/* Задник закреплён на вьюпорте, как на странице практики. Прежний
          absolute растягивал кадр 16:9 на всю высоту кейса (~2400px, зум ×4),
          и край стены в кадре проезжал по экрану резкой ступенькой сразу под
          «Результатом». clip-path на main — чтобы fixed-слой не вылезал за
          страницу; -z-10 внутри этого контекста — над фоном main, под текстом. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <CaseBackground />
      </div>
      {/* --- Фоновый декор: эллиптические орбиты + лайм-точки + контурная скобка.
          Привязан к первому экрану, а не ко всей странице: проценты от полной
          высоты длинного кейса роняли точку прямо на «Почему этот кейс важен»,
          а орбиты резали абзацы «Фабулы». Точки — у краёв и только с lg, где
          поля вокруг колонки 1120px гарантированно пустые. --- */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-svh">
        <div
          className="absolute left-1/2 top-[52%] h-[560px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
          style={{ borderColor: 'rgba(168,204,51,.34)' }}
        />
        <div
          className="absolute left-1/2 top-[56%] h-[420px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[8deg]"
          style={{ borderColor: 'rgba(0,0,0,.07)' }}
        />
        {['left-[3%] top-[34%]', 'right-[3%] top-[22%]', 'left-[4%] bottom-[12%]', 'right-[4%] bottom-[20%]'].map(
          (pos) => (
            <span
              key={pos}
              className={`absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] lg:block`}
              style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
            />
          ),
        )}
        <LogoOutline className="right-[2%] top-[14%]" />
      </div>

      {/* pt-28/32 — шапка фиксированная (~80px): герой кейса садится сразу под
          неё, и заголовок с панелью суммы целиком входят в первый экран. */}
      <div className="relative z-10 mx-auto max-w-[1120px] px-6 pb-28 pt-28 md:pt-32">
        {/* Возврат ровно к карточке этого кейса в блоке «Кейсы».
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow. */}
        {/* scroll={false} — свой скролл к карточке делает HomeAnchorScroll на
            главной (с повторными попытками, пока раскладка не устаканится);
            встроенный hash-scroll Next.js делает это одним ранним прыжком и
            гонится с ним, из-за чего страница иногда оставалась в самом верху. */}
        <Link
          href={backHref(item)}
          scroll={false}
          className="btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          {item.onHome ? '← Все кейсы' : '← К практике'}
        </Link>

        {/* --- Герой: слева мета+заголовок, справа панель с суммой --- */}
        <div
          className={`mt-8 grid gap-10 md:mt-10 lg:items-center ${item.amount ? 'lg:grid-cols-[1.1fr_0.9fr]' : ''}`}
        >
          {/* Левая колонка */}
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Плашка категории — пилюля с лайм-квадратиком (как в архиве) */}
              <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
                {item.category}
                <i
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                />
              </span>
              {/* Точка и подпись — одним блоком: на 375 точка оставалась
                  висеть одна в конце строки, а подпись уезжала вниз */}
              {item.desc && (
                <span className="inline-flex items-center gap-4 whitespace-nowrap">
                  <span aria-hidden className="text-[var(--color-muted)]">
                    ·
                  </span>
                  <span className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]">
                    {item.desc}
                  </span>
                </span>
              )}
            </div>

            <h1
              className={`mt-8 font-heading font-black tracking-[-0.03em] text-[var(--color-text)] ${
                longTitle
                  ? 'max-w-[32ch] text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.16]'
                  : 'text-[clamp(2rem,5vw,3.75rem)] leading-[1.03]'
              }`}
            >
              {item.title}
            </h1>
          </div>

          {/* Правая колонка — белая панель с суммой и лайм-полосой справа.
              Суммы нет в описании дела — панели нет, заголовок во всю ширину. */}
          {item.amount && (
          <div
            className="relative flex min-h-[260px] flex-col justify-center gap-7 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-gradient-to-b from-white to-[var(--color-surface-soft)] p-8"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {/* Мягкий лайм-glow из нижнего правого угла */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2"
              style={{
                background:
                  'radial-gradient(circle, rgba(168,204,51,.28), transparent 62%)',
              }}
            />
            {/* Лайм-полоса у правого края + glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-[10%] h-[80%] w-[5px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 34px var(--color-lime-glow)' }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                {item.amountLabel ?? 'Сумма спора'}
              </span>
              {item.year && (
                <span className="font-heading text-base font-bold text-[var(--color-muted)]">
                  {item.year}
                </span>
              )}
            </div>

            <span className="whitespace-nowrap font-heading text-[clamp(2.5rem,6vw,4.25rem)] font-black tracking-[-0.03em] text-[var(--color-text)]">
              {item.amount}
            </span>
          </div>
          )}
        </div>

        {/* --- Разделы дела: фабула, задача, что сделали --- */}
        {detailed && (
          <>
            <TextSection label="Фабула" paragraphs={item.situation ?? []} />
            {item.task && <TextSection label="Задача" paragraphs={[item.task]} />}
            {item.actions?.length ? (
              <TextSection label="Что мы сделали" paragraphs={item.actions} />
            ) : null}
          </>
        )}

        {/* --- Результат: ghost-panel с лайм-полосой слева (паттерн из About).
            У кейса «Единственное жильё» раздела «Результат» в документе нет
            (решение 26.10) — панели тоже нет. --- */}
        {(!detailed || resultParagraphs.length > 0) && (
        <div
          className="relative mt-12 overflow-hidden rounded-[var(--radius-xl)] border p-8 md:p-11"
          style={{
            background: 'rgba(255,255,255,.64)',
            borderColor: 'rgba(255,255,255,.85)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Лайм-полоса слева + glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
          />
          <SectionLabel>{detailed ? resultLabel : 'Результат'}</SectionLabel>
          <div className="mt-5 flex max-w-[62ch] flex-col gap-4">
            {(detailed ? resultParagraphs : [item.summary]).map((text, i) => (
              <p key={i} className="text-lg leading-relaxed text-[var(--color-text)] md:text-xl">
                {text}
              </p>
            ))}
          </div>
        </div>
        )}

        {/* --- Почему кейс важен: вывод дела, лайм-линия слева.
            Отделён от «Результата» широкой паузой с затухающей лайм-чертой и
            выплывает при скролле: прежние 48px читались как продолжение той же
            панели, а не как переход к выводу. --- */}
        {item.why && (
          <>
            <div aria-hidden className="mx-auto mt-20 flex justify-center md:mt-28">
              <span
                className="h-px w-[min(420px,70%)]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, var(--color-lime) 50%, transparent)',
                  boxShadow: '0 0 18px var(--color-lime-glow)',
                }}
              />
            </div>
            <RevealOnScroll y={30} duration={0.8} className="mt-20 md:mt-28">
              <section className="border-l-[3px] border-[var(--color-lime)] pl-6 md:pl-8">
                <SectionLabel>Почему этот кейс важен</SectionLabel>
                <p className="mt-5 max-w-[66ch] font-heading text-lg font-bold leading-[1.5] text-[var(--color-text)] md:text-xl">
                  {item.why}
                </p>
              </section>
            </RevealOnScroll>
          </>
        )}

        {/* CTA — по центру и крупнее: финальное действие страницы, а не
            приписка к последнему абзацу. Ведёт на отдельную страницу /contacts:
            якорь «/#contacts» грузил бы главную со сторибуком (9.5 МБ) ради
            формы на пять полей. .btn-lime-breathe — пульсация свечения. */}
        <div className="mt-16 flex justify-center md:mt-20">
          <Link
            href="/contacts"
            className="btn-lime-fill btn-lime-breathe inline-flex h-14 items-center justify-center rounded-md px-10 text-base font-semibold md:h-16 md:px-14 md:text-lg"
          >
            Оставить заявку
          </Link>
        </div>
      </div>
    </main>
  )
}
