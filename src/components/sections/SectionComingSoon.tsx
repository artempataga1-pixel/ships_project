/* Заглушка целой секции главной, для которой контента ещё нет («Статьи»,
   «Кейсы»). Держит id секции — якоря меню и возврат «Назад» продолжают
   работать. Стиль — светлый фон с орбитой и лайм-точкой, как у соседних
   секций, но без пина и без анимаций скролла: на пустой секции они лишние. */

interface SectionComingSoonProps {
  id: string
  eyebrow: string
  title: string
  text: string
}

export function SectionComingSoon({ id, eyebrow, title, text }: SectionComingSoonProps) {
  return (
    <section
      id={id}
      className="relative flex min-h-[70svh] scroll-mt-16 items-center justify-center overflow-hidden px-6 py-24 text-center lg:min-h-[70dvh]"
      style={{
        background:
          'radial-gradient(circle at 72% 42%, rgba(168,204,51,.08), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[96%] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 rotate-[4deg] rounded-[50%] border"
        style={{ borderColor: 'rgba(168,204,51,.42)' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-[14%] top-[30%] h-[10px] w-[10px] rounded-full bg-[var(--color-lime)]"
        style={{ boxShadow: '0 0 20px var(--color-lime-glow)' }}
      />

      <div className="relative z-[1] flex flex-col items-center gap-6">
        <span className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)] md:text-base">
          ( {eyebrow} )
        </span>
        <h2 className="font-heading text-[clamp(2.5rem,6vw,5.5rem)] font-black uppercase leading-[0.95] tracking-[-0.045em] text-[var(--color-text)]">
          {title}
        </h2>
        <span className="inline-flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white px-4 py-2 font-heading text-[0.75rem] font-black uppercase tracking-[0.12em] text-[var(--color-text)]">
          Скоро
          <i
            aria-hidden
            className="block h-[9px] w-[9px] rounded-[2px] bg-[var(--color-lime)]"
            style={{ boxShadow: '0 0 12px var(--color-lime-glow)' }}
          />
        </span>
        <p className="max-w-[36ch] text-base text-[var(--color-muted)] md:text-lg">{text}</p>
      </div>
    </section>
  )
}
