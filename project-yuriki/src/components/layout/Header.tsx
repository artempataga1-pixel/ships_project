import Link from 'next/link'
import Image from 'next/image'
import { NAV_ITEMS } from '@/constants/nav'
import { LimelightNav } from '@/components/layout/LimelightNav'

export function Header() {
  // z-[90] — ниже оверлея LogoIntro (z-[100]), если интро вернут
  return (
    <header className="fixed top-0 inset-x-0 z-[90]">
      <div className="max-w-[1440px] mx-auto h-16 px-8 flex items-center justify-between gap-8">
        {/* Логотип — data-header-logo для LogoIntro анимации */}
        <Link
          href="/"
          className="shrink-0 flex items-center ml-4 rounded-xl bg-black/75 backdrop-blur-sm px-4 py-2"
          aria-label="На главную — Шумская и Партнёры"
          data-header-logo=""
        >
          <Image
            src="/images/logo.svg"
            alt="Шумская и Партнёры"
            width={199}
            height={28}
            priority
          />
        </Link>

        {/* Пилюля с навигацией; без overflow-hidden — лампа выступает над кромкой */}
        <nav
          aria-label="Основная навигация"
          className="relative rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2"
        >
          <LimelightNav items={NAV_ITEMS} />
        </nav>

        {/* CTA — обычный <a>: якорный клик перехватывает Lenis (плавный скролл) */}
        <a
          href="#contacts"
          className="shrink-0 bg-white text-[#262424] text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/85 transition-colors duration-200"
        >
          Связаться
        </a>
      </div>
    </header>
  )
}
