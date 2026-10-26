export interface NavItem {
  label: string
  href: string
}

export interface HeroContent {
  /* «Шумская и партнёры» — название фирмы, жирная строка над заголовком */
  brand: string
  /* «Превращаем» — первая строка заголовка */
  titleLine1: string
  /* «сложное в ясное» — вторая строка */
  titleLine2: string
  /* «Видим больше, чем отдельный спор» — подстрочник под заголовком */
  subtitle: string
}

export interface AboutContent {
  heading: string
  /* первый абзац — выделен типографикой */
  lead: string
  /* абзацы между первым и последним — обычным текстом */
  body: string[]
  /* последний абзац — выделен типографикой */
  closing: string
}

/* Полный профайл партнёра для персональной страницы /partners/[slug].
   Тексты — дословно из doks/kontent/partner-*.md. */
export interface PartnerProfile {
  /** Вводный абзац героя. */
  lead: string
  /** Уточнение должности под пилюлей роли (например, руководство практикой). */
  roleNote?: string
  /** Абзацы про специализацию. */
  specialization: string[]
  /** Ключевая цифра: текст до значения, выделяемое значение и текст после него
      (дословный абзац из профайла). Без tail абзац заканчивается на значении. */
  figure?: { lead: string; value: string; tail?: string }
  /** Заголовок блока про подход; по умолчанию «Подход к работе». */
  approachTitle?: string
  /** Абзацы про подход к работе. */
  approach: string[]
  /** Девиз-цитата под подходом. */
  tagline?: string
  education: string[]
  /** Преподавание и публичная деятельность; нет в профайле — карточка не выводится. */
  teaching?: string[]
  /** Признание и рейтинги. */
  recognition: string[]
}

export interface TeamMember {
  name: string
  role: string
  /** Слаг персональной страницы /partners/<slug>; нет профайла — нет страницы. */
  slug?: string
  profile?: PartnerProfile
  /** Готовая карточка-визитка (фото + имя + роль впечатаны в изображение). */
  photo?: string
  /** Чистый вертикальный портрет 4:5 (без впечатанного текста) для персональной
      страницы. Нет — страница вписывает визитку photo, прижимая вправо. */
  portrait?: string
  /** Регалии для выезжающей 3D-панели при наведении на карточку. */
  achievements?: string[]
  /** Из какого края экрана выезжает панель с регалиями. */
  panelSide?: 'left' | 'right'
}

/* ── Контент-слой раздела «Практики» ──────────────────────────────────
   Нормализованная структура «практика ↔ продукт ↔ кейс ↔ статья»: связи
   many-to-many через массивы id, ноль дублирования текста. Спроектирована
   так, чтобы 1-в-1 лечь на будущую headless CMS.
   С шага 1.6 это единственный источник и страниц /practices/[slug], и
   карточек коллажа на главной; старый PracticeArea удалён. */

/* Смысловая группа внутри блока «Что мы делаем» — заголовок + пункты.
   Пункты выводятся дословно из документа заказчика, не переписываются. */
export interface PracticeServiceGroup {
  title: string
  items: string[]
}

export interface Practice {
  /* Ключ связей (productIds/practiceIds). Сейчас совпадает со slug, но
     разведён намеренно: slug — публичный URL, его можно поменять, id — нет. */
  id: string
  /* URL-идентификатор для /practices/[slug] и якоря #practice-<slug>.
     Транслит с русского: bankrotstvo, korporativnoe-pravo, … */
  slug: string
  /* Порядок вывода — и в коллаже на главной, и в списках. Меняется данными,
     без правки вёрстки (прямое требование заказчика). */
  order: number
  /* Порядковый номер для подписи на карточке — «01», «02», … */
  num: string
  /* Короткий ярлык для плашки над заголовком */
  label: string
  title: string
  /* «Краткое описание для карточки» — оно же лид на странице практики
     и description в метатегах */
  cardSummary: string
  /* «Описание практики» — абзацы развёрнутого описания */
  description: string[]
  serviceGroups: PracticeServiceGroup[]
  /* id продуктов этой практики (см. Product.id) */
  productIds: string[]
  /* Фото карточки в коллаже на главной (public/reference3/…). Стоковое —
     маппинг «практика ↔ снимок» наш, идёт заказчику на согласование. */
  image: string
  /* Пропорция исходного кадра («3/2», «9/16»): ею же задаётся aspect рамки
     карточки, иначе object-cover режет портретные снимки. */
  imageRatio: string
}

/* Продукт — законченное предложение фирмы, а не пункт перечня услуг.
   hasPage — заготовка под будущие /products/[slug]: пока у всех false,
   страницы не создаются, карточка показывает только «Обсудить задачу». */
export interface Product {
  id: string
  slug: string
  title: string
  /* Один продукт может относиться к нескольким практикам */
  practiceIds: string[]
  description?: string
  hasPage?: boolean
}

/* Смежная экспертиза — второй уровень раздела «Практики» (шаг 2.1).
   Направления, по которым фирма принимает отдельные поручения, но не хочет
   ставить их в один ряд с пятью основными практиками: отдельных страниц,
   продуктов и связей у них нет — только название и короткое описание.
   Массив управляет всем: направление добавляется/убирается без правки вёрстки
   (прямое требование заказчика). */
export interface AdjacentExpertise {
  id: string
  title: string
  description: string
}

