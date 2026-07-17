import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { TERMS_OF_USE } from '@/constants/content/legal'

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — Шумская и Партнёры',
  description:
    'Условия использования сайта юридической компании «Шумская и Партнёры».',
}

export default function TermsPage() {
  return <LegalPage doc={TERMS_OF_USE} />
}
