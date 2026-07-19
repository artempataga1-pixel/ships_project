'use client'

import { NAV_ITEMS } from '@/constants/nav'
import { LimelightNav } from '@/components/layout/LimelightNav'
import { LogoLink } from '@/components/layout/LogoLink'
import { handleStoryAwareAnchorClick } from '@/components/hero/useStoryController'

export function Header() {
  // z-[90] — ниже оверлея LogoIntro (z-[100]), если интро вернут
  return (
    // Чёрная плашка — только мобилка/планшет (<xl): без неё логотип сливается
    // с контентом секций при скролле (header прозрачный). На xl+ header
    // остаётся прозрачным, как и был.
    <header className="fixed top-0 inset-x-0 z-[90] bg-[var(--color-black)] xl:bg-transparent">
      <div className="max-w-[1440px] mx-auto h-12 px-8 flex items-center justify-between gap-8 xl:h-16">
        {/* Логотип — клиентский якорь «домой»: из любой точки сайта на hero.
            data-header-logo для LogoIntro внутри. */}
        <LogoLink />

        {/* Навигация — плоская, без фона-пилюли; relative нужен как offsetParent
            для лампы (LimelightNav измеряет offsetLeft относительно него).
            До 1280px (xl) — нижнее меню MobileBottomNav, эта прячется.
            Порог поднят с lg (1024px): на 1024–1279px (iPad landscape и
            похожие ширины) логотипу + 7 пунктам меню + CTA физически не
            хватает места в строке — переносится текст, обрезается кнопка. */}
        <nav aria-label="Основная навигация" className="relative hidden xl:block">
          <LimelightNav items={NAV_ITEMS} />
        </nav>

        {/* CTA — обычный <a>: на главной клик перехватывает Lenis (плавный скролл),
            с внутренних страниц «/#contacts» уводит на главную к секции.
            onClick — мягкий выход из стори (см. handleStoryAwareAnchorClick),
            иначе голый клик мимо контроллера намертво стопит Lenis.
            Эффект .btn-lime-fill: залита лаймом → при наведении белеет + лайм-glow.
            До 1280px (xl) — плавающая кнопка FloatingContactFab, эта прячется */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- намеренно нативный <a>: на главной клик перехватывает Lenis (плавный скролл к #contacts), Link здесь не нужен */}
        <a
          href="/#contacts"
          onClick={(e) => handleStoryAwareAnchorClick(e, 'contacts')}
          className="btn-lime-fill btn-outline-thin shrink-0 hidden xl:inline-flex items-center justify-center h-11 px-6 rounded-md text-sm font-semibold"
        >
          Связаться
        </a>
      </div>
    </header>
  )
}
