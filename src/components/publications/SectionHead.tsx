import { RevealOnScroll } from '@/components/ui/RevealOnScroll'

/* Шапка блока страницы /publications: eyebrow-подпись + заголовок + лид.
   Ритм появления — как у ArticlesInsights на странице практики (y 20,
   expo.out, строки по очереди), чтобы страницы сайта двигались одинаково. */
export function SectionHead({
  eyebrow,
  title,
  lead,
  id,
}: {
  eyebrow: string
  title: string
  lead?: React.ReactNode
  /* id заголовка — для aria-labelledby секции */
  id?: string
}) {
  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <RevealOnScroll y={20} duration={0.7} blur={0} ease="expo.out">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
          {eyebrow}
        </p>
        <h2
          id={id}
          className="font-heading text-[clamp(1.6rem,3.2vw,2.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-[var(--color-text)]"
        >
          {title}
        </h2>
      </RevealOnScroll>
      {lead && (
        <RevealOnScroll delay={0.15} y={20} duration={0.7} blur={0} ease="expo.out">
          <p className="max-w-[56ch] text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            {lead}
          </p>
        </RevealOnScroll>
      )}
    </div>
  )
}
