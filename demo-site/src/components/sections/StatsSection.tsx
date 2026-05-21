import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { StatCounter } from "@/components/ui/StatCounter";
import { STATS } from "@/lib/constants";

export function StatsSection() {
  return (
    <SectionWrapper id="stats" className="py-20">
      <div className="text-center mb-12">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Результаты</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
          Факты говорят сами за себя
        </h2>
      </div>

      {/* Блок со статистикой в золотой рамке */}
      <div className="border border-gold/30 rounded-xl p-6 md:p-14 shadow-[0_0_60px_rgba(228,199,83,0.05)]" style={{ background: "var(--card-bg)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6">
          {STATS.map((stat) => (
            <StatCounter
              key={stat.id}
              value={stat.value}
              suffix={stat.suffix}
              unit={stat.unit}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
