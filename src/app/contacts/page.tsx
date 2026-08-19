import type { Metadata } from 'next'
import Link from 'next/link'

import { ContactsSection } from '@/components/sections/ContactsSection'
import { ScrollTopOnLoad } from '@/components/ui/ScrollTopOnLoad'
import { PRACTICE_OPTIONS } from '@/constants/content/contacts'
import { PRODUCTS } from '@/constants/content/products'
import { getPracticeBySlug } from '@/lib/content'
import { SITE_URL } from '@/lib/site'

/* ── ОТДЕЛЬНАЯ СТРАНИЦА «КОНТАКТЫ» ────────────────────────────────────────

   Зачем она есть. Кнопки «Обсудить задачу» на страницах практик и кейсов
   раньше вели на /?practice=<slug>#contacts — то есть на ПОЛНУЮ загрузку
   главной. Замер прод-билда: 9 511 КБ трафика (из них 9 423 КБ — три ролика
   сторибука), интро-логотип, пересборка GSAP-пинов и только потом доводка
   скролла на 14 438 px вниз. Ради формы на пять полей. Здесь тот же блок
   отдаётся сам по себе, без сторибука.

   Блок НЕ скопирован, а переиспользован: <ContactsSection/> самодостаточен
   (собственный фон, изолированный CSS .pb-contact, фиксированный аспект
   1537/1023), поэтому выглядит здесь ровно так же, как на главной, и
   правится в одном месте.

   Заявка уходит в тот же /api/contact → Telegram: роут глобальный и от
   страницы-отправителя не зависит. Единственная связка — значение
   «Направление» обязано посимвольно совпасть с PRACTICE_OPTIONS, по нему
   роут валидирует заявку; сверку делаем прямо здесь, ниже. */

interface ContactsPageProps {
  searchParams: Promise<{ practice?: string; product?: string }>
}

export const metadata: Metadata = {
  title: 'Контакты — Шумская и Партнёры',
  description:
    'Оставьте заявку — оценим риски по вашей ситуации и предложим порядок действий. Телефон, почта и адрес юридической компании «Шумская и Партнёры».',
  // Абсолютный URL: metadataBase в проекте не задан, относительный путь дал бы
  // предупреждение сборки и неверный canonical.
  alternates: { canonical: `${SITE_URL}/contacts` },
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { practice: practiceSlug, product: productSlug } = await searchParams

  /* Резолвим параметры НА СЕРВЕРЕ, а не эффектом после гидрации: значение
     приезжает уже в первом HTML, пустая форма не мигает перед подстановкой. */
  const practiceTitle = practiceSlug ? getPracticeBySlug(practiceSlug)?.title : undefined
  const initialPractice =
    practiceTitle && PRACTICE_OPTIONS.includes(practiceTitle) ? practiceTitle : ''

  const product = productSlug ? PRODUCTS.find((item) => item.slug === productSlug) : undefined
  const initialMessage = product ? `Интересует: ${product.title}` : ''

  /* Куда вернуть посетителя. Пришёл со страницы практики — возвращаем на неё,
     а не на главную: это единственное, что он на сайте открывал. */
  const backHref = practiceTitle ? `/practices/${practiceSlug}` : '/'
  const backLabel = practiceTitle ? '← К практике' : '← На главную'

  return (
    <div className="relative bg-[var(--color-bg)]">
      <ScrollTopOnLoad />

      {/* pt под фиксированную шапку (h-12 до xl, h-16 с xl) плюс воздух:
          блок «Контактов» начинается фото-баннером, и вплотную под чёрной
          плашкой шапки он читался обрезанным. */}
      <div className="mx-auto max-w-[1440px] px-6 pt-20 sm:px-8 xl:pt-24">
        <Link
          href={backHref}
          className="btn-lime-fill inline-flex h-11 items-center justify-center rounded-md px-6 text-sm font-semibold"
        >
          {backLabel}
        </Link>
      </div>

      <div className="pt-10 md:pt-14">
        <ContactsSection initialPractice={initialPractice} initialMessage={initialMessage} />
      </div>
    </div>
  )
}
