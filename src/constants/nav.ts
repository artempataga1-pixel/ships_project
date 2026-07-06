import type { NavItem } from '@/types/content'

// Одностраничный сайт: пункты ведут на якоря секций главной страницы
export const NAV_ITEMS: NavItem[] = [
  { label: 'О нас', href: '#about' },
  { label: 'Наши компетенции', href: '#competencies' },
  { label: 'Партнёры', href: '#partners' },
  { label: 'Практики', href: '#practices' },
  { label: 'Статьи', href: '#articles' },
  { label: 'Кейсы', href: '#cases' },
  { label: 'Контакты', href: '#contacts' },
]
