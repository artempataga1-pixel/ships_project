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
          Значок — монограмма «Ш»+«П»: 3 ножки «Ш» (A,B,C) + общий низ, 2
          ножки «П» (D,E) + общая крышка. По факту геометрии низ касается
          только ножки A, а крышка — только ножки E (левая ножка D висит
          отдельно с зазором) — поэтому A+низ и крышка+E объединены в два
          Г-образных path и анимируются двухфазным clip-path (сначала
          сжатие вдоль вертикали до угла, потом вдоль горизонтали до
          противоположного края). B, C, D — независимые ножки, простой
          scaleY-pulse. Волна идёт слева направо (задержки 0/0.5/1/1.5/2s). */}
      <svg
        viewBox="0 0 58.1 60.33"
        width={58}
        height={60}
        aria-hidden
        className="h-5 w-auto shrink-0 invert xl:h-7 xl:invert-0"
      >
        <defs>
          {/* Клип для A+низ: в покое открыт целиком (rest), сжимается сверху
              вниз до угла (низ ножки A), затем вдоль низа слева направо */}
          <clipPath id="logo-clip-a-base">
            <rect className="animate-logo-legbase-pulse" x="0" y="10.89" width="32.63" height="49.44" />
          </clipPath>
          {/* Клип для крышка+E: зеркально — снизу вверх до угла, затем вдоль крышки справа налево */}
          <clipPath id="logo-clip-crown-e">
            <rect
              className="animate-logo-crown-pulse [animation-delay:2s]"
              x="38.57"
              y="0"
              width="19.43"
              height="50.21"
            />
          </clipPath>
        </defs>
        {/* A + низ «Ш»: единый Г-путь (реальное касание геометрии) */}
        <path d="M0,10.89H6.62V54.38H32.63V60.33H0Z" fill="#111" clipPath="url(#logo-clip-a-base)" />
        {/* Центральная ножка «Ш»: оба края сжимаются к середине и обратно, с задержкой — волна идёт слева направо */}
        <path
          d="M13.18,50.32V10.89h6.64V50.32Z"
          fill="#111"
          className="origin-center animate-logo-stripe [animation-delay:0.5s] [transform-box:fill-box]"
        />
        {/* Правая ножка «Ш»: нижний край сжимается к верхнему (закреплённому) и обратно */}
        <path
          d="M26.02,50.21V10.89h6.64V50.21Z"
          fill="#111"
          className="origin-top animate-logo-stripe [animation-delay:1s] [transform-box:fill-box]"
        />
        {/* Левая ножка «П»: висит отдельно от крышки (зазор), простой pulse от верхнего края */}
        <path
          d="M38.63,50.21V10.89H45.2V50.21Z"
          fill="#111"
          className="origin-top animate-logo-stripe [animation-delay:1.5s] [transform-box:fill-box]"
        />
        {/* Крышка «П» + правая ножка E: единый Г-путь (реальное касание геометрии) */}
        <path d="M38.57,0H58V50.21H51.48V6H38.57Z" fill="#111" clipPath="url(#logo-clip-crown-e)" />
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
