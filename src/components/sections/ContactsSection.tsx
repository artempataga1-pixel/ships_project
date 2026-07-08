import Image from 'next/image'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Marquee } from '@/components/ui/Marquee'
import { CONTACT_INFO, MEDIA_MENTIONS } from '@/constants/content/contacts'
import { ContactForm } from './ContactForm'

/* Бегущая строка СМИ и рейтингов — full-bleed на всю ширину экрана
   (вырывается за пределы max-w контейнера через left-1/2 -translate-x-1/2
   w-screen), тонкая полоса без остановки. Логотипы перекрашены в единый
   holodный accent-cold ПРЯМО В ФАЙЛАХ (pillow для PNG, fill в разметке
   SVG) — так бренд-цвета изданий не спорят со стилистикой сайта. Не через
   CSS filter: Next Image Optimizer пережимает эти PNG в paletted PNG, а
   Chrome ломает альфа-прозрачность при filter поверх paletted PNG
   (сплошная плашка вместо текста). unoptimized — файлы весят пару
   килобайт, оптимизация всё равно не нужна. */

const mediaItems = MEDIA_MENTIONS.map((mention) =>
  mention.logo ? (
    <Image
      key={mention.name}
      src={mention.logo}
      alt={mention.name}
      width={mention.logoWidth}
      height={mention.logoHeight}
      unoptimized
      className="h-7 md:h-9 w-auto opacity-70"
    />
  ) : (
    <span
      key={mention.name}
      className="font-heading text-xl md:text-2xl font-extrabold uppercase tracking-wide text-[var(--color-accent-cold)]/70"
    >
      {mention.name}
    </span>
  ),
)

export function ContactsSection() {
  return (
    <section id="contacts" className="min-h-dvh flex items-center bg-black overflow-x-hidden">
      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-32">
        <SectionHeading
          title="Контакты"
          subtitle="Свяжитесь с нами — ответим в течение рабочего дня"
          className="text-center"
        />

        {/* Строка СМИ — на всю ширину экрана, от края до края */}
        <div className="relative left-1/2 -translate-x-1/2 w-screen mt-16 py-4 border-y border-[var(--color-card-border)]/20">
          <Marquee
            items={mediaItems}
            duration={30}
            srLabel={`СМИ и рейтинги о нас: ${MEDIA_MENTIONS.map((m) => m.name).join(', ')}`}
          />
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <RevealOnScroll delay={0}>
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-8">
                <ContactInfoItem
                  label="Телефон"
                  value={CONTACT_INFO.phone}
                  href={`tel:+${CONTACT_INFO.phone.replace(/\D/g, '')}`}
                />
                <ContactInfoItem
                  label="Email"
                  value={CONTACT_INFO.email}
                  href={`mailto:${CONTACT_INFO.email}`}
                />
                <ContactInfoItem label="Адрес" value={CONTACT_INFO.address} />
              </div>

              <div className="pt-8 border-t border-[var(--color-card-border)]/20">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Режим работы</p>
                <p className="text-white/70">Пн–Пт: 9:00 — 19:00</p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.15}>
            <div className="border border-[var(--color-card-border)]/30 bg-white/[0.02] backdrop-blur-sm rounded-lg p-6 sm:p-10">
              <ContactForm />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}

interface ContactInfoItemProps {
  label: string
  value: string
  href?: string
}

function ContactInfoItem({ label, value, href }: ContactInfoItemProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
      {href ? (
        <a
          href={href}
          className="text-lg text-white/85 hover:text-[var(--color-accent-cold)] transition-colors duration-200"
        >
          {value}
        </a>
      ) : (
        <p className="text-lg text-white/85">{value}</p>
      )}
    </div>
  )
}
