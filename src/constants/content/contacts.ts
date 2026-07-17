import type { CompanyLegalInfo, ContactInfo, MediaMention } from '@/types/content'

export const CONTACT_INFO: ContactInfo = {
  phone: '+7 (913) 901-76-41',
  email: 'as@shumskaya.pro',
  address: '630099, г. Новосибирск, ул. Депутатская, д. 2, офис 5Б',
}

/* Регистрационные и банковские реквизиты — используются на страницах
   /privacy-policy и /terms (раздел «Реквизиты Оператора»), не в публичном
   виджете «Контакты». */
export const COMPANY_LEGAL_INFO: CompanyLegalInfo = {
  fullName: 'Индивидуальный предприниматель Шумская Анна Сергеевна',
  legalForm: 'Индивидуальный предприниматель (ИП)',
  inn: '544511441883',
  ogrnip: '321547600107577',
  bankAccount: '40802810120000117170',
  bankName: 'ООО «Банк Точка»',
  bik: '044525104',
  correspondentAccount: '30101810745374525104',
  postalAddress: 'а/я 334, 630099, г. Новосибирск',
  actualAddress: '630099, г. Новосибирск, ул. Депутатская, д. 2, офис 5Б',
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
