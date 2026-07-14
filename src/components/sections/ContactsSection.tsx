import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import type { ComponentType } from 'react'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { Marquee } from '@/components/ui/Marquee'
import { CONTACT_INFO, MEDIA_MENTIONS } from '@/constants/content/contacts'
import { ContactForm } from './ContactForm'

/* Бегущая строка СМИ — full-bleed на всю ширину экрана (вырывается за max-w
   контейнера через left-1/2 -translate-x-1/2 w-screen). Механика Marquee
   сохранена (CSS-анимация, дублирование x2). Рендерим единым uppercase-текстом:
   логотипы-файлы вшиты старым холодным цветом #AAD2FF (голубой прошлой тёмной
   темы) и на светлой лайм-теме смотрелись бы чужеродно — на dizain9 это ровный
   текстовый ряд, первый пункт — лайм-акцентом. */
const mediaItems = MEDIA_MENTIONS.map((mention) => (
  <span
    key={mention.name}
    className="font-heading text-sm md:text-base font-extrabold uppercase tracking-[0.02em] whitespace-nowrap text-[var(--color-lime-ink)]"
  >
    {mention.name}
  </span>
))

export function ContactsSection() {
  return (
    <section
      id="contacts"
      className="relative flex min-h-dvh items-center overflow-hidden bg-[var(--color-bg)] py-24 md:py-28 lg:py-[min(7.78vh,7rem)]"
    >
      {/* Мягкий лайм-glow + светлый вертикальный градиент секции */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 38%, var(--color-lime-soft), transparent 24%), linear-gradient(180deg,#ffffff 0%,#fafafa 60%,#f7f7f5 100%)',
          opacity: 0.6,
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-16">
        {/* Заголовок по центру с короткой лайм-чертой */}
        <RevealOnScroll className="text-center">
          <h2 className="font-heading text-[clamp(2.75rem,7vw,4.5rem)] font-extrabold uppercase leading-[1] tracking-[-0.055em] text-[var(--color-text)] lg:text-[min(5vh,4.5rem)]">
            Контакты
          </h2>
          <span
            aria-hidden
            className="mx-auto mt-5 block h-[2px] w-12 lg:mt-[min(1.39vh,1.25rem)]"
            style={{
              background: 'var(--color-lime)',
              boxShadow: '0 0 14px var(--color-lime-glow)',
            }}
          />
          <p className="mt-5 text-lg font-medium text-[var(--color-text)] md:text-xl lg:mt-[min(1.39vh,1.25rem)] lg:text-[clamp(0.875rem,1.39vh,1.25rem)]">
            Свяжитесь с нами — и ответим в течение рабочего дня
          </p>
        </RevealOnScroll>

        {/* Строка СМИ — на всю ширину экрана, механика Marquee сохранена */}
        <div className="relative left-1/2 mt-14 w-screen -translate-x-1/2 border-y border-[var(--color-line)] py-4 lg:mt-[min(3.89vh,3.5rem)] lg:py-[min(1.11vh,1rem)]">
          <Marquee
            items={mediaItems}
            duration={34}
            separator={<span className="text-[var(--color-lime-ink)]">·</span>}
            srLabel={`СМИ и рейтинги о нас: ${MEDIA_MENTIONS.map((m) => m.name).join(', ')}`}
          />
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-8 lg:mt-[min(3.89vh,3.5rem)] lg:grid-cols-[1fr_1.18fr] lg:gap-10">
          {/* Левая карточка — контактная информация */}
          <RevealOnScroll delay={0}>
            <div
              className="relative flex h-full flex-col justify-center gap-9 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 sm:p-12 lg:gap-[min(2.5vh,2.25rem)] lg:p-[min(3.33vh,3rem)]"
              style={{
                borderRight: '4px solid var(--color-lime)',
                boxShadow:
                  '0 28px 80px rgba(0,0,0,.06), 0 0 34px rgba(201,255,31,.10)',
              }}
            >
              <ContactInfoRow
                icon={Phone}
                label="Телефон"
                value={CONTACT_INFO.phone}
                href={`tel:+${CONTACT_INFO.phone.replace(/\D/g, '')}`}
              />
              <ContactInfoRow
                icon={Mail}
                label="E-mail"
                value={CONTACT_INFO.email}
                href={`mailto:${CONTACT_INFO.email}`}
              />
              <ContactInfoRow icon={MapPin} label="Адрес" value={CONTACT_INFO.address} />
              <ContactInfoRow icon={Clock} label="Режим работы" value="Пн–Пт: 9:00 – 18:00" />

              {/* Нижняя лайм-полоса карточки */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-[var(--radius-md)]"
                style={{ background: 'var(--color-lime)' }}
              />
            </div>
          </RevealOnScroll>

          {/* Правая карточка — форма */}
          <RevealOnScroll delay={0.15}>
            <div
              className="h-full rounded-[var(--radius-md)] border border-[var(--color-line)] p-6 sm:p-10 lg:p-[min(2.78vh,2.5rem)]"
              style={{
                background: 'linear-gradient(180deg,#ffffff,#fbfbfa)',
                boxShadow: '0 24px 70px rgba(0,0,0,.05)',
              }}
            >
              <ContactForm />
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  )
}

interface ContactInfoRowProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
  href?: string
}

function ContactInfoRow({ icon: Icon, label, value, href }: ContactInfoRowProps) {
  return (
    <div className="grid grid-cols-[48px_1fr] items-center gap-5 lg:grid-cols-[clamp(2.25rem,3.33vh,3rem)_1fr]">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full text-[var(--color-lime-ink)] lg:h-[clamp(2.25rem,3.33vh,3rem)] lg:w-[clamp(2.25rem,3.33vh,3rem)]"
        style={{ background: 'rgba(201,255,31,.18)' }}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
      </span>
      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.06em] text-[var(--color-lime-ink)]">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="block text-xl font-extrabold leading-tight text-[var(--color-text)] transition-colors duration-200 hover:text-[var(--color-lime-ink)] md:text-2xl lg:text-[clamp(1rem,1.67vh,1.5rem)]"
          >
            {value}
          </a>
        ) : (
          <p className="text-xl font-extrabold leading-tight text-[var(--color-text)] md:text-2xl lg:text-[clamp(1rem,1.67vh,1.5rem)]">
            {value}
          </p>
        )}
      </div>
    </div>
  )
}
