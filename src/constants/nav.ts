import type { NavItem } from '@/types/content'

// Пункты ведут на якоря секций главной. Формат «/#id»:
// на главной клик перехватывает Lenis (pathname совпадает — плавный скролл),
// с внутренних страниц (например /cases/…) браузер уводит на главную к секции
export const NAV_ITEMS: NavItem[] = [
  { label: 'О нас', href: '/#about' },
  { label: 'Наши компетенции', href: '/#competencies' },
  { label: 'Партнёры', href: '/#partners' },
  { label: 'Практики', href: '/#practices' },
  { label: 'Статьи', href: '/#articles' },
  { label: 'Кейсы', href: '/#cases' },
  { label: 'Контакты', href: '/#contacts' },
]
