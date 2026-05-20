import type { Case } from "@/lib/constants";

export function CaseCard({ caseItem }: { caseItem: Case }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-charcoal-soft border border-gold/25 rounded-lg shadow-[0_0_15px_rgba(228,199,83,0.06)] hover:border-gold/55 hover:shadow-[0_0_25px_rgba(228,199,83,0.18)] transition-all duration-300">
      <span className="text-xs font-medium uppercase tracking-widest text-gold">
        {caseItem.category}
      </span>
      <h3 className="font-display text-xl font-semibold text-white">{caseItem.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed flex-1">{caseItem.summary}</p>
      <div className="pt-4 border-t border-white/10 flex items-end justify-between gap-4">
        <span className="font-display text-2xl font-bold text-gold">{caseItem.amount}</span>
        <span className="text-xs text-white/40 text-right">{caseItem.result}</span>
      </div>
    </div>
  );
}
