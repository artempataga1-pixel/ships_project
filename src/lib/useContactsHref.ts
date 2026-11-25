'use client'

import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types/content'

/* Куда ведут пункты меню (шапка, нижнее меню, футер), FAB и «Связаться».

   На главной — прежние якоря «/#id»: секции там на месте, клик перехватывает
   Lenis (или story-контроллер) и плавно долистывает.

   У четырёх разделов есть своя страница — «Публикации», «Кейсы», «Признание»,
   «Контакты».
   С любой другой страницы якорь означал бы полную загрузку главной со всем
   сторибуком (9.5 МБ трафика, замер прод-билда) ради короткого блока-перехода,
   а с самого каталога /cases пункт «Кейсы» и вовсе уводил бы из каталога.
   Поэтому вне главной эти пункты ведут на свои страницы и на них же горят.

   ВАЖНО: подменять href можно ТОЛЬКО в момент рендера. В useActiveSection
   обязан уходить исходный NAV_ITEMS — хук ищет секции по id из href
   («/#contacts» → id="contacts"), и «/contacts» без решётки сломал бы
   подсветку активного пункта меню. */
const SECTION_PAGES: Record<string, string> = {
  '/#articles': '/publications',
  '/#cases': '/cases',
  '/#recognition': '/recognition',
  '/#contacts': '/contacts',
}

export function navHrefFor(href: string, pathname: string): string {
  if (pathname === '/') return href
  return SECTION_PAGES[href] ?? href
}

/* Индекс пункта, чья отдельная страница сейчас открыта (/cases, /cases/<slug>,
   /publications, /contacts), или -1 */
export function sectionPageIndex(items: NavItem[], pathname: string): number {
  return items.findIndex((item) => {
    const page = SECTION_PAGES[item.href]
    return page !== undefined && (pathname === page || pathname.startsWith(`${page}/`))
  })
}

export function useNavHref(): (href: string) => string {
  const pathname = usePathname()
  return (href: string) => navHrefFor(href, pathname)
}

export function useContactsHref(): string {
  return navHrefFor('/#contacts', usePathname())
}
