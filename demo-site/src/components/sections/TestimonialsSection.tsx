import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TESTIMONIALS } from "@/lib/constants";

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Отзывы</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
          Говорят клиенты
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="flex flex-col gap-6 p-8 border border-white/10 rounded-lg hover:border-gold/20 transition-all duration-300 bg-charcoal-soft"
          >
            {/* Кавычки */}
            <div className="text-gold/30 font-display text-5xl leading-none select-none">&ldquo;</div>

            <p className="text-white/80 text-sm leading-relaxed flex-1 -mt-4">{t.text}</p>

            <div className="pt-4 border-t border-white/10">
              <p className="text-white font-medium text-sm">{t.author}</p>
              <p className="text-white/40 text-xs mt-1">{t.region}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
