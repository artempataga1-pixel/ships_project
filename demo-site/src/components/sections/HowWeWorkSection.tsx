import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { HOW_WE_WORK } from "@/lib/constants";

export function HowWeWorkSection() {
  return (
    <SectionWrapper id="process" dark className="overflow-hidden">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--dark-text-100)" }}>Процесс</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5" style={{ color: "var(--dark-text-100)" }}>
          Как мы работаем
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
        {/* Соединительная линия (только десктоп) */}
        <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gold/20" />

        {HOW_WE_WORK.map((step, idx) => (
          <div key={step.step} className="relative flex flex-col items-center text-center px-6 py-8">
            {/* Номер шага */}
            <div className="relative z-10 w-16 h-16 rounded-full border flex items-center justify-center mb-6" style={{ background: "var(--dark-section-bg)", borderColor: "var(--process-step-color)" }}>
              <span className="font-display text-xl font-bold" style={{ color: "var(--process-step-color)" }}>{step.step}</span>
            </div>

            <h3 className="font-display text-2xl font-semibold mb-4" style={{ color: "var(--process-step-color)" }}>{step.title}</h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--dark-text-100)" }}>{step.description}</p>

            {/* Разделитель между шагами на мобиле */}
            {idx < HOW_WE_WORK.length - 1 && (
              <div className="md:hidden w-px h-10 bg-gold/20 mt-6" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-gold-foreground font-semibold rounded-lg text-sm hover:bg-gold-dark transition-colors"
        >
          Начать работу
        </a>
      </div>
    </SectionWrapper>
  );
}
