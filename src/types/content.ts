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
  phrase: string
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

export interface Benefit {
  title: string
  desc: string
  icon: 'FileCheck' | 'ShieldCheck' | 'FileText'
}

export interface ContactInfo {
  phone: string
  email: string
  address: string
}
