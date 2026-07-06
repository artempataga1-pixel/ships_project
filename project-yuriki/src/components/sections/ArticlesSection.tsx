import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { MEDIA } from '@/constants/content/media'

export function ArticlesSection() {
  return (
    <section id="articles" className="min-h-dvh flex items-center bg-black">
      <div className="max-w-[1440px] w-full mx-auto px-16 py-32">
        <SectionHeading
          title="Статьи"
          subtitle="Публикации и комментарии экспертов компании"
        />

        <div className="mt-20 grid grid-cols-2 gap-6">
          {MEDIA.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.1}>
              <article
                className="
                  group rounded-lg overflow-hidden border border-[var(--color-card-border)]/40
                  bg-gradient-to-b from-zinc-800 to-zinc-900
                  transition-all duration-300
                  hover:border-[var(--color-card-border)]
                  hover:shadow-[0_0_28px_rgba(119,99,75,0.25)]
                "
              >
                {/* Превью — градиент с логотипом издания */}
                <div className="relative aspect-video bg-gradient-to-br from-zinc-700 to-zinc-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span
                      className="
                        text-xs font-heading tracking-[0.15em] uppercase
                        text-white/80 bg-black/50 backdrop-blur-sm
                        px-3 py-1.5 rounded
                      "
                    >
                      {item.publisher}
                    </span>
                  </div>
                </div>

                {/* Контент */}
                <div className="p-6">
                  <h3
                    className="
                      font-heading text-xl font-extrabold leading-snug mb-4
                      transition-colors duration-300
                      group-hover:text-[var(--color-accent-cold)]
                    "
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">{item.date}</span>
                    <a
                      href="#"
                      aria-label={`Читать статью «${item.title}»`}
                      className="
                        text-sm text-[var(--color-accent-cold)]
                        flex items-center gap-1
                        hover:underline underline-offset-4
                      "
                    >
                      Читать <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
