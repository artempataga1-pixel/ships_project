'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { HERO } from '@/constants/content/home'

// Круглая маска вокруг курсора — координаты приходят через --mx/--my.
// До 80% радиуса — полностью непрозрачно (внутри круга только второе видео,
// без «призрака» нижнего слоя), дальше узкая растушёвка до прозрачности
const SPOTLIGHT_MASK =
  'radial-gradient(circle 260px at var(--mx, -999px) var(--my, -999px), rgb(0 0 0) 0%, rgb(0 0 0) 80%, transparent 100%)'

export function SpotlightHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const introRef = useRef<HTMLVideoElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  // target (tx/ty) пишет pointermove, текущие (x/y) лерпает gsap.ticker — ноль ре-рендеров;
  // out = курсор за пределами секции, при возврате координаты телепортируются
  const pointer = useRef({ tx: -999, ty: -999, x: -999, y: -999, out: true })

  // Интро играет один раз и замирает на последнем кадре; прожектор доступен только после него
  const [introEnded, setIntroEnded] = useState(false)
  // Интро не загрузилось — вместо видео показываем статичный финальный кадр
  const [introFailed, setIntroFailed] = useState(false)

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
    // Вход в секцию (или первое движение) — телепорт без лерпа,
    // иначе прожектор «влетает» с места прошлого выхода
    if (p.out) {
      p.out = false
      p.x = p.tx
      p.y = p.ty
    }
    maskRef.current?.style.setProperty('opacity', '1')
  }

  // Курсор ушёл за границу секции — прожектор плавно гаснет
  function handlePointerLeave() {
    pointer.current.out = true
    maskRef.current?.style.setProperty('opacity', '0')
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
      onPointerLeave={handlePointerLeave}
      className="relative h-dvh overflow-hidden"
    >
      {/* Фолбэк: финальный кадр интро — только если видео не загрузилось.
          Всегда держать его под видео нельзя: он мелькает до отрисовки постера */}
      {introFailed && (
        <Image
          src="/images/backgrounds/hero-final.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="z-10 object-cover"
        />
      )}

      {/* Интро: дым собирает предметы на столе; играет один раз и замирает на последнем кадре.
          Постер = первый кадр видео, чтобы не было вспышки чужой картинки до старта */}
      <video
        ref={introRef}
        src="/video/hero-intro.mp4"
        poster="/images/backgrounds/hero-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onEnded={() => setIntroEnded(true)}
        onError={() => {
          setIntroFailed(true)
          setIntroEnded(true)
        }}
        className="absolute inset-0 z-20 h-full w-full object-cover"
      />

      {/* Прожектор: видео с искрами проявляется через радиальную маску вокруг курсора,
          монтируется только после окончания интро */}
      {videoSrc && introEnded && (
        <div
          ref={maskRef}
          aria-hidden
          className="absolute inset-0 z-30 transition-opacity duration-300"
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

      {/* Надпись на столе; transform внешнего div пишет GSAP (y/blur) */}
      <div
        ref={textRef}
        className="pointer-events-none absolute bottom-[4%] left-[4%] z-50 whitespace-nowrap"
      >
        <p className="text-[clamp(2.75rem,3.5vw,6rem)]/[1.05]">
          <span className="block font-hero uppercase text-hero-silver">
            {HERO.line1}
          </span>
          <span className="block font-hero uppercase text-hero-silver">
            {HERO.line2}
          </span>
          {/* «будущее —» — отдельным абзацем, по центру блока */}
          <span className="my-[0.35em] block text-center font-hero-italic italic text-hero-bronze">
            {HERO.line3}
          </span>
          <span className="block">
            <span className="font-hero uppercase text-hero-silver">
              {HERO.line4Accent}
            </span>{' '}
            <span className="font-hero-italic italic text-hero-bronze">
              {HERO.line4Rest}
            </span>
          </span>
        </p>
      </div>
    </section>
  )
}
