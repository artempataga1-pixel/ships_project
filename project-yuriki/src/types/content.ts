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
  /* «Когда на чаше» / «весов стоит» — капсом, серебро */
  line1: string
  line2: string
  /* «будущее —» — италик, бронза */
  line3: string
  /* последняя строка: акцент капсом-серебром + хвост италиком-бронзой */
  line4Accent: string
  line4Rest: string
}

export interface AboutContent {
  heading: string
  description: string
}

export interface TeamMember {
  name: string
  role: string
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
