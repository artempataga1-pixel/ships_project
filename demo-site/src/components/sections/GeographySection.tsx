import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";

export function GeographySection() {
  return (
    <SectionWrapper id="geography" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">География</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
          Присутствие
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 border border-gold/50 bg-gold/5 rounded-xl px-8 py-5 shadow-[0_0_20px_rgba(228,199,83,0.08)]">
          <span className="w-3 h-3 rounded-full bg-gold shrink-0" />
          <div>
            <p className="font-display text-lg font-semibold text-gold">Москва</p>
            <p className="text-white/50 text-xs mt-0.5">Основной офис</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-white/15 rounded-xl px-8 py-5 text-center sm:text-left">
          <p className="text-white/60 text-sm leading-relaxed">
            Дела и переговоры ведём из любой точки мира
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
