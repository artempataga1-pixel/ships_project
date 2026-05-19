import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { GEOGRAPHY } from "@/lib/constants";

export function GeographySection() {
  return (
    <SectionWrapper id="geography" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">География</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
          Присутствие
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
        <p className="mt-6 text-white/50 text-sm max-w-md mx-auto leading-relaxed">
          Офис в Москве. Представляем интересы клиентов в судах и арбитражах 11 стран.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {GEOGRAPHY.map((geo) => (
          <div
            key={`${geo.city}-${geo.country}`}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg border transition-all duration-300 ${
              geo.isPrimary
                ? "border-gold/50 bg-gold/5 shadow-[0_0_20px_rgba(228,199,83,0.08)]"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {geo.isPrimary && (
              <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
            )}
            <div>
              <p className={`font-medium text-sm ${geo.isPrimary ? "text-gold" : "text-white"}`}>
                {geo.city}
              </p>
              <p className="text-white/40 text-xs">{geo.country}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
