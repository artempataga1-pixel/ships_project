import type { TeamMember } from '@/types/content'

/* Готовые карточки-визитки (фото + имя + роль впечатаны в изображении), лежат в
   public/images/team. Скругление и тень карточке даёт вёрстка (PartnersSection).
   Порядок = раскладка веера слева направо: управляющий партнёр Шумская — по центру. */
export const TEAM: TeamMember[] = [
  {
    name: 'Посаженников Максим Сергеевич',
    role: 'Старший партнёр',
    photo: '/images/team/maksim.jpg',
  },
  {
    name: 'Шумская Анна Сергеевна',
    role: 'Управляющий партнёр',
    photo: '/images/team/anna.jpg',
  },
  {
    name: 'Можаровская Арина Валерьевна',
    role: 'Ведущий юрист практики «Банкротство»',
    photo: '/images/team/arina.jpg',
  },
]
