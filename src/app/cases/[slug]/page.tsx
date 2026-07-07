import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { StarButton } from '@/components/ui/star-button'

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
      <div className="max-w-[1200px] w-full mx-auto px-8 py-40">
        {/* Возврат ровно к карточке этого кейса в блоке «Кейсы» */}
        <StarButton href={`/#case-${item.slug}`} className="h-14 px-8 text-xl">
          ← Все кейсы
        </StarButton>

        <div className="mt-10 flex items-center gap-4 text-2xl uppercase tracking-[0.15em] text-white">
          <span>{item.category}</span>
          <span aria-hidden="true">•</span>
          <span>{item.year}</span>
        </div>

        <h1 className="mt-6 font-heading text-6xl md:text-8xl font-extrabold leading-tight text-hero-bronze">
          {item.title}
        </h1>

        <p className="mt-6 font-heading text-5xl md:text-6xl font-extrabold text-hero-bronze">
          {item.amount}
        </p>

        <p className="mt-10 text-3xl md:text-4xl text-white/70 leading-relaxed">
          {item.summary}
        </p>
      </div>
    </div>
  )
}
