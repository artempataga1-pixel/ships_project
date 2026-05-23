import { Scale, Shield, Globe, Calculator, Building2, Lock } from "lucide-react";
import type { Service } from "@/lib/constants";

const ICONS = {
  scale: Scale,
  shield: Shield,
  globe: Globe,
  calculator: Calculator,
  building: Building2,
  lock: Lock,
} as const;

export function ServiceCard({ service }: { service: Service }) {
  const Icon = ICONS[service.icon as keyof typeof ICONS];

  return (
    <div className="service-card group p-6 sm:p-8 rounded-lg transition-all duration-300" style={{ background: "var(--card-bg)", border: "1px solid var(--service-card-border)", boxShadow: "var(--service-card-shadow)" }}>
      <div className="w-12 h-12 flex items-center justify-center rounded-full mb-6 transition-colors" style={{ background: "var(--dark-text-10)" }}>
        {Icon && <Icon size={22} style={{ color: "var(--card-accent)" }} />}
      </div>
      <h3 className="font-display text-xl font-semibold mb-3" style={{ color: "var(--card-accent)" }}>{service.title}</h3>
      <p className="leading-relaxed text-sm" style={{ color: "var(--dark-text-100)" }}>{service.description}</p>
    </div>
  );
}
