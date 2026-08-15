import type { Product } from '@/types/content'

/* Реестр продуктов — законченных предложений фирмы (не пунктов перечня услуг).
   Тексты названий — из «Практики_ШиП_описание_для_сайта.docx», блок «Продукты».
   Завершающие точки списка docx сняты: это названия карточек, а не предложения
   (см. doks/pravki-tekstov.md).

   id и slug сейчас совпадают: id — ключ связей, slug — публичный URL будущей
   страницы /products/<slug>. Разведены намеренно, чтобы смена URL не рвала связи.
   hasPage: false у всех — отдельных страниц продуктов пока нет.

   Шаг 1.4 плана добавил продукты практик 2–5. «Второе мнение по обособленному
   спору» (банкротство), «Второе мнение по корпоративному спору»
   (корпоративное право) и «Судебный аудит действующего дела…» (судебные
   споры) намеренно оставлены отдельными записями, а не схлопнуты в одну —
   решение и обоснование в отчёте шага 1.4 плана, идёт заказчику на сверку. */
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

  /* Практика 2 — Корпоративное право и корпоративные споры (9) */
  {
    id: 'partnerskaya-sessiya-sobstvennikov-biznesa',
    slug: 'partnerskaya-sessiya-sobstvennikov-biznesa',
    title: 'Партнёрская сессия собственников бизнеса',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'korporativnaya-konstitutsiya-semeynogo-biznesa',
    slug: 'korporativnaya-konstitutsiya-semeynogo-biznesa',
    title: 'Корпоративная конституция семейного бизнеса',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'nastroyka-pravil-sovmestnogo-vladeniya-biznesom',
    slug: 'nastroyka-pravil-sovmestnogo-vladeniya-biznesom',
    title: 'Настройка правил совместного владения бизнесом',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'dorozhnaya-karta-korporativnogo-konflikta',
    slug: 'dorozhnaya-karta-korporativnogo-konflikta',
    title: 'Дорожная карта корпоративного конфликта',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'razdel-biznesa-mezhdu-partnerami',
    slug: 'razdel-biznesa-mezhdu-partnerami',
    title: 'Раздел бизнеса между партнёрами',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'vykhod-uchastnika-i-opredelenie-stoimosti-doli',
    slug: 'vykhod-uchastnika-i-opredelenie-stoimosti-doli',
    title: 'Выход участника и определение стоимости доли',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'zashchita-uchastnika-ot-utraty-korporativnogo-kontrolya',
    slug: 'zashchita-uchastnika-ot-utraty-korporativnogo-kontrolya',
    title: 'Защита участника от утраты корпоративного контроля',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'peredacha-biznesa-naslednikam',
    slug: 'peredacha-biznesa-naslednikam',
    title: 'Передача бизнеса наследникам',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },
  {
    id: 'vtoroe-mnenie-po-korporativnomu-sporu',
    slug: 'vtoroe-mnenie-po-korporativnomu-sporu',
    title: 'Второе мнение по корпоративному спору',
    practiceIds: ['korporativnoe-pravo'],
    hasPage: false,
  },

  /* Практика 3 — Строительство. Земля. Недвижимость (13) */
  {
    id: 'due-diligence-zemelnogo-uchastka',
    slug: 'due-diligence-zemelnogo-uchastka',
    title: 'Due diligence земельного участка',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'due-diligence-obekta-nedvizhimosti',
    slug: 'due-diligence-obekta-nedvizhimosti',
    title: 'Due diligence объекта недвижимости перед приобретением или инвестированием',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'otsenka-gradostroitelnogo-potentsiala-uchastka',
    slug: 'otsenka-gradostroitelnogo-potentsiala-uchastka',
    title: 'Оценка градостроительного потенциала земельного участка',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'soprovozhdenie-stroitelnogo-proekta',
    slug: 'soprovozhdenie-stroitelnogo-proekta',
    title: 'Комплексное юридическое сопровождение строительного или девелоперского проекта',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'audit-stroitelnogo-proekta',
    slug: 'audit-stroitelnogo-proekta',
    title: 'Аудит строительного проекта и его договорной модели',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'stroitelnyy-spor-pod-klyuch',
    slug: 'stroitelnyy-spor-pod-klyuch',
    title: 'Строительный спор под ключ',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'vzyskanie-zadolzhennosti-za-stroitelnye-raboty',
    slug: 'vzyskanie-zadolzhennosti-za-stroitelnye-raboty',
    title: 'Взыскание задолженности за выполненные строительные работы',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'zashchita-zakazchika-ot-trebovaniy-podryadchika',
    slug: 'zashchita-zakazchika-ot-trebovaniy-podryadchika',
    title: 'Защита заказчика от требований подрядчика',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'soprovozhdenie-stroitelno-tekhnicheskoy-ekspertizy',
    slug: 'soprovozhdenie-stroitelno-tekhnicheskoy-ekspertizy',
    title: 'Сопровождение строительно-технической экспертизы',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'zashchita-proekta-vo-vzaimootnosheniyakh-s-gosorganami',
    slug: 'zashchita-proekta-vo-vzaimootnosheniyakh-s-gosorganami',
    title: 'Защита проекта во взаимоотношениях с государственными и муниципальными органами',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'soprovozhdenie-sdelki-s-nedvizhimostyu',
    slug: 'soprovozhdenie-sdelki-s-nedvizhimostyu',
    title: 'Сопровождение сделки с недвижимостью',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'pravovoy-audit-problemnogo-proekta',
    slug: 'pravovoy-audit-problemnogo-proekta',
    title: 'Правовой аудит проблемного земельного или строительного проекта',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },
  {
    id: 'zashchita-investora-v-problemnom-proekte',
    slug: 'zashchita-investora-v-problemnom-proekte',
    title: 'Защита инвестора в проблемном строительном проекте',
    practiceIds: ['stroitelstvo-zemlya-nedvizhimost'],
    hasPage: false,
  },

  /* Практика 4 — Судебные споры (7) */
  {
    id: 'otsenka-perspektiv-sudebnogo-spora',
    slug: 'otsenka-perspektiv-sudebnogo-spora',
    title: 'Оценка перспектив судебного спора',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'sudebnyy-audit-vtoroe-mnenie-second-opinion',
    slug: 'sudebnyy-audit-vtoroe-mnenie-second-opinion',
    title: 'Судебный аудит действующего дела — второе мнение внешнего консультанта (Second Opinion)',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'vtoroe-mnenie-pered-apellyatsiey-ili-kassatsiey',
    slug: 'vtoroe-mnenie-pered-apellyatsiey-ili-kassatsiey',
    title: 'Второе мнение перед апелляцией или кассацией',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'podgotovka-zhaloby-v-verkhovnyy-sud',
    slug: 'podgotovka-zhaloby-v-verkhovnyy-sud',
    title: 'Подготовка жалобы в Верховный Суд',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'srochnye-obespechitelnye-mery',
    slug: 'srochnye-obespechitelnye-mery',
    title: 'Срочные обеспечительные меры',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'strategiya-vzyskaniya-i-ispolneniya-resheniya',
    slug: 'strategiya-vzyskaniya-i-ispolneniya-resheniya',
    title: 'Стратегия взыскания и исполнения судебного решения',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },
  {
    id: 'upravlenie-kompleksnym-sudebnym-proektom',
    slug: 'upravlenie-kompleksnym-sudebnym-proektom',
    title: 'Управление комплексным судебным проектом с множественностью судебных споров внутри',
    practiceIds: ['sudebnye-spory'],
    hasPage: false,
  },

  /* Практика 5 — Семейное и наследственное право (8) */
  {
    id: 'razdel-biznesa-i-aktivov-suprugov',
    slug: 'razdel-biznesa-i-aktivov-suprugov',
    title: 'Раздел бизнеса и активов супругов',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'zashchita-sobstvennika-biznesa-pri-razvode',
    slug: 'zashchita-sobstvennika-biznesa-pri-razvode',
    title: 'Защита собственника бизнеса при разводе',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'nasledovanie-doli-i-upravlenie-kompaniey',
    slug: 'nasledovanie-doli-i-upravlenie-kompaniey',
    title: 'Наследование доли и управление компанией после смерти участника',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'dorozhnaya-karta-nasledovaniya-biznesa',
    slug: 'dorozhnaya-karta-nasledovaniya-biznesa',
    title: 'Дорожная карта наследования бизнеса',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'semeyno-korporativnyy-audit-aktivov',
    slug: 'semeyno-korporativnyy-audit-aktivov',
    title: 'Семейно-корпоративный аудит активов',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'brachnyy-dogovor-dlya-sobstvennika-biznesa',
    slug: 'brachnyy-dogovor-dlya-sobstvennika-biznesa',
    title: 'Брачный договор для собственника бизнеса',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'uregulirovanie-konflikta-mezhdu-naslednikami',
    slug: 'uregulirovanie-konflikta-mezhdu-naslednikami',
    title: 'Урегулирование конфликта между наследниками',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
  {
    id: 'peredacha-semeynogo-biznesa-sleduyushchemu-pokoleniyu',
    slug: 'peredacha-semeynogo-biznesa-sleduyushchemu-pokoleniyu',
    title: 'Передача семейного бизнеса следующему поколению',
    practiceIds: ['semeynoe-nasledstvennoe-pravo'],
    hasPage: false,
  },
]
