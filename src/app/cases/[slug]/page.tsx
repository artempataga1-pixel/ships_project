import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CASE_STUDIES } from '@/constants/content/case-studies'

interface CasePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return CASE_STUDIES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params
  const item = CASE_STUDIES.find((c) => c.slug === slug)
  if (!item) return {}
  return {
    title: `${item.title} — Шумская и Партнёры`,
    description: item.summary,
  }
}

export default async function CaseStudyPage({ params }: CasePageProps) {
  const { slug } = await params
  const item = CASE_STUDIES.find((c) => c.slug === slug)
  if (!item) notFound()

  return (
    <div className="min-h-dvh bg-black flex items-center">
      <div className="max-w-[900px] w-full mx-auto px-8 py-40">
        <Link
          href="/#cases"
          className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200"
        >
          ← Все кейсы
        </Link>

        <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.15em] text-white/40">
          <span>{item.category}</span>
          <span aria-hidden="true">•</span>
          <span>{item.year}</span>
        </div>

        <h1 className="mt-6 font-heading text-5xl font-extrabold leading-tight">
          {item.title}
        </h1>

        <p className="mt-6 font-heading text-3xl font-extrabold text-hero-bronze">
          {item.amount}
        </p>

        <p className="mt-10 text-lg text-white/70 leading-relaxed">{item.summary}</p>
      </div>
    </div>
  )
}
