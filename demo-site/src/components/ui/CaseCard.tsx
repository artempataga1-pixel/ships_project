import type { Case } from "@/lib/constants";

export function CaseCard({ caseItem }: { caseItem: Case }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 sm:p-8 rounded-lg transition-all duration-300"
      style={{ background: "var(--dark-card-bg)", border: "1px solid var(--case-card-border)", boxShadow: "var(--case-card-shadow)" }}
    >
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--dark-text-100)" }}>
        {caseItem.category}
      </span>
      <h3 className="font-display text-xl font-semibold" style={{ color: "var(--card-accent)" }}>{caseItem.title}</h3>
      <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--dark-text-100)" }}>{caseItem.summary}</p>
      <div className="pt-4 flex items-end justify-between gap-4" style={{ borderTop: "1px solid var(--dark-text-10)" }}>
        <span className="font-display text-xl sm:text-2xl font-bold whitespace-nowrap" style={{ color: "var(--dark-text-100)" }}>{caseItem.amount}</span>
        <span className="text-xs text-right" style={{ color: "var(--dark-text-100)" }}>{caseItem.result}</span>
      </div>
    </div>
  );
}
