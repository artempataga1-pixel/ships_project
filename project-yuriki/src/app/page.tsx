import { SpotlightHero } from '@/components/hero/SpotlightHero'
import { AboutSection } from '@/components/sections/AboutSection'
import { CompetenciesSection } from '@/components/sections/CompetenciesSection'
import { PartnersSection } from '@/components/sections/PartnersSection'
import { PracticesSection } from '@/components/sections/PracticesSection'
import { ArticlesSection } from '@/components/sections/ArticlesSection'
import { CasesSection } from '@/components/sections/CasesSection'
import { ContactsSection } from '@/components/sections/ContactsSection'

// Одностраничный сайт: секции идут в порядке пунктов навбара,
// каждый пункт скроллит к своему якорю (id секции)
export default function Home() {
  return (
    <>
      {/* ── Hero: курсор-прожектор ────────────────────────────────── */}
      <SpotlightHero />

      <AboutSection />
      <CompetenciesSection />
      <PartnersSection />
      <PracticesSection />
      <ArticlesSection />
      <CasesSection />
      <ContactsSection />
    </>
  )
}