/* Ключевая компетенция — карточка орбиты раздела #competencies (шаг 2.2).
   Это НЕ отрасль права и не практика, а конкретная характерная задача,
   которую фирма ведёт регулярно — часто на стыке нескольких практик.
   practiceIds — связь на будущее (в каких практиках задача возникает);
   вёрсткой пока не используется, но держит раздел в одной модели данных
   с практиками и продуктами. */
export interface KeyCompetency {
  id: string
  title: string
  /* id практик, в рамках которых сопровождается задача (Practice.id) */
  practiceIds?: string[]
}

/* ── Публикации и аналитика (страница /publications, ТЗ заказчика 21.10) ──
   Одна запись = одна публикация или комментарий. Поля повторяют список
   раздела 13 ТЗ «Управление публикациями» — чтобы позже 1-в-1 лечь в админку. */

/* Автор — слаг персональной страницы партнёра (/partners/<slug>) */
export type PublicationAuthorId = 'anna-shumskaya' | 'maksim-posazhennikov'

/* Тема фильтра — 8 рубрик из раздела 9 ТЗ */
export type PublicationTopicId =
  | 'bankrotstvo'
  | 'subsidiarnaya-otvetstvennost'
  | 'rukovoditeli-kdl'
  | 'korporativnye-spory'
  | 'zashchita-aktivov'
  | 'stroitelstvo-podryad'
  | 'nedvizhimost'
  | 'sobstvenniki-biznesa'

export interface PublicationTopic {
  id: PublicationTopicId
  label: string
}

export interface Publication {
  /* Сквозной номер из контентной таблицы заказчика (1–25) */
  num: number
  /* main — авторские публикации и экспертные материалы (№1–17);
     probankrotstvo — комментарии Анны на PROбанкротство (№18–25) */
  kind: 'main' | 'probankrotstvo'
  authors: PublicationAuthorId[]
  /* Роль автора, если он не автор всего материала:
     «экспертный комментарий», «интервью», «участники круглого стола» */
  authorRole?: string
  publisher: string
  year: string
  /* Точная дата ДД.ММ.ГГГГ — есть только у комментариев PROбанкротство */
  date?: string
  title: string
  /* Рубрика карточки PROбанкротство («Субсидиарная ответственность») */
  rubric?: string
  /* Редакционное превью 2–3 предложения */
  preview: string
  /* Строка «Для кого» */
  audience: string
  /* Теги для показа на карточке (2–4) */
  tags: string[]
  /* Темы фильтра */
  topics: PublicationTopicId[]
  url: string
  /* Фирменная обложка избранного материала (public/images/publications/…) */
  cover?: string
  featured?: boolean
  /* Ручной порядок внутри своего блока; меньше — выше */
  order: number
  /* Скрыть материал, не удаляя его */
  hidden?: boolean
  /* id практик, на страницах которых материал выводится (Practice.id) */
  practiceIds?: string[]
}

/* Кейс. Два вида записей в одном реестре:
   — демо-кейсы главной (onHome): только summary/amount/year, без практик;
   — настоящие кейсы практик (doks заказчика от 26.10): развёрнутые разделы
     situation/actions/result|status/why, тексты дословно из документа. */
export interface CaseStudy {
  slug: string
  /* Полное название — на странице кейса и в метатегах */
  title: string
  /* Сокращённое название для карточки, если полное в неё не влезает */
  shortTitle?: string
  category: string
  desc?: string
  /* Сумма — только если она есть в описании дела */
  amount?: string
  /* Подпись к сумме на странице кейса; по умолчанию «Сумма спора» */
  amountLabel?: string
  year?: string
  /* Короткий итог: подпись под карточкой практики и description страницы */
  summary: string
  /* Развёрнутые разделы страницы кейса */
  situation?: string[]
  task?: string
  actions?: string[]
  result?: string[]
  /* Для дел, которые ещё идут, — вместо результата */
  status?: string
  why?: string
  /* id практик, к которым относится кейс (Practice.id) */
  practiceIds?: string[]
  /* Показывать в блоке «Кейсы» на главной */
  onHome?: boolean
}

export interface ContactInfo {
  phone: string
  email: string
  address: string
}

/* Регистрационные и банковские реквизиты для юридических документов
   (политика обработки ПДн, пользовательское соглашение) — не для публичного
   виджета «Контакты», а для раздела «Реквизиты» на юридических страницах. */
export interface CompanyLegalInfo {
  fullName: string
  legalForm: string
  inn: string
  ogrnip: string
  bankAccount: string
  bankName: string
  bik: string
  correspondentAccount: string
  postalAddress: string
  actualAddress: string
}

/* СМИ/рейтинг в бегущей строке блока «Контакты». logo не задан —
   значит для бренда нет чистого файла логотипа, рендерим текстом. */
export interface MediaMention {
  name: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
}

/* Раздел юридического документа (политика/соглашение). id — якорь для
   прямых ссылок (например #consent из чекбокса формы). highlight — рендер
   в акцентной ghost-panel вместо обычного раздела: используется для
   самостоятельного раздела «Согласие на обработку персональных данных»,
   который по 152-ФЗ (с 1 сентября 2025) должен быть самодостаточным. */
export interface LegalSection {
  id?: string
  heading: string
  body?: string[]
  list?: string[]
  highlight?: boolean
}

export interface LegalDocument {
  title: string
  updatedAt: string
  intro?: string
  sections: LegalSection[]
}
