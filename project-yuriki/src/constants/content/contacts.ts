import type { ContactInfo, Founder } from '@/types/content'

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

/* Учредители — фото по бокам блока «Контакты» (референс landonorris.com) */
export const FOUNDERS: [Founder, Founder] = [
  {
    name: 'Анна Шумская',
    role: 'Управляющий партнёр',
    image: '/images/team/anna-shumskaya-final.png',
    imageWidth: 333,
    imageHeight: 610,
  },
  {
    name: 'Максим Посаженников',
    role: 'Соучредитель',
    image: '/images/team/founder-2.png',
    imageWidth: 382,
    imageHeight: 542,
  },
]

/* Бегущая строка под учредителями — реальные СМИ, рейтинги и издания,
   упоминавшие фирму (по данным shumskaya.pro) */
export const MEDIA_MENTIONS = [
  'ПРАВО.RU',
  'КОММЕРСАНТЪ',
  'РОССИЙСКАЯ ГАЗЕТА',
  'ДЕЛОВОЙ КВАРТАЛ',
  'ПРАВО-300',
  'BUSINESSFM',
  'КОНТИНЕНТ СИБИРЬ',
  'BEST LAWYERS',
]
