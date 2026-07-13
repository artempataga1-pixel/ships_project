import Link from 'next/link'
import Image from 'next/image'
import { NAV_ITEMS } from '@/constants/nav'
import { LimelightNav } from '@/components/layout/LimelightNav'

export function Header() {
  // z-[90] — ниже оверлея LogoIntro (z-[100]), если интро вернут
  return (
    <header className="fixed top-0 inset-x-0 z-[90]">
      <div className="max-w-[1440px] mx-auto h-16 px-8 flex items-center justify-between gap-8">
        {/* Логотип — data-header-logo для LogoIntro анимации.
            Тёмная плашка убрана: тёмное лого на светлом фоне хедера. */}
        <Link
          href="/"
          className="shrink-0 flex items-center ml-4"
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

        {/* Навигация — плоская, без фона-пилюли; relative нужен как offsetParent
            для лампы (LimelightNav измеряет offsetLeft относительно него) */}
        <nav aria-label="Основная навигация" className="relative">
          <LimelightNav items={NAV_ITEMS} />
        </nav>

        {/* CTA — обычный <a>: на главной клик перехватывает Lenis (плавный скролл),
            с внутренних страниц «/#contacts» уводит на главную к секции.
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- намеренно нативный <a>: на главной клик перехватывает Lenis (плавный скролл к #contacts), Link здесь не нужен */}
        <a
          href="/#contacts"
          className="btn-lime-fill btn-outline-thin shrink-0 inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          Связаться
        </a>
      </div>
    </header>
  )
}
