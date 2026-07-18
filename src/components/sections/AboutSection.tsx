import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ABOUT } from '@/constants/content/home'

/* Белые панели убывающей высоты со skew и лайм-торцом справа — тот же паттерн
   сцены, что в Hero/референс-коде 01_about_company (.bars-scene/.bar). Значения
   позиций/высот перенесены из демки дизайнера, декор — скрыт на мобиле. */
const BARS = [
  { left: 70, height: 148, opacity: 0.44 },
  { left: 150, height: 214, opacity: 0.5 },
  { left: 240, height: 298, opacity: 0.58 },
  { left: 345, height: 405, opacity: 0.66 },
  { left: 485, height: 545, opacity: 0.82 },
]

/* Passthrough вместо RevealOnScroll в story-режиме: внутри скролл-стори
   появлением секции рулит таймлайн (opacity оверлея), собственный reveal по
   вьюпорту здесь только мешал бы (sticky-контейнер ломает его триггер). */
function Passthrough({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return <div className={className}>{children}</div>
}

interface AboutSectionProps {
  /** 'flow' — обычная секция потока; 'story' — оверлей внутри ScrollStory. */
  variant?: 'flow' | 'story'
}

export function AboutSection({ variant = 'flow' }: AboutSectionProps) {
  const isStory = variant === 'story'
  const Reveal = isStory ? Passthrough : RevealOnScroll

  return (
    <section
      // id несёт сама секция только в потоке; в story якорь — отдельная метка
      // внутри ScrollStory (иначе дубль id на всегда-смонтированном оверлее)
      {...(!isStory && { id: 'about' })}
      className={
        isStory
          ? 'relative flex h-full w-full items-center overflow-hidden'
          : 'relative flex min-h-svh scroll-mt-16 items-center overflow-hidden bg-[var(--color-bg)] py-24 lg:min-h-dvh'
      }
    >
      {/* Фон-декор. В потоке — светлый градиент секции + лайм-glow. В story
          оставляем только прозрачный радиальный glow, чтобы под оверлеем был
          виден замерший кадр видео (непрозрачный градиент его бы скрыл). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={
          isStory
            ? {
                background:
                  'radial-gradient(circle at 30% 45%, var(--color-lime-soft), transparent 30%)',
                opacity: 0.5,
              }
            : {
                background:
                  'radial-gradient(circle at 30% 45%, var(--color-lime-soft), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
                opacity: 0.6,
              }
        }
      />

      {/* Сцена из белых панелей с орбитами и точками — декоративная, слева.
          В story её роль играют реальные панели из видео → CSS-декор не рендерим. */}
      {!isStory && (
      <div
        aria-hidden
        className="pointer-events-none absolute left-[3%] top-1/2 hidden h-[720px] w-[760px] -translate-y-1/2 lg:block"
      >
        {/* линия-пол */}
        <div
          className="absolute bottom-[150px] left-0 right-[-90px] h-px"
          style={{
            background:
              'linear-gradient(90deg,transparent,rgba(0,0,0,.09),transparent)',
          }}
        />
        {/* орбиты */}
        <div
          className="absolute left-[-20px] top-[35px] h-[575px] w-[675px] rounded-full border"
          style={{ borderColor: 'var(--color-lime-soft)', transform: 'rotate(-28deg)' }}
        />
        <div
          className="absolute left-[65px] top-[65px] h-[460px] w-[540px] rounded-full border"
          style={{ borderColor: 'rgba(0,0,0,.08)', transform: 'rotate(-25deg)' }}
        />
        {/* панели */}
        {BARS.map((bar) => (
          <span
            key={bar.left}
            className="absolute bottom-[145px] w-[74px]"
            style={{
              left: bar.left,
              height: bar.height,
              opacity: bar.opacity,
              transform: 'skewY(-7deg)',
              background: 'linear-gradient(90deg,#f7f7f5,#fff 50%,#e8e8e6)',
              boxShadow:
                '22px 34px 42px rgba(0,0,0,.08),inset -3px 0 8px rgba(0,0,0,.08)',
            }}
          >
            {/* лайм-торец справа */}
            <span
              className="absolute right-[-7px] top-0 h-full w-[7px]"
              style={{
                background:
                  'linear-gradient(180deg,var(--color-lime),var(--color-lime-soft))',
                filter: 'drop-shadow(0 0 18px var(--color-lime-glow))',
              }}
            />
          </span>
        ))}
        {/* точки */}
        {[
          { left: 546, top: 54 },
          { left: 632, top: 234 },
          { left: 570, top: 610 },
        ].map((dot) => (
          <span
            key={`${dot.left}-${dot.top}`}
            className="absolute h-[10px] w-[10px] rounded-full"
            style={{
              left: dot.left,
              top: dot.top,
              background: 'var(--color-lime)',
              boxShadow: '0 0 20px var(--color-lime-glow)',
            }}
          />
        ))}
      </div>
      )}

      {/* Контент — ghost-panel карточка, прижата вправо */}
      <div
        className={`relative mx-auto flex w-full max-w-[1440px] px-6 md:px-12 lg:px-16 ${
          isStory ? 'justify-center' : 'justify-end'
        }`}
      >
        <div
          className="w-full max-w-[720px] rounded-[var(--radius-xl)] border p-8 md:p-12 lg:p-16"
          style={{
            // В story панель чуть плотнее — над видео контент должен читаться
            background: isStory ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.64)',
            borderColor: 'rgba(255,255,255,.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,.95),0 30px 90px rgba(0,0,0,.04)',
          }}
        >
          <Reveal>
            <h2 className="font-heading text-[clamp(2.5rem,5vw,5.375rem)] font-medium uppercase leading-[0.92] tracking-[-0.045em] [word-spacing:0.4em] text-[var(--color-text)]">
              {ABOUT.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 md:mt-14">
            <p className="font-heading text-[clamp(1.6rem,2.6vw,2.375rem)] leading-[1.18] tracking-[-0.03em]">
              <strong className="font-extrabold text-[var(--color-text)]">
                {ABOUT.quoteLead}
              </strong>
              <br />
              <span className="font-semibold text-[var(--color-muted)]">
                {ABOUT.quoteAccent}
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.2} className="mt-10 md:mt-14">
            <p className="text-lg font-semibold leading-[1.62] text-[var(--color-text)] md:text-xl">
              {ABOUT.quoteRest}
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-8">
            <p
              className="relative pl-6 text-base font-medium leading-[1.6] text-[var(--color-muted)] md:text-lg"
              style={{
                borderLeft: '3px solid var(--color-lime)',
                boxShadow: '-10px 0 24px -10px var(--color-lime-glow)',
              }}
            >
              {ABOUT.description}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
