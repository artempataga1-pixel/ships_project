import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getPracticesSorted } from '@/lib/content'
import { CASE_STUDIES } from '@/constants/content/case-studies'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/contacts`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  /* Пять актуальных практик из реестра PRACTICE_ITEMS. Старые слаги
     (arbitration, bankruptcy, …) в карту сайта не попадают — на них стоят
     301-редиректы в next.config.ts. */
  const practiceRoutes: MetadataRoute.Sitemap = getPracticesSorted().map((practice) => ({
    url: `${SITE_URL}/practices/${practice.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const caseRoutes: MetadataRoute.Sitemap = CASE_STUDIES.map((caseStudy) => ({
    url: `${SITE_URL}/cases/${caseStudy.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...practiceRoutes, ...caseRoutes]
}
