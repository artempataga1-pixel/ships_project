import { ScrollStory } from '@/components/hero/ScrollStory'
import { HomeAnchorScroll } from '@/components/sections/HomeAnchorScroll'
import { PracticesSection } from '@/components/sections/PracticesSection'
import { PublicationsTeaser } from '@/components/sections/PublicationsTeaser'
import { CasesSection } from '@/components/sections/CasesSection'
import { ContactsSection } from '@/components/sections/ContactsSection'
import { getFeaturedPublications } from '@/lib/content'

// Одностраничный сайт. Начало — scroll-story: единое видео-полотно, скролл
// чередует проматывание ролика и «полки покоя» (О нас · Компетенции · Партнёры).
// На мобилке/reduced-motion стори выключается — эти секции идут обычным потоком
// внутри ScrollStory. Дальше — обычные секции сайта.
export default function Home() {
  return (
    <>
      {/* Доводка скролла при загрузке с якорем ниже стори (навбар/возврат с кейса) */}
      <HomeAnchorScroll />
      <ScrollStory />

      <PracticesSection />
      {/* Публикации — только переход: стопка, каталог и фильтры на /publications */}
      <PublicationsTeaser
        covers={getFeaturedPublications().flatMap((item) =>
          item.cover ? [{ src: item.cover, publisher: item.publisher }] : [],
        )}
      />
      <CasesSection />
      <ContactsSection />
    </>
  )
}
