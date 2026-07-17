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
      className="shrink-0 flex items-center ml-4"
      aria-label="На главную — Шумская и Партнёры"
      data-header-logo=""
    >
      <Image src="/images/logo.svg" alt="Шумская и Партнёры" width={199} height={28} priority />
    </Link>
  )
}
