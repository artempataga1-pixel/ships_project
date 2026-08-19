import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Practice } from '@/types/content'
import {
  getPracticeBySlug,
  getPracticesSorted,
  getProductsForPractice,
  getCasesForPractice,
  getArticlesForPractice,
} from '@/lib/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { WordReveal } from '@/components/ui/WordReveal'
import { Typewriter } from '@/components/ui/Typewriter'
import { BlurText } from '@/components/ui/BlurText'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ServicesAccordion } from '@/components/practice/ServicesAccordion'
import { ProductsGrid } from '@/components/practice/ProductsGrid'
import { RelatedCasesShowcase } from '@/components/practice/RelatedCasesShowcase'
import { ArticlesInsights } from '@/components/practice/ArticlesInsights'

/* ЕДИНСТВЕННЫЙ ИСТОЧНИК ДАННЫХ — реестр PRACTICE_ITEMS (src/constants/content/
   practices.ts), пять практик заказчика.

   Шаг 1.5 убрал временный дуализм этапа 0: старый PRACTICE_AREAS и вёрстка
   LegacyPracticeView удалены, на шесть старых слагов встали 301-редиректы
   в next.config.ts. Слаг, которого нет в реестре, отдаёт 404. */

interface PracticePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPracticesSorted().map((practice) => ({ slug: practice.slug }))
}

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { slug } = await params

  const practice = getPracticeBySlug(slug)
  if (!practice) return {}

  return {
    title: `${practice.title} — Шумская и Партнёры`,
    description: practice.cardSummary,
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

/* ── ШАБЛОН СТРАНИЦЫ ПРАКТИКИ ─────────────────────────────────────────── */

function PracticeView({ practice }: { practice: Practice }) {
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
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 px-6 pb-16 pt-24 sm:px-8 md:pb-20 md:pt-24 xl:flex-row xl:items-start xl:justify-between xl:gap-14">
          {/* ── Левая колонка: возврат, бейдж, название, краткое описание ── */}
          <div className="xl:max-w-[53%] xl:shrink">
            {/* Возврат приземляет ровно на карточку этой практики: с шага 1.6
                коллаж на главной живёт на тех же слагах и держит якоря
                id="practice-<slug>".

                scroll={false} — свой скролл делает HomeAnchorScroll на главной
                (с повторными попытками, пока раскладка не устаканится); встроенный
                hash-scroll Next.js делает это одним ранним прыжком и гонится с ним,
                из-за чего страница иногда оставалась в самом верху. */}
            <Link
              href={`/#practice-${practice.slug}`}
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

            {/* 1. Название практики.
                Пословный выезд из-под маски (WordReveal) — перенос анимации
                wordReveal из референса героя: слова выталкиваются снизу с
                лёгким размытием, шаг 0.1с. */}
            {/* waitForIntro — герой стоит под оверлеем лого-интро (~3с при
                прямом заходе на страницу); без ожидания вся анимация проходила
                бы за закрытым занавесом. */}
            <WordReveal delay={0.3} waitForIntro>
              <h1 className="mt-8 max-w-[20ch] font-heading text-[clamp(2rem,4.6vw,3.5rem)] font-black leading-[1.04] tracking-[-0.03em] text-[var(--color-text)]">
                {practice.title}
              </h1>
            </WordReveal>

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
              {/* Развёрнутое описание печатается посимвольно (Typewriter из
                  референса карусели отзывов). Один Typewriter на все абзацы, а
                  не на каждый: иначе три текста стартовали бы одновременно и
                  печатались бы наперегонки. Общая длительность ограничена
                  двумя секундами — при жёстком шаге 0.012с описание в 900
                  знаков доезжало бы одиннадцать. */}
              <Typewriter delay={0.35} speed={0.012} maxDuration={2} waitForIntro>
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
              </Typewriter>
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
          {/* Появление блока — перенос hero-сюжета из референса: заголовок
              проступает пословно через две ступени размытия (BlurText), под ним
              подпись и кнопка выходят тем же приёмом blur(10px)+y, но целиком и
              с нарастающей задержкой. Задержки сжаты против референса (там
              0.8/1.1с от загрузки страницы): здесь отсчёт идёт от момента,
              когда блок вошёл во вьюпорт, и секундная пауза читалась бы
              зависанием. */}
          <BlurText delay={0.1}>
            <h2 className="max-w-[24ch] font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-black leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]">
              Обсудим вашу задачу
            </h2>
          </BlurText>
          <RevealOnScroll delay={0.45} y={20} duration={0.7} blur={10}>
            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
              Опишите ситуацию — оценим риски и предложим порядок действий.
            </p>
          </RevealOnScroll>
          {/* Ведём на отдельную страницу /contacts, а не на /?practice=…#contacts.
              Прежний адрес означал полную загрузку главной: 9 511 КБ трафика
              (9 423 КБ — ролики сторибука), интро, пересборка пинов и только
              потом доводка скролла на 14 438 px вниз — ради формы на пять полей.
              next/link, а не <a>: страница лёгкая, клиентский переход мгновенный.
              Направление предзаполняется на сервере (см. app/contacts/page.tsx). */}
          <RevealOnScroll delay={0.65} y={20} duration={0.7} blur={10}>
            <Link
              href={`/contacts?practice=${practice.slug}`}
              className="btn-lime-fill btn-lime-breathe mt-9 inline-flex h-12 items-center justify-center rounded-md px-7 text-sm font-semibold"
            >
              Обсудить задачу
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  )
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { slug } = await params

  const practice = getPracticeBySlug(slug)
  if (!practice) notFound()

  return <PracticeView practice={practice} />
}
