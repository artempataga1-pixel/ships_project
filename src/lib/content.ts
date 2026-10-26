import type { CaseStudy, Practice, Product, Publication, TeamMember } from '@/types/content'
import { TEAM } from '@/constants/content/team'
import { PRACTICE_ITEMS } from '@/constants/content/practices'
import { PRODUCTS } from '@/constants/content/products'
import { CASE_STUDIES } from '@/constants/content/case-studies'
import { PUBLICATIONS } from '@/constants/content/publications'

/* Чистые функции над константами контент-слоя — единственная точка, через
   которую вёрстка ходит за связями «практика ↔ продукт ↔ кейс ↔ статья».
   Когда контент переедет в CMS, меняется только реализация этих функций. */

export function getPracticesSorted(): Practice[] {
  return [...PRACTICE_ITEMS].sort((a, b) => a.order - b.order)
}

export function getPracticeBySlug(slug: string): Practice | undefined {
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
export function getPracticesForProduct(productId: string): Practice[] {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) return []
  return getPracticesSorted().filter((practice) => product.practiceIds.includes(practice.id))
}

export function getCasesForPractice(practiceId: string): CaseStudy[] {
  return CASE_STUDIES.filter((item) => item.practiceIds?.includes(practiceId))
}

/* Кейсы блока «Кейсы» на главной (пока — демо-набор, см. case-studies.ts) */
export function getHomeCases(): CaseStudy[] {
  return CASE_STUDIES.filter((item) => item.onHome)
}

export function getCaseBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((item) => item.slug === slug)
}

/* Видимые публикации в ручном порядке (order). Скрытые (hidden) не выводятся
   нигде — так материал убирается с сайта без удаления записи (ТЗ, раздел 13). */
export function getVisiblePublications(): Publication[] {
  return PUBLICATIONS.filter((item) => !item.hidden).sort((a, b) => a.order - b.order)
}

/* Избранные — стопка блока «Публикации» на главной */
export function getFeaturedPublications(): Publication[] {
  return getVisiblePublications().filter((item) => item.kind === 'main' && item.featured)
}

/* Блок «Публикации и аналитика» на странице практики — не больше трёх
   карточек: раскладка блока рассчитана на один ряд из трёх. */
export function getPublicationsForPractice(practiceId: string): Publication[] {
  return getVisiblePublications()
    .filter((item) => item.practiceIds?.includes(practiceId))
    .slice(0, 3)
}

/* Партнёры с персональной страницей — те, у кого заполнены slug и profile. */
export function getPartnersWithProfile(): TeamMember[] {
  return TEAM.filter((member) => member.slug && member.profile)
}

export function getPartnerBySlug(slug: string): TeamMember | undefined {
  return getPartnersWithProfile().find((member) => member.slug === slug)
}
