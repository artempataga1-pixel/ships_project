import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { PracticeItem, PracticeArea } from '@/types/content'
import { PRACTICE_AREAS } from '@/constants/content/practice'
import {
  getPracticeBySlug,
  getPracticesSorted,
  getProductsForPractice,
  getCasesForPractice,
  getArticlesForPractice,
} from '@/lib/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { ServicesAccordion } from '@/components/practice/ServicesAccordion'
import { ProductsGrid } from '@/components/practice/ProductsGrid'
import { RelatedCasesShowcase } from '@/components/practice/RelatedCasesShowcase'
import { ArticlesInsights } from '@/components/practice/ArticlesInsights'

/* ВРЕМЕННЫЙ ДУАЛИЗМ ИСТОЧНИКОВ ДАННЫХ (этап 0, пилот).

   Слаг сначала ищется в новом реестре PRACTICE_ITEMS (src/constants/content/
   practices.ts) — там пока одна практика, «Банкротство», и она рендерится по
   новому шаблону. Если слага там нет — падаем на старый PRACTICE_AREAS и старую
   вёрстку, чтобы шесть карточек главной продолжали работать как раньше.

   Старая ветка (PRACTICE_AREAS + LegacyPracticeView ниже) удаляется в шаге 1.5
   плана, когда все пять практик переедут в новый реестр, а на старые слаги
   встанут 301-редиректы. */

