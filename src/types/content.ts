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

/* СМИ/рейтинг в бегущей строке блока «Контакты». logo не задан —
   значит для бренда нет чистого файла логотипа, рендерим текстом. */
export interface MediaMention {
  name: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
}
