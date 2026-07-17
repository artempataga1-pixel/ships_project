import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { PRIVACY_POLICY } from '@/constants/content/legal'

export const metadata: Metadata = {
  title: 'Политика обработки персональных данных — Шумская и Партнёры',
  description:
    'Условия обработки персональных данных на сайте юридической компании «Шумская и Партнёры».',
}

export default function PrivacyPolicyPage() {
  return <LegalPage doc={PRIVACY_POLICY} />
}
