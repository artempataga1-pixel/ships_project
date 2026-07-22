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
      {/* Мобилка/планшет: логотип мельче + invert (SVG залит #111 — на чёрной
          плашке header иначе не виден). Чёрная плашка держится до xl (1280px,
          см. Header.tsx), поэтому invert снимаем на том же пороге — на lg
          (1024px) плашка ещё чёрная, а лого уже тёмное было бы невидимым.
          Значок и текст — раздельные SVG (вырезаны из logo.svg), чтобы можно
          было анимировать только значок-монограмму, не задевая надпись.
          Значок — монограмма «Ш»+«П»: 3 левые ножки — буква «Ш» (плюс общий
          низ), 2 правые — буква «П» (плюс общая крышка). Инлайним SVG (не
          next/image), чтобы у каждой из 3 ножек «Ш» был свой path со своим
          transform-origin — только так можно схлопывать их по отдельности
          через CSS. Низ «Ш» и вся «П» остаются статикой. */}
      <svg
        viewBox="0 0 58.1 60.33"
        width={58}
        height={60}
        aria-hidden
        className="h-5 w-auto shrink-0 invert xl:h-7 xl:invert-0"
      >
        {/* Статика: правые 2 ножки «П» + низ «Ш» + крышка «П» */}
        <path
          d="M38.63,50.21V10.89H45.2V50.21ZM51.48,50.21V5.93H58V50.21ZM0,60.33V54.38H32.63v5.95ZM38.57,6V0H58V6Z"
          fill="#111"
        />
        {/* Левая ножка «Ш»: верхний край сжимается к нижнему (закреплённому) и обратно */}
        <path
          d="M0,54.49V10.89H6.62v43.6Z"
          fill="#111"
          className="origin-bottom animate-logo-stripe [transform-box:fill-box]"
        />
        {/* Центральная ножка «Ш»: оба края сжимаются к середине и обратно */}
        <path
          d="M13.18,50.32V10.89h6.64V50.32Z"
          fill="#111"
          className="origin-center animate-logo-stripe [animation-delay:0.87s] [transform-box:fill-box]"
        />
        {/* Правая ножка «Ш»: нижний край сжимается к верхнему (закреплённому) и обратно */}
        <path
          d="M26.02,50.21V10.89h6.64V50.21Z"
          fill="#111"
          className="origin-top animate-logo-stripe [animation-delay:1.73s] [transform-box:fill-box]"
        />
      </svg>
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
