"use client";
import { useRef } from "react";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";
import { HERO } from "@/lib/constants";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-charcoal"
    >
      {/* Параллакс-фото */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imgY }}
      >
        <Image
          src={HERO.photo}
          alt="Братья Разумовские"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      {/* Градиентный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

      {/* Контент */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Декоративная линия */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="h-px w-10 bg-gold" />
            <span className="text-gold text-xs uppercase tracking-[0.2em] font-sans">
              Братья Разумовские и Партнёры
            </span>
          </motion.div>

          {/* Слоган */}
          <motion.h1
            className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {HERO.headline}
          </motion.h1>

          {/* Подзаголовок */}
          <motion.p
            className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {HERO.subheadline}
          </motion.p>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-start gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
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
          </motion.div>
        </div>
      </div>

      {/* Стрелка вниз */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.div
          className="w-px h-12 bg-gold/40"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </section>
  );
}
