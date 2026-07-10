import Link from 'next/link'
import Image from 'next/image'
import { X, Send, ExternalLink } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/nav'
import { CONTACT_INFO } from '@/constants/content/contacts'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-soft)]">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* Лого + описание + соцсети */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="На главную">
              <Image
                src="/images/logo.svg"
                alt="Шумская и Партнёры"
                width={227}
                height={32}
              />
            </Link>
            <p
              className="text-sm text-[var(--color-muted)] leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Шумская и Партнёры<br />
              Юридическая компания
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="#"
                aria-label="Twitter"
                className="text-[var(--color-muted)] hover:text-[var(--color-lime-ink)] transition-colors duration-200"
              >
                <X size={18} />
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="text-[var(--color-muted)] hover:text-[var(--color-lime-ink)] transition-colors duration-200"
              >
                <Send size={18} />
              </a>
              <a
                href="#"
                aria-label="Официальный сайт"
                className="text-[var(--color-muted)] hover:text-[var(--color-lime-ink)] transition-colors duration-200"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-5">
              Навигация
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  {/* Обычный <a> — якорный клик перехватывает Lenis (плавный скролл) */}
                  <a
                    href={item.href}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-lime-ink)] transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-muted)] mb-5">
              Контакты
            </p>
            <div
              className="flex flex-col gap-3 text-sm text-[var(--color-muted)]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <a
                href={`tel:+${CONTACT_INFO.phone.replace(/\D/g, '')}`}
                className="hover:text-[var(--color-lime-ink)] transition-colors duration-200"
              >
                {CONTACT_INFO.phone}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="hover:text-[var(--color-lime-ink)] transition-colors duration-200"
              >
                {CONTACT_INFO.email}
              </a>
              <span>{CONTACT_INFO.address}</span>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-10 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>© {new Date().getFullYear()} Шумская и Партнёры. Все права защищены.</span>
          <span>Юридическая компания</span>
        </div>
      </div>
    </footer>
  )
}
