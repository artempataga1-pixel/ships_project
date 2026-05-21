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
    <div className="group p-6 sm:p-8 border border-border rounded-lg hover:border-gold/40 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(228,199,83,0.08)]">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gold-muted mb-6 group-hover:bg-[rgba(228,199,83,0.12)] transition-colors">
        {Icon && <Icon size={22} className="text-gold" />}
      </div>
      <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
    </div>
  );
}
