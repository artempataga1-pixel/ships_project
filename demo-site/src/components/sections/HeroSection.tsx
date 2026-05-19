import { HERO } from "@/lib/constants";
import { HeroParallax } from "./HeroParallax";
import { HeroScrollArrow } from "./HeroScrollArrow";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-charcoal"
    >
      {/* Параллакс-фото — client leaf */}
      <HeroParallax />

      {/* Градиентные оверлеи — статичные */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

      {/* Контент — рендерится на сервере */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Декоративная линия */}
          <div
            className="flex items-center gap-3 mb-8 opacity-0"
            style={{ animation: "heroFadeIn 0.7s ease 0.2s both" }}
          >
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs uppercase tracking-[0.2em] font-sans">
              Братья Разумовские и Партнёры
            </span>
          </div>

          {/* Слоган */}
          <h1
            className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 opacity-0"
            style={{ animation: "heroFadeIn 0.8s ease 0.35s both" }}
          >
            {HERO.headline}
          </h1>

          {/* Подзаголовок */}
          <p
            className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl opacity-0"
            style={{ animation: "heroFadeIn 0.7s ease 0.5s both" }}
          >
            {HERO.subheadline}
          </p>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-start gap-4 opacity-0"
            style={{ animation: "heroFadeIn 0.7s ease 0.65s both" }}
          >
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-gold-foreground font-semibold rounded-lg text-sm hover:bg-gold-dark transition-all duration-300 shadow-[0_4px_24px_rgba(228,199,83,0.35)] hover:shadow-[0_4px_32px_rgba(228,199,83,0.5)]"
            >
              {HERO.cta}
            </a>
            <a
              href="#cases"
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-lg text-sm hover:border-gold hover:text-gold transition-all duration-300"
            >
              Наши кейсы
            </a>
          </div>
        </div>
      </div>

      {/* Анимированная стрелка — client leaf */}
      <HeroScrollArrow />
    </section>
  );
}
