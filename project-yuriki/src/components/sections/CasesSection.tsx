import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BenefitCard } from './BenefitCard'
import { BENEFITS } from '@/constants/content/benefit'

export function CasesSection() {
  return (
    <section id="cases" className="scroll-mt-16 bg-black">
      <div className="max-w-[1440px] mx-auto px-16 py-32">
        <SectionHeading
          title="Кейсы"
          subtitle="Практические материалы от экспертов компании"
        />

        <div className="mt-20 grid grid-cols-3 gap-6">
          {BENEFITS.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.1}>
              <BenefitCard item={item} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
