import { AmbientVideoBackground } from '@/components/ui/AmbientVideoBackground'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BenefitCard } from './BenefitCard'
import { BENEFITS } from '@/constants/content/benefit'

// Server Component — не добавлять 'use client' (сломает metadata)
export const metadata = {
  title: 'Польза — Шумская и Партнёры',
}

export default function BenefitPage() {
  return (
    <>
      <AmbientVideoBackground src="/video/infograf4.mp4" opacity={0.12} />

      <main className="max-w-[1440px] mx-auto px-16 py-32">
        <SectionHeading
          title="Польза"
          subtitle="Практические материалы от экспертов компании"
        />

        <div className="mt-20 grid grid-cols-3 gap-6">
          {BENEFITS.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.1}>
              <BenefitCard item={item} />
            </RevealOnScroll>
          ))}
        </div>
      </main>
    </>
  )
}
