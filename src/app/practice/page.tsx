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
            // Карточки в правой колонке: панель уходит влево (right-full),
            // чтобы не выйти за правый край viewport
            const isRightCol = i % 2 === 1

            return (
              <RevealOnScroll key={practice.title} delay={i * 0.1}>
                <div className="relative group">
                  {/* ── Карточка практики ─────────────────────────── */}
                  <div
                    className="
                      p-8 rounded-lg border border-[var(--color-card-border)]/40
                      bg-white/[0.03] backdrop-blur-sm
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
                  </div>

                  {/* ── Hover-панель продуктов ────────────────────── */}
                  <div
                    className={[
                      'absolute top-0 w-56',
                      'opacity-0 pointer-events-none',
                      'group-hover:opacity-100 group-hover:translate-x-0',
                      'group-focus-within:opacity-100 group-focus-within:translate-x-0',
                      'transition-all duration-300 z-10',
                      isRightCol
                        ? 'right-full mr-2 -translate-x-2'
                        : 'left-full ml-2 translate-x-2',
                    ].join(' ')}
                  >
                    <ul className="rounded border border-[var(--color-card-border)]/40 bg-[var(--color-bg)] p-4 space-y-3">
                      {practice.products.map((product) => (
                        <li
                          key={product}
                          className="text-sm text-white/70 leading-relaxed pl-3 border-l border-[var(--color-card-border)]/50"
                        >
                          {product}
                        </li>
                      ))}
                    </ul>
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
