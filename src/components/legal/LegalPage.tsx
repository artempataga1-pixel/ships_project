import Link from 'next/link'
import type { LegalDocument, LegalSection } from '@/types/content'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'

const bodyClass = 'mt-3 max-w-[75ch] text-base leading-relaxed text-[var(--color-text)]/80'
const headingClass = 'font-heading text-2xl font-extrabold text-[var(--color-text)]'

function SectionList({ list }: { list: string[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {list.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[0.55em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--color-lime)]" />
          <span className={`${bodyClass} mt-0`}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionBlock({ section }: { section: LegalSection }) {
  if (section.highlight) {
    return (
      <div
        id={section.id}
        className="relative mt-12 scroll-mt-28 overflow-hidden rounded-[var(--radius-xl)] border p-8 md:p-11"
        style={{
          background: 'rgba(255,255,255,.64)',
          borderColor: 'rgba(255,255,255,.85)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-[12%] h-[76%] w-[3px] bg-[var(--color-lime)]"
          style={{ boxShadow: '0 0 26px var(--color-lime-glow)' }}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-lime-ink)]">
          Отдельное согласие
        </p>
        <h2 className={`${headingClass} mt-2`}>{section.heading}</h2>
        {section.body?.map((p) => (
          <p key={p} className={bodyClass}>
            {p}
          </p>
        ))}
        {section.list && <SectionList list={section.list} />}
      </div>
    )
  }

  return (
    <section id={section.id} className={`mt-12 md:mt-14${section.id ? ' scroll-mt-28' : ''}`}>
      <h2 className={headingClass}>{section.heading}</h2>
      {section.body?.map((p) => (
        <p key={p} className={bodyClass}>
          {p}
        </p>
      ))}
      {section.list && <SectionList list={section.list} />}
    </section>
  )
}

export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-[var(--color-bg)]"
      style={{
        background:
          'radial-gradient(circle at 74% 30%, rgba(201,255,31,.09), transparent 26%), linear-gradient(180deg,#ffffff 0%,#fafafa 58%,#f7f7f5 100%)',
      }}
    >
      <ScrollTopOnLoad />
      <div className="relative z-10 mx-auto max-w-[1120px] px-6 pb-28 pt-36 md:pt-44">
        <Link
          href="/"
          className="btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          ← На главную
        </Link>

        <h1 className="mt-8 font-heading text-[clamp(1.75rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.02em] text-[var(--color-text)]">
          {doc.title}
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
          {doc.updatedAt}
        </p>
        {doc.intro && (
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[var(--color-text)] md:text-xl">
            {doc.intro}
          </p>
        )}

        {doc.sections.map((section) => (
          <SectionBlock key={section.heading} section={section} />
        ))}
      </div>
    </main>
  )
}
