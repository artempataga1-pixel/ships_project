import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { SERVICES } from "@/lib/constants";

export function ServicesSection() {
  return (
    <SectionWrapper id="services">
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Практика</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
          Области специализации
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Работаем с делами, в которых цена ошибки — бизнес, репутация или свобода.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors font-medium"
        >
          Обсудить вашу задачу
          <span aria-hidden>→</span>
        </a>
      </div>
    </SectionWrapper>
  );
}
