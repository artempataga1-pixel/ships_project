import { ScrollStory } from '@/components/hero/ScrollStory'
import { PracticesSection } from '@/components/sections/PracticesSection'
import { ArticlesSection } from '@/components/sections/ArticlesSection'
import { CasesSection } from '@/components/sections/CasesSection'
import { ContactsSection } from '@/components/sections/ContactsSection'

// Одностраничный сайт. Начало — scroll-story: единое видео-полотно, скролл
// чередует проматывание ролика и «полки покоя» (О нас · Компетенции · Партнёры).
// На мобилке/reduced-motion стори выключается — эти секции идут обычным потоком
// внутри ScrollStory. Дальше — обычные секции сайта.
export default function Home() {
  return (
    <>
      <ScrollStory />

      <PracticesSection />
      <ArticlesSection />
      <CasesSection />
      <ContactsSection />
    </>
  )
}
