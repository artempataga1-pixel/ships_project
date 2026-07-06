import { SectionHeading } from '@/components/ui/SectionHeading'
import { StatCounter } from '@/components/ui/StatCounter'
import { ABOUT, STATS } from '@/constants/content/home'

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-dvh flex items-center py-24 bg-black"
    >
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
  )
}
