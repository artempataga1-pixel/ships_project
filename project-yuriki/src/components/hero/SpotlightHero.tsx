'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { HERO } from '@/constants/content/home'

// Мягкая круглая маска вокруг курсора — координаты приходят через --mx/--my
const SPOTLIGHT_MASK =
  'radial-gradient(circle 260px at var(--mx, -999px) var(--my, -999px), rgb(0 0 0) 0%, rgb(0 0 0 / 0.85) 55%, transparent 100%)'

export function SpotlightHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const introRef = useRef<HTMLVideoElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  // target (tx/ty) пишет pointermove, текущие (x/y) лерпает gsap.ticker — ноль ре-рендеров
  const pointer = useRef({ tx: -999, ty: -999, x: -999, y: -999 })

  // Интро играет один раз и замирает на последнем кадре; прожектор доступен только после него
  const [introEnded, setIntroEnded] = useState(false)

  // Видео-слой монтируется только на устройствах с мышью и только после гидрации
  // (SSR всегда рендерит без видео → нет hydration mismatch, на тачах слой не появляется вовсе)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)

  useEffect(() => {
    const v = introRef.current
    if (!v) return
    // Перемотка на последний кадр — финальное состояние без проигрывания
    const jumpToEnd = () => {
      const toEnd = () => {
        v.currentTime = v.duration
      }
      if (v.readyState >= 1) toEnd()
      else v.addEventListener('loadedmetadata', toEnd, { once: true })
      v.pause()
      setIntroEnded(true)
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      jumpToEnd()
      return
    }
    // Страховка: если autoplay заблокирован политикой браузера — сразу финальный кадр
    v.play().catch(jumpToEnd)
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    // Выбор по физическому разрешению: ретина-ноутбук с окном 1440 CSS-px — это 2880 физических
    setVideoSrc(
      window.innerWidth * window.devicePixelRatio > 2200
        ? '/video/hero-spotlight-2k.mp4'
        : '/video/hero-spotlight-1080.mp4',
    )
  }, [])

  useEffect(() => {
    if (!videoSrc || !introEnded) return

    // Страховка: если autoplay не стартовал сам (политика браузера)
    videoRef.current?.play().catch(() => {})

    const p = pointer.current
    const update = () => {
      p.x += (p.tx - p.x) * 0.1
      p.y += (p.ty - p.y) * 0.1
      maskRef.current?.style.setProperty('--mx', `${p.x}px`)
      maskRef.current?.style.setProperty('--my', `${p.y}px`)
    }
    // Общий тик с Lenis (SmoothScrollProvider), не отдельный rAF
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [videoSrc, introEnded])

  function handlePointerMove(e: React.PointerEvent) {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    const p = pointer.current
    p.tx = e.clientX - rect.left
    p.ty = e.clientY - rect.top
    // Первое движение — телепорт без лерпа, иначе прожектор «влетает» с края экрана
    if (p.x === -999) {
      p.x = p.tx
      p.y = p.ty
    }
  }

  // Появление надписи: подъём + расфокус; при reduced-motion — сразу конечное состояние
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 28, filter: 'blur(12px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.4,
        },
      )
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative h-dvh overflow-hidden"
    >
      {/* База: тёмный кабинет (фолбэк, если интро-видео не загрузилось) */}
      <Image
        src="/images/backgrounds/hero-base.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="z-10 object-cover"
      />

      {/* Интро: дым собирает предметы на столе; играет один раз и замирает на последнем кадре */}
      <video
        ref={introRef}
        src="/video/hero-intro.mp4"
        poster="/images/backgrounds/hero-start.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={() => setIntroEnded(true)}
        onError={() => setIntroEnded(true)}
        className="absolute inset-0 z-20 h-full w-full object-cover"
      />

      {/* Прожектор: видео с искрами проявляется через радиальную маску вокруг курсора,
          монтируется только после окончания интро */}
      {videoSrc && introEnded && (
        <div
          ref={maskRef}
          aria-hidden
          className="absolute inset-0 z-30"
          style={{
            maskImage: SPOTLIGHT_MASK,
            WebkitMaskImage: SPOTLIGHT_MASK,
            transform: 'translateZ(0)',
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Надпись на столе — лёгкий разворот в перспективе, правый край ближе к зрителю.
          Поворот на внутреннем <p>: transform внешнего div пишет GSAP (y/blur) */}
      <div
        ref={textRef}
        className="pointer-events-none absolute bottom-[6%] left-[6%] z-50 max-w-[46%]"
        style={{ perspective: '900px' }}
      >
        <p
          className="font-hero font-medium text-[4.25rem]/[1.25] text-white"
          style={{
            transform: 'rotateY(14deg)',
            transformOrigin: 'left center',
          }}
        >
          {HERO.phrase}
        </p>
      </div>
    </section>
  )
}
