import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { PRINCIPLES } from "@/lib/constants";

export function PrinciplesSection() {
  return (
    <SectionWrapper id="principles">
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">О компании</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">
          Наши принципы
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PRINCIPLES.map((principle, idx) => (
          <div
            key={principle.id}
            className="group flex gap-6 p-8 border border-gold/25 rounded-lg shadow-[0_0_15px_rgba(228,199,83,0.06)] hover:border-gold/55 hover:shadow-[0_0_25px_rgba(228,199,83,0.18)] transition-all duration-300"
          >
            <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
              <span className="font-display text-4xl font-bold text-gold/20 leading-none select-none">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold mb-3">{principle.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
