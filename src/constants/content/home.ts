import type { Stat, HeroContent, AboutContent, ValueItem } from '@/types/content'

export const HERO: HeroContent = {
  line1: 'Когда на чашах',
  line2: 'весов стоит',
  line3Accent: 'будущее',
  line3Rest: '— важна',
  line4: 'каждая деталь',
}

export const ABOUT: AboutContent = {
  heading: 'О компании',
  description:
    'Boutique-практика с фокусом на сложные корпоративные и банкротные споры. ' +
    'Работаем с крупным бизнесом и собственниками активов.',
  quoteLead: 'Мы не считаем дела —',
  quoteAccent: 'мы проживаем каждое как своё.',
  quoteRest:
    'Потому что за каждым спором стоит не абстрактный кейс, а чья-то судьба, бизнес, будущее.',
}

export const STATS: Stat[] = [
  { value: 17, label: 'лет практики', suffix: '' },
  { value: 340, label: 'выигранных дел', suffix: '+' },
  { value: 94, label: 'успешных исходов', suffix: '%' },
  { value: 15, label: 'млрд ₽ защищено', suffix: '+' },
]

export const VALUES: ValueItem[] = [
  {
    icon: 'target',
    title: 'Индивидуальный подход',
    description:
      'Ни одна стратегия не копируется — под каждое дело выстраиваем аргументацию с нуля.',
  },
  {
    icon: 'eye',
    title: 'Прозрачность на каждом этапе',
    description:
      'Клиент всегда знает, что происходит в деле: без юридического жаргона и недосказанности.',
  },
  {
    icon: 'award',
    title: 'Результат, а не обещания',
    description:
      'Измеряем работу выигранными делами и защищёнными активами, а не красивыми презентациями.',
  },
]
