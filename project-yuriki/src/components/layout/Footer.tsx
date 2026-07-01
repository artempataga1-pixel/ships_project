import Link from 'next/link'
import Image from 'next/image'
import { X, Send, ExternalLink } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/nav'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#1e1c1c]">
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <div className="grid grid-cols-3 gap-12">
          {/* Лого + описание + соцсети */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="На главную">
              <Image
                src="/images/logo.svg"
                alt="Шумская и Партнёры"
                width={40}
                height={40}
              />
            </Link>
            <p
              className="text-sm text-white/50 leading-relaxed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Шумская и Партнёры<br />
              Юридическая компания
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="#"
                aria-label="Twitter"
                className="text-white/35 hover:text-white/70 transition-colors duration-200"
              >
                <X size={18} />
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="text-white/35 hover:text-white/70 transition-colors duration-200"
              >
                <Send size={18} />
              </a>
              <a
                href="#"
                aria-label="Внешняя ссылка"
                className="text-white/35 hover:text-white/70 transition-colors duration-200"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30 mb-5">
              Навигация
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/55 hover:text-white/90 transition-colors duration-200"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30 mb-5">
              Контакты
            </p>
            <div
              className="flex flex-col gap-3 text-sm text-white/55"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <a
                href="tel:+74950000000"
                className="hover:text-white/90 transition-colors duration-200"
              >
                +7 (495) 000-00-00
              </a>
              <a
                href="mailto:info@shumskaya.ru"
                className="hover:text-white/90 transition-colors duration-200"
              >
                info@shumskaya.ru
              </a>
              <span>Москва, ул. Примерная, д. 1</span>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
          <span>© {new Date().getFullYear()} Шумская и Партнёры. Все права защищены.</span>
          <span>Юридическая компания</span>
        </div>
      </div>
    </footer>
  )
}
