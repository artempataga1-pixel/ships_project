import type { Stat, HeroContent, AboutContent } from '@/types/content'

export const HERO: HeroContent = {
  heading: 'ШУМСКАЯ И ПАРТНЁРЫ',
  phrase: 'Защищаем бизнес там, где ставки максимальны',
  ctaLabel: 'Узнать больше',
}

export const ABOUT: AboutContent = {
  heading: 'О компании',
  description:
    'Boutique-практика с фокусом на сложные корпоративные и банкротные споры. ' +
    'Работаем с крупным бизнесом и собственниками активов.',
}

export const STATS: Stat[] = [
  { value: 2009, label: 'год основания', suffix: '' },
  { value: 94, label: 'выигранных дел', suffix: '%' },
  { value: 15, label: 'млрд ₽ защищено', suffix: '+' },
]
