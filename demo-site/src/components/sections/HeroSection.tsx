import Image from "next/image";
import { HERO } from "@/lib/constants";
import { HeroSlider } from "./HeroSlider";
import { HeroScrollArrow } from "./HeroScrollArrow";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "var(--dark-section-bg)" }}
    >
      {/* Мобилка: одно статичное фото */}
      <div className="sm:hidden absolute inset-0">
        <Image
          src="/images/brothersvert.jpg"
          alt="Братья Разумовские"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Десктоп: карусель с параллакс-эффектом */}
      <div className="hidden sm:block absolute inset-0">
        <HeroSlider />
      </div>

      {/* Градиентные оверлеи */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--dark-overlay-90), var(--dark-overlay-70), var(--dark-overlay-20))" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--dark-overlay-80), transparent, transparent)" }} />

      {/* Контент — рендерится на сервере */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
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
            className="font-display text-3xl sm:text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 opacity-0"
            style={{ color: "var(--dark-text-100)", animation: "heroFadeIn 0.8s ease 0.35s both" }}
          >
            {HERO.headline}
          </h1>

          {/* Подзаголовок */}
          <p
            className="text-base sm:text-lg md:text-xl leading-relaxed mb-10 max-w-xl opacity-0"
            style={{ color: "var(--dark-text-70)", animation: "heroFadeIn 0.7s ease 0.5s both" }}
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
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gold text-gold-foreground font-semibold rounded-lg text-sm hover:bg-gold-dark transition-all duration-300 shadow-[0_4px_24px_rgba(228,199,83,0.35)] hover:shadow-[0_4px_32px_rgba(228,199,83,0.5)]"
            >
              {HERO.cta}
            </a>
            <a
              href="#cases"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-medium rounded-lg text-sm hover:border-gold hover:text-gold transition-all duration-300"
              style={{ border: "1px solid var(--dark-text-10)", color: "var(--dark-text-100)" }}
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
