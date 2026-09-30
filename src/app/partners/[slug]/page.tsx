import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { TeamMember } from '@/types/content'
import { getPartnerBySlug, getPartnersWithProfile } from '@/lib/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { CaseBackground } from '@/components/ui/CaseBackground'
import { WordReveal } from '@/components/ui/WordReveal'
import { BlurText } from '@/components/ui/BlurText'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

/* Персональная страница партнёра. Данные — TEAM (src/constants/content/team.ts,
   поля slug + profile), шаблон один на всех партнёров: страница появляется у того,
   у кого заполнен profile. Раскладка развивает язык карточек-визиток с главной и
   страницы практики: светлый задник-видео в герое, белые панели с лаймовой
   полосой, графитовая панель для регалий и ключевой цифры. */

interface PartnerPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getPartnersWithProfile().map((partner) => ({ slug: partner.slug! }))
}

export async function generateMetadata({ params }: PartnerPageProps): Promise<Metadata> {
  const { slug } = await params
  const partner = getPartnerBySlug(slug)
  if (!partner?.profile) return {}

  return {
    title: `${partner.name} — ${partner.role} — Шумская и Партнёры`,
    description: partner.profile.lead,
  }
}

const PANEL_STYLE = {
  background: 'var(--color-surface)',
  borderColor: 'var(--color-line)',
  boxShadow: 'var(--shadow-card)',
} as const

/* Графитовая панель — тот же цвет и полоса, что у панели регалий на главной. */
const DARK_PANEL_CLASS =
  'relative overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-[#25292c] text-white shadow-[0_30px_70px_-24px_rgba(12,18,8,0.55)]'

function LimeBar({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)] ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
      style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
    />
  )
}

/* Пилюля-бейдж раздела — как бейдж практики на её странице. */
function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-3 rounded-md border px-4 py-2 font-heading text-[0.7rem] font-black uppercase tracking-[0.12em] ${
        dark
          ? 'border-white/15 bg-white/[0.06] text-white'
          : 'border-[var(--color-line)] bg-white text-[var(--color-text)]'
      }`}
    >
      {children}
      <i
        aria-hidden
        className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
      />
    </span>
  )
}

/* Заголовок карточки нижнего ряда — обычный, не пилюля: «Преподавание и
   публичная деятельность» в пилюле рвётся на две строки. */
function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-start gap-3 font-heading text-[1.15rem] font-black leading-[1.2] tracking-[-0.01em]">
      <i
        aria-hidden
        className="mt-[0.35em] block h-[9px] w-[9px] shrink-0 rounded-[2px] bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
      />
      {children}
    </h2>
  )
}

function DotList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-6 flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-3 text-[0.95rem] leading-[1.6] md:text-base ${
            dark ? 'text-white/85' : 'text-[var(--color-text)]'
          }`}
        >
          <span
            aria-hidden
            className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

/* Декор героя — орбиты и лайм-точки, как на страницах практик. Обёрнут вокруг
   героя, а не всей страницы: иначе орбиты оказались бы посреди текста. */
function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
      <div
        className="absolute left-1/2 top-1/2 h-[560px] w-[92%] max-w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border rotate-[4deg]"
        style={{ borderColor: 'rgba(168,204,51,.34)' }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[66%] max-w-[1040px] -translate-x-1/2 -translate-y-[46%] rounded-[50%] border rotate-[8deg]"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}
      />
      {['left-[4%] top-[26%]', 'right-[6%] top-[14%]', 'left-[46%] bottom-[10%]', 'right-[4%] bottom-[22%]'].map(
        (pos) => (
          <span
            key={pos}
            className={`absolute hidden ${pos} h-[10px] w-[10px] rounded-full bg-[var(--color-lime)] md:block`}
            style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
          />
        ),
      )}
    </div>
  )
}

