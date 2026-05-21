"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TESTIMONIALS } from "@/lib/constants";

const TOTAL = TESTIMONIALS.length;
const DESKTOP_VISIBLE = 3;
const GAP = 24; // gap-6

const slideTransition = { duration: 0.45, ease: "easeInOut" as const };

const mobileVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : dir < 0 ? "100%" : 0, opacity: 0 }),
};

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
      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ border: "1px solid var(--dark-text-40)", color: "var(--dark-text-100)" }}
    >
      {children}
    </button>
  );
}

export function TestimonialsSection() {
  // Mobile
  const [mPage, setMPage] = useState(0);
  const [mDir, setMDir] = useState(0);

  // Desktop
  const [dPage, setDPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState<number | null>(null);

  const maxD = TOTAL - DESKTOP_VISIBLE;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const totalW = containerRef.current.offsetWidth;
      setCardW(Math.floor((totalW - GAP * (DESKTOP_VISIBLE - 1)) / DESKTOP_VISIBLE));
    };
    measure();
    const ro = new ResizeObserver(measure);
    const el = containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function gotoMobile(next: number) {
    setMDir(next > mPage ? 1 : -1);
    setMPage(next);
  }

  function gotoDesktop(next: number) {
    setDPage(next);
  }

  const stride = cardW !== null ? cardW + GAP : 0;

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

      {/* Мобильный слайдер */}
      <div className="md:hidden">
        <div className="flex items-center gap-3">
          <ArrowBtn onClick={() => gotoMobile(Math.max(0, mPage - 1))} disabled={mPage === 0}>
            <ChevronLeft size={18} />
          </ArrowBtn>
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence custom={mDir} mode="popLayout">
              <motion.div
                key={mPage}
                custom={mDir}
                variants={mobileVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="w-full"
              >
                <TestimonialCard t={TESTIMONIALS[mPage]} />
              </motion.div>
            </AnimatePresence>
          </div>
          <ArrowBtn
            onClick={() => gotoMobile(Math.min(TOTAL - 1, mPage + 1))}
            disabled={mPage === TOTAL - 1}
          >
            <ChevronRight size={18} />
          </ArrowBtn>
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => gotoMobile(i)}
              style={{ background: i === mPage ? "var(--dark-text-100)" : "var(--dark-text-40)" }}
              className="w-2 h-2 rounded-full"
              aria-label={`Перейти к отзыву ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Десктопный слайдер — трек */}
      <div className="hidden md:block">
        <div ref={containerRef} className="overflow-hidden">
          {cardW !== null && (
            <motion.div
              className="flex"
              style={{
                gap: GAP,
                width: TOTAL * cardW + (TOTAL - 1) * GAP,
              }}
              animate={{ x: -dPage * stride }}
              transition={slideTransition}
            >
              {TESTIMONIALS.map((t, i) => {
                const visible = i >= dPage && i < dPage + DESKTOP_VISIBLE;
                return (
                  <motion.div
                    key={t.id}
                    style={{ width: cardW, flexShrink: 0 }}
                    initial={{ opacity: i < DESKTOP_VISIBLE ? 1 : 0 }}
                    animate={{ opacity: visible ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" as const }}
                  >
                    <TestimonialCard t={t} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <ArrowBtn onClick={() => gotoDesktop(Math.max(0, dPage - 1))} disabled={dPage === 0}>
            <ChevronLeft size={18} />
          </ArrowBtn>
          {Array.from({ length: maxD + 1 }).map((_, i) => (
            <button
              key={`dp-${i}`}
              onClick={() => gotoDesktop(i)}
              style={{ background: i === dPage ? "var(--dark-text-100)" : "var(--dark-text-40)" }}
              className="w-2 h-2 rounded-full"
              aria-label={`Страница ${i + 1}`}
            />
          ))}
          <ArrowBtn onClick={() => gotoDesktop(Math.min(maxD, dPage + 1))} disabled={dPage === maxD}>
            <ChevronRight size={18} />
          </ArrowBtn>
        </div>
      </div>
    </SectionWrapper>
  );
}
