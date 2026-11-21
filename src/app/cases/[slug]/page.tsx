import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { getCaseBySlug, getPracticesSorted } from '@/lib/content'
import type { CaseStudy } from '@/types/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CaseRoute, type CaseStage } from '@/components/case/CaseRoute'

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
    title: `${item.title} — Шумская и партнёры`,
    description: item.summary,
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

/* Куда ведёт «← К практике»: к карточке в блоке «Связанные кейсы» на странице
   практики (якорь case-<slug>, до него довозит ScrollTopOnLoad). Кейс без
   практики — к блоку «Кейсы» на главной. */
function backHref(item: CaseStudy): string {
  const practiceId = item.practiceIds?.[0]
  const practice = practiceId ? getPracticesSorted().find((p) => p.id === practiceId) : undefined
  if (practice) return `/practices/${practice.slug}#case-${item.slug}`
  return '/#cases'
}

/* Заголовок раздела страницы кейса — та же лайм-подпись, что у «Результата» */
function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
      {children}
    </h2>
  )
}

export default async function CaseStudyPage({ params }: CasePageProps) {
  const { slug } = await params
  const item = getCaseBySlug(slug)
  if (!item) notFound()

  /* Этапы маршрута — только те, что есть в описании дела. Кейс без разделов
     (только краткий итог) показывает его как результат. */
  const labels = item.labels ?? {}
  const stages: CaseStage[] = []
  if (item.situation?.length)
    stages.push({ kind: 'situation', label: labels.situation ?? 'Фабула', paragraphs: item.situation })
  if (item.task) stages.push({ kind: 'task', label: labels.task ?? 'Задача', paragraphs: [item.task] })
  if (item.actions?.length) stages.push({ kind: 'actions', label: 'Что мы сделали', paragraphs: item.actions })
  const figure = item.amount ? { label: item.amountLabel ?? 'Сумма спора', value: item.amount } : undefined
  if (item.result?.length)
    stages.push({ kind: 'result', label: labels.result ?? 'Результат', paragraphs: item.result, figure })
  else if (item.status) stages.push({ kind: 'status', label: 'Статус', paragraphs: [item.status] })
  else if (!stages.length) stages.push({ kind: 'result', label: 'Результат', paragraphs: [item.summary] })
  /* Паспорт дела — без строки «Результат»: итог и так раскрыт ниже */
  const passport = (item.passport ?? []).filter((row) => row.label !== 'Результат')
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
          а орбиты резали абзацы «Фабулы». Точки — у краёв и только с xl: от
          1280px поля вокруг колонки 1120px не уже 80px и гарантированно пустые
          (на 1024 левая точка вставала бы на текст). --- */}
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
              className={`absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] xl:block`}
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
          {item.practiceIds?.length ? '← К практике' : '← Все кейсы'}
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

        {/* --- Паспорт дела (анкеты Максима): направление, регион, роль
            клиента — справочная строка, поэтому мелко и без акцента --- */}
        {passport.length > 0 && (
          <dl
            className="mt-10 grid gap-x-8 gap-y-5 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-3"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {passport.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-lime-ink)]">
                  {row.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-[1.55] text-[var(--color-text)] md:text-[0.95rem]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* --- «Кратко» — суть дела одним абзацем перед маршрутом --- */}
        {item.lead && (
          <p className="mt-10 max-w-[62ch] border-l-[3px] border-[var(--color-lime)] pl-6 font-heading text-lg font-semibold leading-[1.5] text-[var(--color-text)] md:mt-12 md:pl-8 md:text-[1.35rem]">
            {item.lead}
          </p>
        )}

        {/* --- Маршрут дела: фабула → задача → что сделали → результат/статус.
            У кейса «Единственное жильё» раздела «Результат» в документе нет
            (решение 26.10) — этапа тоже нет. --- */}
        <CaseRoute stages={stages} />

        {/* --- Почему кейс важен: вывод дела, лайм-линия слева.
            Отделён от «Результата» широкой паузой с затухающей лайм-чертой и
            выплывает при скролле: прежние 48px читались как продолжение той же
            панели, а не как переход к выводу. --- */}
        {item.why?.length ? (
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
            {/* Вывод дела — цитатой крупнее текста этапов и по их колонке
                (lg:ml-20 — отступ под линию маршрута) */}
            <RevealOnScroll y={30} duration={0.8} className="mt-20 md:mt-28 lg:ml-20">
              <section className="border-l-[3px] border-[var(--color-lime)] pl-6 md:pl-10">
                <SectionLabel>{labels.why ?? 'Почему этот кейс важен'}</SectionLabel>
                <div className="mt-6 flex max-w-[58ch] flex-col gap-5">
                  {item.why.map((text, i) => (
                    <p
                      key={i}
                      className="font-heading text-xl font-bold leading-[1.45] tracking-[-0.01em] text-[var(--color-text)] md:text-[1.65rem]"
                    >
                      {text}
                    </p>
                  ))}
                </div>
              </section>
            </RevealOnScroll>
          </>
        ) : null}

        {/* --- «Связанные услуги» — теги-пилюли, как у публикаций --- */}
        {item.relatedServices?.length ? (
          <section className="mt-12 lg:ml-20">
            <SectionLabel>Связанные услуги</SectionLabel>
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.relatedServices.map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm leading-snug text-[var(--color-text)]"
                >
                  {service}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
