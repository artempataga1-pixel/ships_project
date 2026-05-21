import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TESTIMONIALS } from "@/lib/constants";

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Отзывы</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--dark-text-100)" }}>
          Говорят клиенты
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 rounded-lg hover:border-gold/20 transition-all duration-300"
            style={{ background: "var(--dark-card-bg)", border: "1px solid var(--dark-text-10)" }}
          >
            {/* Кавычки */}
            <div className="text-gold/30 font-display text-5xl leading-none select-none">&ldquo;</div>

            <p className="text-sm leading-relaxed flex-1 -mt-4" style={{ color: "var(--dark-text-80)" }}>{t.text}</p>

            <div className="pt-4" style={{ borderTop: "1px solid var(--dark-text-10)" }}>
              <p className="font-medium text-sm" style={{ color: "var(--dark-text-100)" }}>{t.author}</p>
              <p className="text-xs mt-1" style={{ color: "var(--dark-text-40)" }}>{t.region}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
