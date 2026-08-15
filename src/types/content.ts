export interface NavItem {
  label: string
  href: string
}

export interface Stat {
  value: number
  label: string
  suffix: string
}

export interface HeroContent {
  /* «Право» — первая строка заголовка */
  titleLine1: string
  /* «создаёт порядок.» — вторая строка */
  titleLine2: string
  /* «Мы — решения.» — третья строка, приглушённо-серая */
  titleMuted: string
  /* подзаголовок под заголовком */
  subtitle: string
  /* текст круглой лайм-кнопки */
  ctaLabel: string
  /* нижняя строка-слоган (uppercase) */
  bottomLine: string
}

/* Счётчик Hero (10+ / 150+ / 30+). Значение — уже готовая строка с суффиксом,
   без анимации-счёта: это отдельные данные, не путать со Stat/STATS. */
export interface HeroStat {
  value: string
  label: string
}

export interface AboutContent {
  heading: string
  description: string
  /* «Мы не считаем дела —» — жирным, как в hero */
  quoteLead: string
  /* «мы проживаем каждое как своё.» — курсив-бронза, акцент внутри той же фразы */
  quoteAccent: string
  /* второе предложение — снова жирным, без акцента */
  quoteRest: string
}

export interface ValueItem {
  icon: 'target' | 'eye' | 'award'
  title: string
  description: string
}

export interface TeamMember {
  name: string
  role: string
  /** Готовая карточка-визитка (фото + имя + роль впечатаны в изображение). */
  photo?: string
  /** Регалии для выезжающей 3D-панели при наведении на карточку. */
  achievements?: string[]
  /** Из какого края экрана выезжает панель с регалиями. */
  panelSide?: 'left' | 'right'
}

/* Карточка орбиты в разделе «Наши компетенции» (PRACTICES в practice.ts).
   Имя Practice освобождено под основной тип практики — см. ниже.
   Удаляется в шаге 2.2 плана: орбита переезжает на KeyCompetency. */
export interface LegacyPractice {
  title: string
  products: string[]
}

/* Карточка практики в горизонтальном коллаже (референс landonorris.com).
   Удаляется в шаге 1.6 вместе с PRACTICE_AREAS — до тех пор её читает
   PracticesSection на главной. */
export interface PracticeArea {
  /* порядковый номер для подписи над фото — «01», «02», … */
  num: string
  /* короткий ярлык над фото, как дата-локация в референсе */
  label: string
  title: string
  desc: string
  /* фото-заглушка карточки в коллаже (public/reference3/…) */
  image: string
  /* URL-идентификатор для /practices/[slug] и якоря #practice-<slug> */
  slug: string
  /* 1–2 предложения для блока «Результат» на отдельной странице практики */
  summary: string
  /* Пропорция исходного фото (совпадает с ratio в CARD_VARIANTS коллажа) —
     чтобы object-cover на отдельной странице практики не обрезал кадр */
  imageRatio: string
}

/* ── Контент-слой раздела «Практики» ──────────────────────────────────
   Нормализованная структура «практика ↔ продукт ↔ кейс ↔ статья»: связи
   many-to-many через массивы id, ноль дублирования текста. Спроектирована
   так, чтобы 1-в-1 лечь на будущую headless CMS.
   Шаг 1.5: это основной и единственный источник страниц /practices/[slug];
   старый PracticeArea остался только под коллаж на главной (уйдёт в 1.6). */

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

export interface Case {
  title: string
  desc: string
  amount: string
  year: string
}

export interface MediaItem {
  publisher: string
  title: string
  date: string
  /* готовое фото-превью статьи (public/images/articles/…) */
  image: string
  /* ссылка на реальную публикацию в источнике; пока не расставлена — кнопка "Читать" неактивна */
  url?: string
  /* id практик, к которым относится публикация (Practice.id) */
  practiceIds?: string[]
}

export interface CaseStudy {
  slug: string
  title: string
  category: string
  desc: string
  amount: string
  year: string
  /* 1–2 предложения для отдельной страницы кейса */
  summary: string
  /* id практик, к которым относится кейс (Practice.id) */
  practiceIds?: string[]
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
