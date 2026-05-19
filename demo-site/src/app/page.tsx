import { HeroSection } from "@/components/sections/HeroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { HowWeWorkSection } from "@/components/sections/HowWeWorkSection";
import { CasesSection } from "@/components/sections/CasesSection";
import { RecommendSection } from "@/components/sections/RecommendSection";
import { PrinciplesSection } from "@/components/sections/PrinciplesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { GeographySection } from "@/components/sections/GeographySection";
import { NewsSection } from "@/components/sections/NewsSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <PartnersSection />
      <StatsSection />
      <ServicesSection />
      <HowWeWorkSection />
      <CasesSection />
      <RecommendSection />
      <PrinciplesSection />
      <TestimonialsSection />
      <GeographySection />
      <NewsSection />
      <ClientsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
