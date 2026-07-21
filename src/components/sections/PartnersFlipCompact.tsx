'use client'

import { SectionHeading } from '@/components/ui/SectionHeading'
import { MobilePartnerCard, MOBILE_TEAM_ORDER } from './PartnersSection'

/* Компактная мобильная раскладка партнёров для MobileScrubScene — те же
   карточки-визитки с переворотом по тапу (лицо — фото, обратная сторона —
   регалии), что в flow-фолбэке PartnersSection (reduced-motion) и на проде,
   но втиснутые в фиксированную область одного шага scroll-scrub вместо
   обычного потока страницы. Логика флипа не дублируется — MobilePartnerCard
   переиспользуется как есть. */
export function PartnersFlipCompact() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-6">
      <SectionHeading
        id="partners-heading-compact"
        title="Партнёры"
        subtitle="Профессиональная защита в ключевых областях права"
        className="text-center"
      />

      <div className="mx-auto grid w-full max-w-[280px] grid-cols-1 gap-4">
        {MOBILE_TEAM_ORDER.map((member) => (
          <MobilePartnerCard key={member.name} member={member} compact />
        ))}
      </div>
    </div>
  )
}
