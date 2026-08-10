import type { CaseStudy, MediaItem, PracticeItem, Product } from '@/types/content'
import { PRACTICE_ITEMS } from '@/constants/content/practices'
import { PRODUCTS } from '@/constants/content/products'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { MEDIA } from '@/constants/content/media'

/* Чистые функции над константами контент-слоя — единственная точка, через
   которую вёрстка ходит за связями «практика ↔ продукт ↔ кейс ↔ статья».
   Когда контент переедет в CMS, меняется только реализация этих функций. */

export function getPracticesSorted(): PracticeItem[] {
  return [...PRACTICE_ITEMS].sort((a, b) => a.order - b.order)
}

export function getPracticeBySlug(slug: string): PracticeItem | undefined {
  return PRACTICE_ITEMS.find((p) => p.slug === slug)
}

/* Продукты практики — в порядке productIds самой практики (порядком управляет
   контент, а не порядок записей в реестре). Несуществующие id отсеиваются,
   чтобы битая ссылка не роняла страницу. */
export function getProductsForPractice(practiceId: string): Product[] {
  const practice = PRACTICE_ITEMS.find((p) => p.id === practiceId)
  if (!practice) return []
  return practice.productIds
    .map((id) => PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
}

/* Обратная связь many-to-many: один продукт может относиться к нескольким
   практикам (см. схлопывание дубликатов «Второе мнение…» в шаге 1.4). */
export function getPracticesForProduct(productId: string): PracticeItem[] {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) return []
  return getPracticesSorted().filter((practice) => product.practiceIds.includes(practice.id))
}

export function getCasesForPractice(practiceId: string): CaseStudy[] {
  return CASE_STUDIES.filter((item) => item.practiceIds?.includes(practiceId))
}

export function getArticlesForPractice(practiceId: string): MediaItem[] {
  return MEDIA.filter((item) => item.practiceIds?.includes(practiceId))
}
