import { AmbientVideoBackground } from '@/components/ui/AmbientVideoBackground'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PRACTICES } from '@/constants/content/practice'

// Server Component — не добавлять 'use client' (сломает metadata)
export const metadata = {
  title: 'Практики — Шумская и Партнёры',
}

export default function PracticePage() {
  return (
    <>
      <AmbientVideoBackground src="/video/infograf1.mp4" opacity={0.12} />

      {/* Фон fon2.jpg — глубже видео-слоя */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/backgrounds/fon2.jpg)',
          opacity: 0.1,
        }}
      />

      <main className="max-w-[1440px] mx-auto px-16 py-32 overflow-hidden">
        <SectionHeading
          title="Практики"
          subtitle="Профессиональная защита в ключевых областях права"
        />

        <div className="mt-20 grid grid-cols-2 gap-4">
          {PRACTICES.map((practice, i) => {
            return (
              <RevealOnScroll key={practice.title} delay={i * 0.1}>
                <div className="group">
                  <div
                    className="
                      p-8 rounded-lg border border-[var(--color-card-border)]/40
                      bg-gradient-to-b from-zinc-800 to-zinc-900
                      transition-all duration-300
                      group-hover:border-[var(--color-card-border)]
                      group-hover:shadow-[0_0_24px_rgba(119,99,75,0.35)]
                    "
                  >
                    <span className="font-heading text-sm tracking-[0.2em] text-[var(--color-card-border)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 font-heading text-2xl font-extrabold leading-snug">
                      {practice.title}
                    </h3>

                    {/* Раскрывается при hover прямо внутри карточки */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                      <div className="overflow-hidden">
                        <ul className="mt-5 pt-5 border-t border-white/10 space-y-3">
                          {practice.products.map((product) => (
                            <li
                              key={product}
                              className="text-sm text-white/65 leading-relaxed pl-3 border-l border-[var(--color-card-border)]/50"
                            >
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </main>
    </>
  )
}
