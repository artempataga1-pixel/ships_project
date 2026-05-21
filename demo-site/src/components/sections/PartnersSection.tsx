import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { PartnersTabs } from "./PartnersTabs";

export function PartnersSection() {
  return (
    <SectionWrapper id="partners" dark>
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Команда</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5">
          Братья Разумовские
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      {/* Интерактивные табы — client leaf */}
      <PartnersTabs />
    </SectionWrapper>
  );
}
