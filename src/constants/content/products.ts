import type { Product } from '@/types/content'

/* Реестр продуктов — законченных предложений фирмы (не пунктов перечня услуг).
   Тексты названий — из «Практики_ШиП_описание_для_сайта.docx», блок «Продукты».
   Завершающие точки списка docx сняты: это названия карточек, а не предложения
   (см. doks/pravki-tekstov.md).

   id и slug сейчас совпадают: id — ключ связей, slug — публичный URL будущей
   страницы /products/<slug>. Разведены намеренно, чтобы смена URL не рвала связи.
   hasPage: false у всех — отдельных страниц продуктов пока нет.

   ЭТАП 0 (пилот): только 7 продуктов практики «Банкротство». Продукты
   остальных четырёх практик добавляет шаг 1.4 плана. */
export const PRODUCTS: Product[] = [
  {
    id: 'zashchita-ot-subsidiarnoy-otvetstvennosti',
    slug: 'zashchita-ot-subsidiarnoy-otvetstvennosti',
    title: 'Защита от субсидиарной ответственности под ключ',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'zashchita-rukovoditelya-ot-ubytkov',
    slug: 'zashchita-rukovoditelya-ot-ubytkov',
    title: 'Защита руководителя от взыскания корпоративных убытков',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'karta-bankrotnykh-riskov',
    slug: 'karta-bankrotnykh-riskov',
    title: 'Карта банкротных рисков собственника и руководителя',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'audit-sdelok-pered-bankrotstvom',
    slug: 'audit-sdelok-pered-bankrotstvom',
    title: 'Аудит сделок перед банкротством компании',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'strategiya-kreditora',
    slug: 'strategiya-kreditora',
    title: 'Стратегия кредитора в банкротстве контрагента',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'vtoroe-mnenie-po-obosoblennomu-sporu',
    slug: 'vtoroe-mnenie-po-obosoblennomu-sporu',
    title: 'Второе мнение по обособленному спору',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
  {
    id: 'zashchita-semi-sobstvennika',
    slug: 'zashchita-semi-sobstvennika',
    title: 'Комплексная защита семьи собственника при банкротстве бизнеса',
    practiceIds: ['bankrotstvo'],
    hasPage: false,
  },
]
