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

export interface Practice {
  title: string
  products: string[]
}

/* Карточка практики в горизонтальном коллаже (референс landonorris.com) */
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
