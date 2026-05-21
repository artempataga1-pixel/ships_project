import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { CLIENT_TYPES, SCHOOL } from "@/lib/constants";

export function ClientsSection() {
  return (
    <SectionWrapper id="clients">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Клиенты */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--dark-text-100)" }}>Клиенты</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">
            Кто нас выбирает
          </h2>
          <GoldDivider className="mb-8" />
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            Работаем с компаниями и частными клиентами, для которых ставки слишком высоки,
            чтобы доверять случайному выбору.
          </p>
          <div className="flex flex-col gap-3">
            {CLIENT_TYPES.map((type) => (
              <div
                key={type}
                className="flex items-center gap-4 py-3 border-b border-border last:border-0"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--dark-text-100)" }} />
                <span className="text-sm font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Школа юристов */}
        <div
          className="rounded-xl p-6 sm:p-10"
          style={{ background: "var(--dark-section-bg)", border: "1px solid var(--dark-text-10)" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "var(--dark-text-100)" }}>Образование</p>
          <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--dark-text-100)" }}>{SCHOOL.title}</h3>
          <p className="text-xs mb-6" style={{ color: "var(--dark-text-40)" }}>Основана в {SCHOOL.founded}</p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--dark-text-100)" }}>{SCHOOL.description}</p>
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--dark-text-100)" }}>Программы</p>
            <div className="flex flex-wrap gap-2">
              {SCHOOL.programs.map((prog) => (
                <span
                  key={prog}
                  className="px-3 py-1.5 rounded-full text-xs hover:border-gold/40 hover:text-gold transition-colors"
                  style={{ border: "1px solid var(--dark-text-100)", color: "var(--dark-text-100)" }}
                >
                  {prog}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
