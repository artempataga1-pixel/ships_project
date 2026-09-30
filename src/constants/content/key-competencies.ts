import type { KeyCompetency } from '@/types/content'

/* Раздел «Ключевые компетенции» — орбита на главной (#competencies).

   Источник — раздел 5 `doks/kontent/sait-shp-tekstovye-bloki.md` (волна правок
   27.09.2026, 9 позиций). Формулировки перенесены дословно; заказчик отдельно
   оговорил, что перечень рабочий и формулировки ещё могут оттачиваться — поэтому
   весь состав раздела живёт здесь, а не в вёрстке.

   Смысловая граница (прямое требование заказчика):
   практика — крупное направление специализации (реестр PRACTICE_ITEMS,
   свои страницы, продукты, кейсы), ключевая компетенция — конкретная
   характерная задача внутри одной или нескольких практик. Своих страниц
   у компетенций нет.

   Ограничение состава — 8–9 позиций: «сохранить лёгкость, воздух и не
   перегружать композицию». Добавлять сверх этого нельзя без пересчёта
   раскладки орбиты: десктоп чередует два яруса по чётности индекса, мобильные
   ленты режут список на 5 + остаток.

   practiceIds проставлены по продуктам практик (products.ts) — связь на
   будущее, вёрсткой пока не используется. */

export const KEY_COMPETENCIES: KeyCompetency[] = [
  {
    id: 'subsidiarnaya-otvetstvennost',
    title: 'Защита от субсидиарной ответственности',
    practiceIds: ['bankrotstvo'],
  },
  {
    id: 'korporativnye-konflikty',
    title: 'Корпоративные конфликты',
    practiceIds: ['korporativnoe-pravo', 'sudebnye-spory'],
  },
  {
    id: 'korporativnye-sessii',
    title: 'Корпоративная сессия владельцев бизнеса',
    practiceIds: ['korporativnoe-pravo'],
  },
  {
    id: 'razdel-biznesa',
    title: 'Раздел бизнеса',
    practiceIds: ['korporativnoe-pravo', 'semeynoe-nasledstvennoe-pravo'],
  },
  {
    id: 'stroitelnye-spory',
    title: 'Сложные строительные споры',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost', 'sudebnye-spory'],
  },
  {
    id: 'due-diligence',
    title: 'Due diligence',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost', 'korporativnoe-pravo'],
  },
  {
    id: 'vtoroe-mnenie',
    title: 'Второе мнение по сделкам и спорам',
    practiceIds: ['sudebnye-spory', 'korporativnoe-pravo', 'bankrotstvo'],
  },
  {
    id: 'vzyskanie-ubytkov',
    title: 'Взыскание убытков',
    practiceIds: ['sudebnye-spory', 'korporativnoe-pravo', 'bankrotstvo'],
  },
  {
    id: 'transgranichnye-semeynye-spory',
    title: 'Трансграничные семейные споры',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
  },
]
