import type { Case } from "@/lib/constants";

export function CaseCard({ caseItem }: { caseItem: Case }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 sm:p-8 border border-gold/25 rounded-lg shadow-[0_0_15px_rgba(228,199,83,0.06)] hover:border-gold/55 hover:shadow-[0_0_25px_rgba(228,199,83,0.18)] transition-all duration-300"
      style={{ background: "var(--dark-card-bg)" }}
    >
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--dark-text-100)" }}>
        {caseItem.category}
      </span>
      <h3 className="font-display text-xl font-semibold" style={{ color: "var(--dark-text-100)" }}>{caseItem.title}</h3>
      <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--dark-text-100)" }}>{caseItem.summary}</p>
      <div className="pt-4 flex items-end justify-between gap-4" style={{ borderTop: "1px solid var(--dark-text-10)" }}>
        <span className="font-display text-xl sm:text-2xl font-bold" style={{ color: "var(--dark-text-100)" }}>{caseItem.amount}</span>
        <span className="text-xs text-right" style={{ color: "var(--dark-text-100)" }}>{caseItem.result}</span>
      </div>
    </div>
  );
}
