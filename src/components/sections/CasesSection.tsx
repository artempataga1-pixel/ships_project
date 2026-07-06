import { SectionHeading } from '@/components/ui/SectionHeading'
import { CaseStudyCard } from './CaseStudyCard'
import { CASE_STUDIES } from '@/constants/content/case-studies'

export function CasesSection() {
  return (
    <section id="cases" className="min-h-dvh flex items-center bg-black">
      <div className="max-w-[1440px] w-full mx-auto px-16 py-32">
        <SectionHeading
          title="Кейсы"
          subtitle="Избранные дела: отрасли, суммы и результаты"
        />

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-16">
          {CASE_STUDIES.map((item, i) => (
            <CaseStudyCard key={item.slug} item={item} delay={(i % 2) * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}