function PartnerView({ partner }: { partner: TeamMember }) {
  const profile = partner.profile!

  return (
    <main className="relative min-h-svh bg-[var(--color-bg)]">
      <ScrollTopOnLoad />

      {/* ── Герой: имя, роль, вводный абзац + портрет ─────────────────────────
          clip-path: inset(0) — та же несущая конструкция, что у страницы
          практики: делает секцию containing block для fixed-задника, который
          стоит на месте, а текст листается поверх, и не даёт ему вылезти ниже
          героя. */}
      <section className="relative overflow-hidden" style={{ clipPath: 'inset(0)' }}>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <CaseBackground />
        </div>
        <HeroDecor />

        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-12 px-6 pb-16 pt-24 sm:px-8 md:pb-20 xl:flex-row xl:items-center xl:justify-between xl:gap-16">
          <div className="xl:max-w-[54%]">
            <Link
              href="/#partners"
              scroll={false}
              className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
            >
              ← Все партнёры
            </Link>

            <div className="mt-12 md:mt-14">
              <Eyebrow>{partner.role}</Eyebrow>
              {profile.roleNote && (
                <p className="mt-4 max-w-[36ch] text-base leading-snug text-[var(--color-muted)] md:text-lg">
                  {profile.roleNote}
                </p>
              )}
            </div>

            <WordReveal delay={0.3} waitForIntro>
              <h1 className="mt-8 max-w-[14ch] font-heading text-[clamp(2.4rem,5.4vw,4.4rem)] font-black leading-[1.02] tracking-[-0.03em] text-[var(--color-text)]">
                {partner.name}
              </h1>
            </WordReveal>

            <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-[var(--color-text)] md:text-xl md:leading-relaxed">
              {profile.lead}
            </p>
          </div>

          {/* Портрет. Готовая визитка (public/images/team) содержит имя и должность
              слева — вписываем её в вертикальную рамку и прижимаем вправо, чтобы
              остался только портрет: имя и роль на странице уже набраны текстом. */}
          <div className="w-full max-w-[440px] self-center xl:w-[38%] xl:max-w-[480px] xl:shrink-0">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border"
              style={PANEL_STYLE}
            >
              <Image
                src={partner.photo!}
                alt={`${partner.name} — ${partner.role}`}
                fill
                priority
                sizes="(min-width: 1280px) 480px, (min-width: 640px) 440px, 90vw"
                className="object-cover object-right"
              />
              <LimeBar />
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-28 md:h-36"
          style={{ background: 'linear-gradient(180deg, transparent 0%, var(--color-bg) 100%)' }}
        />
      </section>

      {/* ── Специализация + ключевая цифра ───────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-16 md:pb-24">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <RevealOnScroll y={24} duration={0.7} blur={8}>
            <div className="relative h-full overflow-hidden rounded-[var(--radius-xl)] border p-7 md:p-10" style={PANEL_STYLE}>
              <LimeBar />
              <Eyebrow>Специализация</Eyebrow>
              <div className="mt-6 flex flex-col gap-5">
                {profile.specialization.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-[1.75] text-[var(--color-text)] md:text-[1.05rem]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {profile.figure && (
            <RevealOnScroll
              delay={0.12}
              y={24}
              duration={0.7}
              blur={8}
              className={profile.figure.tail ? 'lg:self-start' : undefined}
            >
              {/* Цифра с подводкой и продолжением — цельное предложение, читается
                  подряд; без продолжения (Анна) панель тянется на высоту соседней
                  и разводит подводку и цифру по краям. */}
              <div
                className={`${DARK_PANEL_CLASS} flex flex-col p-7 md:p-10 ${
                  profile.figure.tail ? 'gap-5' : 'h-full justify-between gap-8'
                }`}
              >
                <LimeBar side="right" />
                <p className="text-[0.95rem] leading-[1.7] text-white/80 md:text-base">{profile.figure.lead}</p>
                <p
                  className="font-heading font-black leading-[1.02] tracking-[-0.03em] text-[var(--color-lime)]"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', textShadow: '0 0 40px var(--color-lime-glow)' }}
                >
                  {profile.figure.value}
                  {!profile.figure.tail && <span className="text-white/60">.</span>}
                </p>
                {profile.figure.tail && (
                  <p className="text-[0.95rem] leading-[1.7] text-white/80 md:text-base">{profile.figure.tail}</p>
                )}
              </div>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* ── Подход к работе + девиз ─────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-16 md:pb-24">
        {/* Есть девиз — слева бейдж и девиз, справа абзацы; девиза нет — бейдж над
            абзацами на всю ширину, иначе левая колонка остаётся пустой. */}
        <div
          className={
            profile.tagline ? 'grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14' : 'flex flex-col gap-8'
          }
        >
          <div className={profile.tagline ? 'lg:sticky lg:top-28 lg:self-start' : undefined}>
            <RevealOnScroll y={20} duration={0.7} blur={8}>
              <Eyebrow>{profile.approachTitle ?? 'Подход к работе'}</Eyebrow>
              {profile.tagline && (
                <p className="mt-8 max-w-[16ch] font-heading text-[clamp(1.6rem,3.2vw,2.5rem)] font-black leading-[1.1] tracking-[-0.02em] text-[var(--color-text)]">
                  {profile.tagline}
                </p>
              )}
            </RevealOnScroll>
          </div>

          <div className="flex flex-col gap-5">
            {profile.approach.map((paragraph, i) => (
              <RevealOnScroll key={paragraph} delay={i * 0.06} y={24} duration={0.7} blur={8}>
                <div className="relative overflow-hidden rounded-[var(--radius-lg)] border p-6 md:p-8" style={PANEL_STYLE}>
                  <p className="max-w-[72ch] text-base leading-[1.75] text-[var(--color-text)] md:text-[1.05rem]">{paragraph}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Образование / Преподавание / Признание ─────────────────────────── */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-20 md:pb-28">
        <div className={`grid gap-6 ${profile.teaching ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
          <RevealOnScroll y={24} duration={0.7} blur={8}>
            <div className="relative h-full overflow-hidden rounded-[var(--radius-xl)] border p-7 md:p-8" style={PANEL_STYLE}>
              <LimeBar />
              <CardTitle>Образование</CardTitle>
              <DotList items={profile.education} />
            </div>
          </RevealOnScroll>

          {profile.teaching && (
            <RevealOnScroll delay={0.08} y={24} duration={0.7} blur={8}>
              <div className="relative h-full overflow-hidden rounded-[var(--radius-xl)] border p-7 md:p-8" style={PANEL_STYLE}>
                <LimeBar />
                <CardTitle>Преподавание и публичная деятельность</CardTitle>
                <DotList items={profile.teaching} />
              </div>
            </RevealOnScroll>
          )}

          <RevealOnScroll delay={profile.teaching ? 0.16 : 0.08} y={24} duration={0.7} blur={8}>
            <div className={`${DARK_PANEL_CLASS} h-full p-7 md:p-8`}>
              <LimeBar />
              <CardTitle>Признание и рейтинги</CardTitle>
              <DotList items={profile.recognition} dark />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Обращение ───────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1120px] px-6 pb-28 md:pb-36">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border p-9 md:p-12" style={PANEL_STYLE}>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 top-[14%] h-[72%] w-[4px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 30px var(--color-lime-glow)' }}
          />
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
          <RevealOnScroll delay={0.65} y={20} duration={0.7} blur={10}>
            <Link
              href="/contacts"
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

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { slug } = await params

  const partner = getPartnerBySlug(slug)
  if (!partner) notFound()

  return <PartnerView partner={partner} />
}
