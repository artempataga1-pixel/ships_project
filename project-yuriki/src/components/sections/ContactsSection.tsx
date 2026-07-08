import Image from 'next/image'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Marquee } from '@/components/ui/Marquee'
import { CONTACT_INFO, FOUNDERS, MEDIA_MENTIONS } from '@/constants/content/contacts'
import type { Founder } from '@/types/content'
import { ContactForm } from './ContactForm'

/* Референс — reference 2/kontakti.mp4 (landonorris.com): бегущая строка
   лого спонсоров идёт по всей ширине блока одним непрерывным потоком,
   а вырезанная фигура гонщика лежит поверх неё (z-index выше) — там,
   где силуэт перекрывает строку, она визуально скрыта его непрозрачными
   пикселями, по бокам продолжает бежать без прерывания. Здесь та же
   механика: двое учредителей по краям вместо гонщика по центру, строка —
   реальные СМИ и рейтинги фирмы вместо брендов-спонсоров, бронзовый/
   холодный акцент вместо ядовито-зелёного Lando. */

export function ContactsSection() {
  return (
    <section id="contacts" className="min-h-dvh flex items-center bg-black overflow-x-hidden">
      <div className="max-w-[1440px] w-full mx-auto px-8 md:px-16 py-24 md:py-32">
        <SectionHeading
          title="Контакты"
          subtitle="Свяжитесь с нами — ответим в течение рабочего дня"
          className="text-center"
        />

        {/* Десктоп: учредители по краям, строка СМИ едет позади них, реквизиты и форма — по центру.
            Высоту всему блоку задаёт центральная колонка (обычный поток) — фото и строка от неё
            позиционируются абсолютно, поэтому не обрезают форму и не зависят от её длины. */}
        <div className="relative hidden lg:block mt-20">
          <div className="mx-auto max-w-lg grid gap-8 px-[300px] xl:px-[360px] relative z-10">
            <RevealOnScroll delay={0}>
              <div className="flex flex-col gap-8 rounded-lg border border-[var(--color-card-border)]/30 bg-gradient-to-b from-zinc-800 to-zinc-900 p-8">
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
                <div className="pt-6 border-t border-[var(--color-card-border)]/20">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Режим работы</p>
                  <p className="text-white/70">Пн–Пт: 9:00 — 19:00</p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.15}>
              <div className="border border-[var(--color-card-border)]/30 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg p-8">
                <ContactForm />
              </div>
            </RevealOnScroll>
          </div>

          {/* Строка СМИ — позади всего, полоса на уровне ног учредителей */}
          <div className="absolute inset-x-[-4rem] bottom-24 z-0 py-5 border-y border-[var(--color-card-border)]/20">
            <Marquee
              items={MEDIA_MENTIONS}
              duration={34}
              itemClassName="font-heading text-4xl xl:text-5xl font-extrabold uppercase tracking-wide text-[var(--color-accent-cold)]/70"
            />
          </div>

          <FounderPhoto founder={FOUNDERS[0]} side="left" />
          <FounderPhoto founder={FOUNDERS[1]} side="right" />
        </div>

        {/* Мобильная и планшетная раскладка — без драматичной композиции, просто и функционально */}
        <div className="lg:hidden mt-16">
          <div className="py-4 border-y border-[var(--color-card-border)]/20">
            <Marquee
              items={MEDIA_MENTIONS}
              duration={22}
              itemClassName="font-heading text-lg sm:text-2xl font-extrabold uppercase tracking-wide text-[var(--color-accent-cold)]/70"
            />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {FOUNDERS.map((founder) => (
              <div key={founder.name} className="flex flex-col items-center text-center gap-2">
                <div className="relative w-28 sm:w-36 aspect-square rounded-full overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900 border border-[var(--color-card-border)]/30">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <p className="font-heading text-sm font-extrabold leading-snug">{founder.name}</p>
                <p className="text-xs text-white/50">{founder.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-10">
            <RevealOnScroll delay={0}>
              <div className="flex flex-col gap-8">
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
      </div>
    </section>
  )
}

interface FounderPhotoProps {
  founder: Founder
  side: 'left' | 'right'
}

function FounderPhoto({ founder, side }: FounderPhotoProps) {
  return (
    <div
      className={`absolute bottom-0 z-10 w-[280px] xl:w-[320px] ${side === 'left' ? 'left-0' : 'right-0'}`}
    >
      <Image
        src={founder.image}
        alt={founder.name}
        width={founder.imageWidth}
        height={founder.imageHeight}
        className="w-full h-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
        priority={false}
      />
      <div className="text-center mt-3">
        <p className="font-heading text-sm font-extrabold leading-snug">{founder.name}</p>
        <p className="mt-1 text-xs text-white/50 uppercase tracking-wider">{founder.role}</p>
      </div>
    </div>
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
