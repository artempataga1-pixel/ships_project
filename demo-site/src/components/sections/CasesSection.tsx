import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CaseCard } from "@/components/ui/CaseCard";
import { CASES } from "@/lib/constants";

export function CasesSection() {
  return (
    <SectionWrapper id="cases" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Кейсы</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--dark-text-100)" }}>
          Реализованные дела
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
        <p className="mt-6 max-w-xl mx-auto leading-relaxed text-sm" style={{ color: "var(--dark-text-40)" }}>
          Детали и имена клиентов не раскрываются. Суммы подтверждены судебными актами.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CASES.map((caseItem) => (
          <CaseCard key={caseItem.id} caseItem={caseItem} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors"
        >
          Обсудить вашу ситуацию
          <span aria-hidden>→</span>
        </a>
      </div>
    </SectionWrapper>
  );
}
