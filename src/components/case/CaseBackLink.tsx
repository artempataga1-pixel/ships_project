'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

/* Лаймовая кнопка возврата на странице кейса.

   По умолчанию — «← Все кейсы» к карточке этого дела в каталоге /cases.
   Если кейс открыли из «Связанных кейсов» практики, карточка добавляет к
   адресу ?from=<slug практики>, и кнопка ведёт обратно на эту практику к той
   же карточке («← К практике»). from принимаем только из практик самого
   кейса — подставить в адрес чужую страницу нельзя.

   scroll={false}: к карточке довозит ScrollTopOnLoad целевой страницы;
   встроенный hash-scroll Next.js делает один ранний прыжок и гонится с ним. */

export interface CasePracticeLink {
  slug: string
}

const CLASS_NAME =
  'btn-lime-fill inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold'

function Back({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} scroll={false} className={CLASS_NAME}>
      {label}
    </Link>
  )
}

function BackFromParams({ caseSlug, practices }: { caseSlug: string; practices: CasePracticeLink[] }) {
  const from = useSearchParams().get('from')
  const practice = practices.find((p) => p.slug === from)
  if (practice) return <Back href={`/practices/${practice.slug}#case-${caseSlug}`} label="← К практике" />
  return <Back href={`/cases#case-${caseSlug}`} label="← Все кейсы" />
}

export function CaseBackLink({ caseSlug, practices }: { caseSlug: string; practices: CasePracticeLink[] }) {
  // Страница кейса статическая: в серверной разметке — кнопка по умолчанию,
  // адрес с ?from= читается уже в браузере
  return (
    <Suspense fallback={<Back href={`/cases#case-${caseSlug}`} label="← Все кейсы" />}>
      <BackFromParams caseSlug={caseSlug} practices={practices} />
    </Suspense>
  )
}
