import { SpotlightHero } from '@/components/hero/SpotlightHero'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { ABOUT, STATS } from '@/constants/content/home'

export default function Home() {
  return (
    <>
      {/* ── Hero: курсор-прожектор ────────────────────────────────── */}
      <SpotlightHero />

      {/* ── О нас ─────────────────────────────────────────────────── */}
      <section
        id="about"
        className="relative min-h-screen flex items-center py-24 scroll-mt-16"
      >
        {/* Фон fon1.jpg на opacity 0.15 */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/backgrounds/fon1.jpg)',
            opacity: 0.15,
          }}
        />

        <div className="max-w-[1440px] mx-auto px-16 w-full">
          <div className="grid grid-cols-2 gap-24 items-center">
            <SectionHeading
              title={ABOUT.heading}
              subtitle={ABOUT.description}
            />

            {/* StatCounter сам отслеживает viewport через IntersectionObserver */}
            <StatCounter items={STATS} />
          </div>
        </div>
      </section>
    </>
  )
}
