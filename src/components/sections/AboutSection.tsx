import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ABOUT } from '@/constants/content/home'

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
  /** Мобильный скраб (<1280px, MobileScrubScene) — узкий 100dvh экран без
   *  собственной прокрутки, десктопные clamp() из story-варианта туда не
   *  влезают. Урезает паддинги/кегль, только вместе с variant='story'. */
  compact?: boolean
}

export function AboutSection({ variant = 'flow', compact = false }: AboutSectionProps) {
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

      {/* Контент — ghost-panel карточка, по центру (старый декор из белых
          панелей слева — референсный фон времён редизайна, убран, карточка
          отцентрована как на мобилке) */}
      <div className="relative mx-auto flex w-full max-w-[1440px] justify-center px-6 md:px-12 lg:px-16">
        <div
          id="about-card"
          className={
            compact
              ? 'w-full max-w-[560px] rounded-[var(--radius-xl)] border p-5'
              : 'w-full max-w-[720px] rounded-[var(--radius-xl)] border p-8 md:p-12 lg:p-[min(4rem,5.5vh)]'
          }
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
            <h2
              className={
                compact
                  ? 'font-heading text-[length:clamp(1.5rem,min(7vw,4.3vh),2.5rem)] font-medium uppercase leading-[0.96] tracking-[-0.04em] [word-spacing:0.3em] text-[var(--color-text)]'
                  : 'font-heading text-[length:clamp(2.5rem,min(5vw,6.5vh),5.375rem)] font-medium uppercase leading-[0.92] tracking-[-0.045em] [word-spacing:0.4em] text-[var(--color-text)]'
              }
            >
              {ABOUT.heading}
            </h2>
          </Reveal>

          {/* Первый абзац — лид: крупнее и жирнее остальных */}
          <Reveal delay={0.1} className={compact ? 'mt-3' : 'mt-5 md:mt-[min(2rem,3.2vh)]'}>
            <p
              className={
                compact
                  ? 'font-heading text-[length:clamp(0.9rem,min(4vw,2.4vh),1.15rem)] font-extrabold leading-[1.25] tracking-[-0.015em] text-[var(--color-text)]'
                  : 'font-heading text-[length:clamp(1.1rem,min(2vw,2.6vh),1.6rem)] font-extrabold leading-[1.25] tracking-[-0.02em] text-[var(--color-text)]'
              }
            >
              {ABOUT.lead}
            </p>
          </Reveal>

          {/* Средние абзацы — обычный текст */}
          <Reveal
            delay={0.2}
            className={compact ? 'mt-2.5 space-y-2' : 'mt-4 space-y-3 md:mt-[min(1.5rem,2.4vh)] md:space-y-[min(0.9rem,1.5vh)]'}
          >
            {ABOUT.body.map((paragraph) => (
              <p
                key={paragraph}
                className={
                  compact
                    ? 'text-[length:clamp(0.7rem,min(3.1vw,1.85vh),0.88rem)] font-medium leading-[1.42] text-[var(--color-muted)]'
                    : 'text-[length:clamp(0.85rem,min(1.25vw,1.9vh),1.05rem)] font-medium leading-[1.5] text-[var(--color-muted)]'
                }
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          {/* Последний абзац — финал: акцентная лайм-линия слева, как у прежней врезки */}
          <Reveal delay={0.3} className={compact ? 'mt-2.5' : 'mt-4 md:mt-[min(1.5rem,2.4vh)]'}>
            <p
              className={
                compact
                  ? 'relative pl-3 pr-9 text-[length:clamp(0.78rem,min(3.4vw,2vh),0.95rem)] font-extrabold leading-[1.3] text-[var(--color-text)]'
                  : 'relative pl-5 font-heading text-[length:clamp(1rem,min(1.6vw,2.2vh),1.35rem)] font-extrabold leading-[1.3] tracking-[-0.015em] text-[var(--color-text)]'
              }
              style={{
                borderLeft: '3px solid var(--color-lime)',
                boxShadow: '-10px 0 24px -10px var(--color-lime-glow)',
              }}
            >
              {ABOUT.closing}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
