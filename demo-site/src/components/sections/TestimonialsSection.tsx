"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TESTIMONIALS } from "@/lib/constants";

const TOTAL = TESTIMONIALS.length;
const DESKTOP_VISIBLE = 3;

function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div
      className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 rounded-lg h-full"
      style={{ background: "var(--dark-card-bg)", border: "1px solid var(--dark-text-10)" }}
    >
      <div className="font-display text-5xl leading-none select-none" style={{ color: "var(--quote-color)" }}>
        &ldquo;
      </div>
      <p className="text-sm leading-relaxed flex-1 -mt-4" style={{ color: "var(--dark-text-100)" }}>
        {t.text}
      </p>
      <div className="pt-4" style={{ borderTop: "1px solid var(--dark-text-10)" }}>
        <p className="font-medium text-sm" style={{ color: "var(--dark-text-100)" }}>{t.author}</p>
        <p className="text-xs mt-1" style={{ color: "var(--dark-text-70)" }}>{t.region}</p>
      </div>
    </div>
  );
}

function ArrowBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-gold/50 hover:border-gold text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function TestimonialsSection() {
  const [mPage, setMPage] = useState(0);
  const [dPage, setDPage] = useState(0);
  const maxD = TOTAL - DESKTOP_VISIBLE;

  return (
    <SectionWrapper id="testimonials" dark>
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--dark-text-100)" }}>
          Отзывы
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5"
          style={{ color: "var(--dark-text-100)" }}
        >
          Говорят клиенты
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      {/* Мобильный слайдер (1 карточка) */}
      <div className="md:hidden">
        <div className="flex items-center gap-3">
          <ArrowBtn onClick={() => setMPage((p) => Math.max(0, p - 1))} disabled={mPage === 0}>
            <ChevronLeft size={18} />
          </ArrowBtn>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <TestimonialCard t={TESTIMONIALS[mPage]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <ArrowBtn
            onClick={() => setMPage((p) => Math.min(TOTAL - 1, p + 1))}
            disabled={mPage === TOTAL - 1}
          >
            <ChevronRight size={18} />
          </ArrowBtn>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setMPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === mPage ? "bg-gold" : "bg-gold/30"}`}
              aria-label={`Перейти к отзыву ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Десктопный слайдер (3 карточки) */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          <motion.div
            key={dPage}
            className="grid grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {TESTIMONIALS.slice(dPage, dPage + DESKTOP_VISIBLE).map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-center gap-3 mt-8">
          <ArrowBtn onClick={() => setDPage((p) => Math.max(0, p - 1))} disabled={dPage === 0}>
            <ChevronLeft size={18} />
          </ArrowBtn>
          {Array.from({ length: maxD + 1 }).map((_, i) => (
            <button
              key={`dp-${i}`}
              onClick={() => setDPage(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === dPage ? "bg-gold" : "bg-gold/30"}`}
              aria-label={`Страница ${i + 1}`}
            />
          ))}
          <ArrowBtn onClick={() => setDPage((p) => Math.min(maxD, p + 1))} disabled={dPage === maxD}>
            <ChevronRight size={18} />
          </ArrowBtn>
        </div>
      </div>
    </SectionWrapper>
  );
}