interface PracticePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  const slugs = new Set<string>([
    ...getPracticesSorted().map((p) => p.slug),
    ...PRACTICE_AREAS.map((p) => p.slug),
  ])
  return [...slugs].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { slug } = await params

  const practice = getPracticeBySlug(slug)
  if (practice) {
    return {
      title: `${practice.title} — Шумская и Партнёры`,
      description: practice.cardSummary,
    }
  }

  const legacy = PRACTICE_AREAS.find((p) => p.slug === slug)
  if (!legacy) return {}
  return {
    title: `${legacy.title} — Шумская и Партнёры`,
    description: legacy.summary,
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

/* Фоновый декор героя: эллиптические орбиты, лайм-точки, контурная скобка.
   Вынесен в отдельный компонент и обёрнут вокруг ГЕРОЯ, а не всей страницы:
   новая страница практики длинная, и орбиты, посчитанные от её полной высоты,
   оказались бы посреди текста. Требование заказчика — содержание приоритетнее
   декоративной графики, декор не должен спорить с текстом. */
function HeroDecor() {
  return (
    /* z-[2] — над светлой вуалью поверх видео (z-[1]), но под контентом (z-10) */
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
        style={{ borderColor: 'rgba(168,204,51,.34)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-[46%] rounded-[50%] border rotate-[8deg]"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}
      />
      {['left-[4%] top-[26%]', 'right-[6%] top-[16%]', 'left-[12%] bottom-[12%]', 'right-[9%] bottom-[18%]'].map(
        (pos) => (
          <span
            key={pos}
            aria-hidden
            /* Точки только с md: на 390–430px колонка текста занимает почти всю
               ширину, и точки ложатся прямо на строки — декор начинает спорить
               с содержанием. */
            className={`pointer-events-none absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] md:block`}
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
        ),
      )}
      <LogoOutline className="right-[2%] top-[10%]" />
    </div>
  )
}

/* Никакой вуали поверх задника: на остальных страницах сайта CaseBackground
   идёт «голым», и именно так фон выглядит фирменно — контрастные белые объёмы
   с тёплой подсветкой. Любая заливка поверх (пробовал 72% белого) убивает
   фактуру: кадр читается как белый лист, а не как живой фон. */

/* Панель контентного блока (описание практики, CTA). Плотная белая, а не
   полупрозрачная, как раньше: живое видео теперь стоит только за героем, и
   ghost-панель с backdrop-blur ниже по странице ложилась на ровный
   --color-bg — рамка почти сливалась, а размывать там было уже нечего. */
const PANEL_STYLE = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-line)',
  boxShadow: 'var(--shadow-card)',
} as const

/* Старая (одноэкранная) страница практики — фон оставлен как был. */
const LEGACY_PAGE_BACKGROUND =
  'radial-gradient(circle at 74% 30%, rgba(168,204,51,.09), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 58%,#f7f7f5 100%)'

/* ── НОВЫЙ ШАБЛОН (этап 0) ────────────────────────────────────────────── */

function PracticeView({ practice }: { practice: PracticeItem }) {
  const products = getProductsForPractice(practice.id)
  const cases = getCasesForPractice(practice.id)
  const articles = getArticlesForPractice(practice.id)

  return (
    <main className="relative min-h-svh bg-[var(--color-bg)]">
      <ScrollTopOnLoad />

      {/* ── 1–3. Герой: название, краткое позиционирующее описание, развёрнутое ── */}
      {/* clip-path: inset(0) — не декор, а несущая конструкция блока. Ненулевой
          clip-path делает секцию containing block для потомков с position:
          fixed, поэтому задник ниже закреплён на вьюпорте (стоит на месте, а
          текст листается поверх), но физически обрезан границами героя и ниже
          по странице не появляется.

          Почему задник не absolute: CaseBackground растягивает кадр на всю
          высоту контейнера, а страница практики ~4800px — object-cover
          размазывал бы один кадр по всей длине, и фон превращался в ровное
          серое полотно.

          На <1024px CaseBackground сам отдаёт постер вместо видео — на мобиле
          задник статичный, это его штатное поведение. */}
      <section className="relative overflow-hidden" style={{ clipPath: 'inset(0)' }}>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <CaseBackground />
        </div>
        <HeroDecor />

        {/* Раскладка героя — две колонки, разведённые по краям экрана.
            Контейнер повторяет шапку сайта (max-w-[1440px] + px-8), а не
            прежние 1120px: заголовок практики встаёт ровно под логотипом, а
            панель с развёрнутым описанием — под кнопкой «Связаться». Меньший
            контейнер уводил обе колонки к центру, и «левый край» переставал
            читаться левым краем.
            Кегли текста при переезде не менялись — только ширина колонки. */}
        {/* Две колонки включаются с xl (1280), а не с lg (1024): на планшете в
            альбомной ориентации 1024px колонка заголовка ужимается настолько,
            что название практики рвётся на шесть строк, а панель встаёт узким
            столбиком. До xl обе колонки идут друг под другом. */}
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 px-6 pb-16 pt-36 sm:px-8 md:pb-20 md:pt-44 xl:flex-row xl:items-start xl:justify-between xl:gap-14">
          {/* ── Левая колонка: возврат, бейдж, название, краткое описание ── */}
          <div className="xl:max-w-[53%] xl:shrink">
            {/* ЭТАП 0: возврат ведёт на раздел «Практики» целиком, а не на карточку.
                Карточки главной пока живут на старых слагах (practice-bankruptcy
                и т.д.) — якоря #practice-bankrotstvo на главной ещё нет, и переход
                по нему просто оставлял пользователя в самом верху страницы.
                ШАГ 1.6: когда коллаж переедет на новые слаги, вернуть
                href={`/#practice-${practice.slug}`} — точный возврат к карточке.

                scroll={false} — свой скролл делает HomeAnchorScroll на главной
                (с повторными попытками, пока раскладка не устаканится); встроенный
                hash-scroll Next.js делает это одним ранним прыжком и гонится с ним,
                из-за чего страница иногда оставалась в самом верху. */}
            <Link
              href="/#practices"
              scroll={false}
              className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
            >
              ← Все практики
            </Link>

            <div className="mt-12 flex flex-wrap items-center gap-4 md:mt-14">
              <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
                {practice.label}
                <i
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                />
              </span>
            </div>

            {/* 1. Название практики */}
            <h1 className="mt-8 max-w-[20ch] font-heading text-[clamp(2rem,4.6vw,3.5rem)] font-black leading-[1.04] tracking-[-0.03em] text-[var(--color-text)]">
              {practice.title}
            </h1>

            {/* 2. Краткое позиционирующее описание */}
            <p className="mt-8 max-w-[58ch] text-lg leading-relaxed text-[var(--color-text)] md:text-xl md:leading-relaxed">
              {practice.cardSummary}
            </p>
          </div>

          {/* ── Правая колонка: 3. развёрнутое описание практики ──────────────
              Раньше жило отдельной секцией под героем во всю ширину 1120px.
              Перенесено внутрь героя и прижато к правому краю: описание и
              название читаются одним экраном, а живой задник остаётся виден
              в просвете между колонками. */}
          <div className="w-full xl:w-[42%] xl:max-w-[560px] xl:shrink-0">
            <div
              className="relative overflow-hidden rounded-[var(--radius-xl)] border p-7 md:p-9"
              style={PANEL_STYLE}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)]"
                style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
              />
              <div className="flex flex-col gap-5">
                {practice.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[0.95rem] leading-[1.7] text-[var(--color-text)] md:text-base md:leading-[1.72]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Растворение низа героя в фон страницы: без него граница обреза
            задника читается ровной линейкой поперёк экрана. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 md:h-36"
          style={{ background: 'linear-gradient(180deg, transparent 0%, var(--color-bg) 100%)' }}
        />
      </section>

      {/* 4. Что мы делаем.
          Заголовки этого и следующих блоков живут внутри самих компонентов —
          в новых раскладках они центрированы, идут в паре с бейджем или
          вынесены в колонку рядом с лидом, и снаружи их уже не собрать. */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-20 md:pb-28">
        <ServicesAccordion groups={practice.serviceGroups} />
      </section>

      {/* 5. Продукты */}
      {products.length > 0 && (
        <section className="relative mx-auto max-w-[1120px] px-6 pb-20 md:pb-28">
          <ProductsGrid products={products} practiceSlug={practice.slug} />
        </section>
      )}

      {/* 6. Связанные кейсы — единственный блок во всю ширину экрана: у него
          собственная заливка фона, и в колонке 1120px она читалась бы
          случайной серой плашкой посреди страницы. */}
      <div className="relative pb-20 md:pb-28">
        <RelatedCasesShowcase cases={cases} />
      </div>

      {/* 7. Публикации и аналитика */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-20 md:pb-28">
        <ArticlesInsights articles={articles} />
      </section>

      {/* 8. Кнопка обращения */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-28 md:pb-36">
        <div
          className="relative overflow-hidden rounded-[var(--radius-xl)] border p-9 md:p-12"
          style={PANEL_STYLE}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[14%] h-[72%] w-[4px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 30px var(--color-lime-glow)' }}
          />
          <h2 className="max-w-[24ch] font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-black leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]">
            Обсудим вашу задачу
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Опишите ситуацию — оценим риски и предложим порядок действий.
          </p>
          {/* Обычный <a>, не next/link: нужна полная загрузка главной, чтобы
              отработала ветка «переход с якорем» в HomeAnchorScroll и чтобы
              ContactsSection прочитал ?practice= при монтировании. */}
          <a
            href={`/?practice=${practice.slug}#contacts`}
            className="btn-lime-fill btn-lime-breathe mt-9 inline-flex h-12 items-center justify-center rounded-md px-7 text-sm font-semibold"
          >
            Обсудить задачу
          </a>
        </div>
      </section>
    </main>
  )
}

/* ── СТАРЫЙ ШАБЛОН — удаляется в шаге 1.5 вместе с PRACTICE_AREAS ─────────
   Ниже — прежняя вёрстка страницы практики без изменений: пока главная
   отдаёт шесть старых карточек, их страницы должны открываться как раньше. */

function LegacyPracticeView({ item }: { item: PracticeArea }) {
  // Портретные кадры (10/13, 9/16) при полной ширине колонки выше левого
  // текстового блока и утягивают «Результат» вниз — им нужна явная (не max-)
  // высота, чтобы aspect-ratio считал ширину от неё, а не наоборот. Альбомные
  // кадры (3/2, 4/3) уже вписываются в колонку по высоте — их не трогаем.
  const [ratioW, ratioH] = item.imageRatio.split('/').map(Number)
  const isPortraitImage = ratioW < ratioH

  return (
    <main
      className="relative min-h-svh lg:min-h-dvh overflow-hidden bg-[var(--color-bg)]"
      style={{ background: LEGACY_PAGE_BACKGROUND }}
    >
      <ScrollTopOnLoad />
      <CaseBackground />
      {/* --- Фоновый декор: эллиптические орбиты + лайм-точки + контурная скобка --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[560px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
        style={{ borderColor: 'rgba(168,204,51,.34)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[8deg]"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}
      />
      {[
        'left-[8%] top-[30%]',
        'right-[10%] top-[20%]',
        'left-[16%] bottom-[16%]',
        'right-[13%] bottom-[24%]',
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`pointer-events-none absolute ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]`}
          style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
        />
      ))}
      <LogoOutline className="right-[6%] top-[16%]" />

      <div className="relative z-10 mx-auto max-w-[1120px] px-6 pb-28 pt-36 md:pt-44">
        {/* Возврат ровно к карточке этой практики в горизонтальном коллаже.
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow. */}
        {/* scroll={false} — свой скролл к карточке делает HomeAnchorScroll на
            главной (с повторными попытками, пока раскладка не устаканится);
            встроенный hash-scroll Next.js делает это одним ранним прыжком и
            гонится с ним, из-за чего страница иногда оставалась в самом верху. */}
        <Link
          href={`/#practice-${item.slug}`}
          scroll={false}
          className="btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          ← Все практики
        </Link>

        {/* --- Герой: слева мета+заголовок, справа фото практики --- */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Левая колонка */}
          <div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Плашка направления — пилюля с лайм-квадратиком (как в архиве) */}
              <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
                {item.label}
                <i
                  aria-hidden
                  className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
                  style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
                />
              </span>
            </div>

            <h1 className="mt-8 font-heading text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.03] tracking-[-0.03em] text-[var(--color-text)]">
              {item.title}
            </h1>

            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              {item.desc}
            </p>
          </div>

          {/* Правая колонка — фото практики в рамке с лайм-полосой.
              aspect повторяет реальную пропорцию снимка (imageRatio), иначе
              object-cover обрезает портретные кадры (corporate-law, criminal-defense).
              Портретным кадрам вдобавок задаём явную высоту (свою на мобиле и
              на lg) — иначе при полной ширине колонки/экрана они значительно
              выше левого текста и утягивают «Результат» вниз; justify-self-center
              снимает grid-stretch на всех брейкпоинтах (grid остаётся
              однoколоночным и на мобиле), чтобы ширина посчиталась из
              aspect-ratio и явной высоты, а не наоборот. */}
          <div
            className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] ${isPortraitImage ? 'h-[320px] justify-self-center lg:h-[420px]' : ''}`}
            style={{ aspectRatio: item.imageRatio, boxShadow: 'var(--shadow-card)' }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 1023px) 92vw, 44vw"
              className="object-cover"
            />
            {/* Лайм-полоса у правого края + glow — тот же паттерн, что у панели кейса */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-[10%] h-[80%] w-[5px] bg-[var(--color-lime)]"
              style={{ boxShadow: '0 0 34px var(--color-lime-glow)' }}
            />
          </div>
        </div>

        {/* --- Результат: ghost-panel с лайм-полосой слева (паттерн из About) --- */}
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
            Результат
          </p>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--color-text)] md:text-xl">
            {item.summary}
          </p>
        </div>

        {/* CTA под рамкой результата — обычный <a>, не next/link: переход на
            главную с якорем на блок контактов. handleStoryAwareAnchorClick
            здесь не нужен — story-режим есть только на главной (см. отчёт
            исследования компонента Header). .btn-lime-breathe добавляет
            пульсацию свечения в покое поверх .btn-lime-fill. */}
        <a
          href="/#contacts"
          className="btn-lime-fill btn-lime-breathe mt-8 inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          Оставить заявку
        </a>
      </div>
    </main>
  )
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { slug } = await params

  const practice = getPracticeBySlug(slug)
  if (practice) return <PracticeView practice={practice} />

  const legacy = PRACTICE_AREAS.find((p) => p.slug === slug)
  if (!legacy) notFound()

  return <LegacyPracticeView item={legacy} />
}
