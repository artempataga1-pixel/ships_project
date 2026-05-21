import { HeroSection } from "@/components/sections/HeroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { HowWeWorkSection } from "@/components/sections/HowWeWorkSection";
import { CasesSection } from "@/components/sections/CasesSection";
import { PrinciplesSection } from "@/components/sections/PrinciplesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PartnersSection />
      <StatsSection />
      <ServicesSection />
      <HowWeWorkSection />
      <CasesSection />
      <PrinciplesSection />
      <TestimonialsSection />
      <NewsSection />
      <ClientsSection />
      <ContactSection />
    </>
  );
}
