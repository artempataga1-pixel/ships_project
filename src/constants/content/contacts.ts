import type { ContactInfo, MediaMention } from '@/types/content'

export const CONTACT_INFO: ContactInfo = {
  phone: '+7 (495) 123-45-67',
  email: 'info@shumskaya.ru',
  address: 'г. Москва, ул. Ильинка, 4, оф. 301',
}

export const PRACTICE_OPTIONS = [
  'Банкротство',
  'Субсидиарная ответственность',
  'Корпоративные споры',
  'Налоговые споры',
  'Уголовно-правовая защита',
]

/* Бегущая строка «Контактов» — реальные СМИ, рейтинги и издания,
   упоминавшие фирму (по данным shumskaya.pro). Для Право.ru чистого файла
   логотипа не нашлось — рендерим текстом, не выдумывая несуществующий файл. */
export const MEDIA_MENTIONS: MediaMention[] = [
  { name: 'ПРАВО.RU' },
  { name: 'Коммерсантъ', logo: '/images/media/kommersant.svg', logoWidth: 500, logoHeight: 70 },
  { name: 'Российская газета', logo: '/images/media/rg.svg', logoWidth: 500, logoHeight: 50 },
  { name: 'Деловой квартал', logo: '/images/media/dk.png', logoWidth: 1558, logoHeight: 799 },
  { name: 'ПРАВО-300', logo: '/images/media/pravo300.svg', logoWidth: 115, logoHeight: 115 },
  { name: 'BusinessFM', logo: '/images/media/businessfm.png', logoWidth: 142, logoHeight: 37 },
  { name: 'Континент Сибирь', logo: '/images/media/kontinent.png', logoWidth: 179, logoHeight: 22 },
  { name: 'Best Lawyers', logo: '/images/media/bestlawyers.svg', logoWidth: 720, logoHeight: 144 },
]
