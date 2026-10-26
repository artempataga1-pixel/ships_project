import type { PublicationAuthorId, PublicationTopic } from '@/types/content'

/* Справочники раздела «Публикации»: темы фильтра, авторы, профиль на
   PROбанкротство. Вынесены из publications.ts, чтобы клиентские компоненты
   (фильтры, карточки) не тянули в бандл все 25 текстов материалов. */

/* Темы фильтра — в порядке показа (раздел 9 ТЗ) */
export const PUBLICATION_TOPICS: PublicationTopic[] = [
  { id: 'bankrotstvo', label: 'Банкротство' },
  { id: 'subsidiarnaya-otvetstvennost', label: 'Субсидиарная ответственность' },
  { id: 'rukovoditeli-kdl', label: 'Руководители и КДЛ' },
  { id: 'korporativnye-spory', label: 'Корпоративные споры' },
  { id: 'zashchita-aktivov', label: 'Защита активов' },
  { id: 'stroitelstvo-podryad', label: 'Строительство и подряд' },
  { id: 'nedvizhimost', label: 'Недвижимость' },
  { id: 'sobstvenniki-biznesa', label: 'Собственники бизнеса' },
]

/* Авторы — имя и ссылка на персональную страницу партнёра */
export const PUBLICATION_AUTHORS: Record<
  PublicationAuthorId,
  { name: string; href: string }
> = {
  'anna-shumskaya': {
    name: 'Анна Шумская',
    href: '/partners/anna-shumskaya',
  },
  'maksim-posazhennikov': {
    name: 'Максим Посаженников',
    href: '/partners/maksim-posazhennikov',
  },
}

/* Профиль Анны на PROбанкротство — ссылка «Все комментарии» после блока */
export const PROBANKROTSTVO_PROFILE_URL =
  'https://probankrotstvo.ru/persons/anna-sumskaia-1957'
