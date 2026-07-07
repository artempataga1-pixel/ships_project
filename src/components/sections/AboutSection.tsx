import Image from 'next/image'
import { Award, Eye, Scale, Target } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ABOUT, STATS, VALUES } from '@/constants/content/home'
import type { ValueItem } from '@/types/content'

const VALUE_ICONS: Record<ValueItem['icon'], typeof Target> = {
  target: Target,
  eye: Eye,
  award: Award,
}

export function AboutSection() {
  return (
    <section id="about" className="relative min-h-dvh bg-black">
      {/* Блок 1: философия — маятник Ньютона на фоне, текст прижат вправо */}
      <div className="relative flex min-h-[80vh] items-start overflow-hidden pb-24 pt-28">
        <Image
          src="/images/backgrounds/about.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={100}
          className="object-cover object-left-top"
        />
        {/* Затемнение справа налево — текст читается поверх кадра на любой ширине */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/70 to-black/90" />

        <div className="relative mx-auto w-full max-w-[1440px] px-16">
          <div className="ml-auto flex w-full max-w-3xl flex-col gap-8">
            <RevealOnScroll className="self-start">
              <div className="flex items-center gap-5">
                <Scale
                  className="h-[clamp(2.5rem,3.2vw,5.5rem)] w-[clamp(2.5rem,3.2vw,5.5rem)] shrink-0 text-[var(--color-card-border)]"
                  strokeWidth={1.2}
                />
                <span className="min-w-0 font-heading text-[clamp(2.75rem,3.5vw,6rem)]/[1.05] font-extrabold uppercase text-hero-bronze md:whitespace-nowrap">
                  {ABOUT.heading}
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <p className="font-heading text-3xl font-extrabold leading-snug text-white md:text-4xl">
                {ABOUT.quoteLead}{' '}
                <span className="font-hero-italic italic text-hero-bronze">
                  {ABOUT.quoteAccent}
                </span>
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <p className="text-lg leading-relaxed text-white/60 md:text-xl">
                {ABOUT.quoteRest}
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <p className="max-w-lg text-base leading-relaxed text-white/40">
                {ABOUT.description}
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </div>

      {/* Блок 2: цифры — самый крупный визуальный акцент после hero */}
      <div className="mx-auto max-w-[1440px] px-16 py-24">
        <RevealOnScroll>
          <StatCounter items={STATS} />
        </RevealOnScroll>
      </div>

      {/* Блок 3: ценности/подход — 3 карточки с золотой обводкой на hover */}
      <div className="mx-auto max-w-[1440px] px-16 pb-32">
        <SectionHeading
          title="Наш подход"
          subtitle="Принципы, которые не меняются от дела к делу"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUES.map((value, i) => {
            const Icon = VALUE_ICONS[value.icon]
            return (
              <RevealOnScroll key={value.title} delay={i * 0.1}>
                <div
                  className="
                    group h-full rounded-lg border border-transparent bg-[#1A1A1D] p-8
                    transition-all duration-300
                    hover:-translate-y-1 hover:border-[var(--color-card-border)]/70
                    hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]
                  "
                >
                  <Icon
                    className="h-8 w-8 text-[var(--color-card-border)]"
                    strokeWidth={1.5}
                  />
                  <h3 className="mt-6 font-heading text-xl font-extrabold leading-snug text-white">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {value.description}
                  </p>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
