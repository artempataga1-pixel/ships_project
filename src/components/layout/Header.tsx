import Link from 'next/link'
import Image from 'next/image'
import { NAV_ITEMS } from '@/constants/nav'
import { NavLanternItem } from '@/components/layout/NavLanternItem'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="border-b border-white/10"
        style={{
          backgroundColor: 'rgba(38, 36, 36, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
          {/* Логотип — data-header-logo для LogoIntro анимации */}
          <Link
            href="/"
            className="shrink-0 flex items-center"
            aria-label="На главную — Шумская и Партнёры"
            data-header-logo=""
          >
            <Image
              src="/images/logo.svg"
              alt="Шумская и Партнёры"
              width={36}
              height={36}
              priority
            />
          </Link>

          {/* Навигация */}
          <nav aria-label="Основная навигация" className="flex-1 flex justify-center">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <NavLanternItem key={item.href} item={item} />
              ))}
            </ul>
          </nav>

          {/* CTA */}
          <Link
            href="/contacts"
            className="shrink-0 text-sm font-medium px-5 py-2 border border-[rgba(170,210,255,0.6)] text-[rgba(170,210,255,0.9)] rounded-sm hover:bg-[rgba(170,210,255,0.9)] hover:text-[#262424] hover:border-[rgba(170,210,255,0.9)] transition-all duration-200"
          >
            Связаться
          </Link>
        </div>
      </div>
    </header>
  )
}
