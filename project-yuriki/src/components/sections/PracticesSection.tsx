import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CASES } from '@/constants/content/cases'

export function PracticesSection() {
  return (
    <section id="practices" className="min-h-dvh flex items-center bg-black">
      <div className="max-w-[1440px] w-full mx-auto px-16 py-32">
        <SectionHeading
          title="Практики"
          subtitle="Резонансные дела и подтверждённые результаты"
        />

        <div className="mt-20 grid grid-cols-2 gap-6">
          {CASES.map((caseItem, i) => (
            <RevealOnScroll key={caseItem.title} delay={i * 0.1}>
              <div
                className="
                  group p-8 rounded-lg border border-[var(--color-card-border)]/40
                  bg-gradient-to-b from-zinc-800 to-zinc-900
                  transition-all duration-300
                  hover:border-[var(--color-accent-cold)]/60
                  hover:shadow-[var(--shadow-accent-cold)]
                "
              >
                {/* Номер + год */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="font-heading text-sm tracking-[0.2em] text-[var(--color-accent-cold)]"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-white/40 font-heading tracking-widest">
                    {caseItem.year}
                  </span>
                </div>

                {/* Заголовок */}
                <h3 className="font-heading text-2xl font-extrabold leading-snug mb-3">
                  {caseItem.title}
                </h3>

                {/* Категория */}
                <p className="text-sm text-white/50 mb-8">
                  {caseItem.desc}
                </p>

                {/* Сумма — главный визуальный акцент */}
                <div className="text-3xl font-heading font-extrabold text-[var(--color-accent-cold)]">
                  {caseItem.amount}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
