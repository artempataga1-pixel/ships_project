import { SectionHeading } from '@/components/ui/SectionHeading'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { CONTACT_INFO } from '@/constants/content/contacts'
import { ContactForm } from './ContactForm'

export function ContactsSection() {
  return (
    <section id="contacts" className="min-h-dvh flex items-center bg-black">
      <div className="max-w-[1440px] w-full mx-auto px-16 py-32">
        <SectionHeading
          title="Контакты"
          subtitle="Свяжитесь с нами — ответим в течение рабочего дня"
        />

        <div className="mt-20 grid grid-cols-2 gap-24 items-start">
          {/* Реквизиты */}
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
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                  Режим работы
                </p>
                <p className="text-white/70">Пн–Пт: 9:00 — 19:00</p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Форма */}
          <RevealOnScroll delay={0.15}>
            <div className="border border-[var(--color-card-border)]/30 bg-white/[0.02] backdrop-blur-sm rounded-lg p-10">
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
