'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import { isStoryActive, STORY_GOTO_EVENT } from '@/components/hero/useStoryController'

// Логотип-якорь: из любой точки сайта возвращает на hero-блок главной.
// — стори жива (десктоп, главная) — мгновенный goto на шаг 0, контроллер сам
//   разруливает released-состояние (вернёт скролл к нулю и запрёт страницу);
// — flow-режим на главной (мобилка/reduced-motion) — плавный скролл Lenis к нулю;
// — внутренняя страница (кейс) — обычный переход Next на «/», стори стартует с hero.
export function LogoLink() {
  const pathname = usePathname()
  const lenis = useLenis()

  const onClick = (e: React.MouseEvent) => {
    if (isStoryActive()) {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent(STORY_GOTO_EVENT, { detail: { step: 0 } }))
      return
    }
    if (pathname === '/') {
      e.preventDefault()
      if (lenis) {
        lenis.scrollTo(0)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <Link
      href="/"
      onClick={onClick}
      className="shrink-0 flex items-center ml-4 [perspective:400px]"
      aria-label="На главную — Шумская и Партнёры"
      data-header-logo=""
    >
      {/* Мобилка/планшет: логотип мельче + invert (SVG залит #111 — на чёрной
          плашке header иначе не виден). Чёрная плашка держится до xl (1280px,
          см. Header.tsx), поэтому invert снимаем на том же пороге — на lg
          (1024px) плашка ещё чёрная, а лого уже тёмное было бы невидимым.
          Значок и текст — раздельные SVG (вырезаны из logo.svg), чтобы можно
          было крутить только значок-монограмму, не задевая надпись. */}
      <Image
        src="/images/logo-icon.svg"
        alt=""
        aria-hidden
        width={58}
        height={60}
        priority
        className="h-5 w-auto shrink-0 animate-logo-spin invert xl:h-7 xl:invert-0"
      />
      <Image
        src="/images/logo-text.svg"
        alt="Шумская и Партнёры"
        width={348}
        height={60}
        priority
        className="ml-1.5 h-5 w-auto invert xl:ml-2 xl:h-7 xl:invert-0"
      />
    </Link>
  )
}
