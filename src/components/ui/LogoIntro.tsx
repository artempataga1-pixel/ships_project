'use client'

import { useRef, useState, useEffect } from 'react'
import { gsap } from '@/lib/gsap'

export function LogoIntro() {
  const [visible, setVisible] = useState(true)
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const dismissed = useRef(false)

  const dismiss = () => {
    if (dismissed.current) return
    dismissed.current = true
    tlRef.current?.progress(1)
    sessionStorage.setItem('logo-intro-played', '1')
    setVisible(false)
  }

  useEffect(() => {
    // Интро проигрывается один раз за сессию
    if (sessionStorage.getItem('logo-intro-played')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- намеренный one-shot session-gate: интро раз за сессию
      setVisible(false)
      return
    }

    // Уважаем prefers-reduced-motion — без анимации, сразу к сайту
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('logo-intro-played', '1')
      setVisible(false)
      return
    }

    const logo = logoRef.current
    const overlay = overlayRef.current
    if (!logo || !overlay) return

    // Финальная цель — реальный логотип в хедере (data-header-logo на Link).
    // Позицию замеряем ЛЕНИВО, в момент старта перелёта (фаза 2): к тому времени
    // весь CSS/layout уже применён. Замер на mount в dev ловит недоформированную
    // раскладку контейнера (max-w + mx-auto) и лого промахивается мимо хедера.
    const fallback = { top: 12, left: 32, width: 199, height: 28 }
    const measureTarget = () => {
      const el = document.querySelector('[data-header-logo]') as HTMLElement | null
      if (!el) return fallback
      const r = el.getBoundingClientRect()
      return {
        top: Math.round(r.top),
        left: Math.round(r.left),
        width: Math.round(r.width) || fallback.width,
        height: Math.round(r.height) || fallback.height,
      }
    }

    // Ранний замер — только для формы/размера центральной версии (к пикселю не
    // критично). Финальную посадку считаем свежими function-based значениями.
    const initial = measureTarget()
    const aspect = initial.width / initial.height

    // Крупная центральная версия: ограничиваем и по ширине, и по высоте,
    // чтобы широкий логотип не вылез за края экрана
    const startWidth = Math.min(window.innerWidth * 0.66, window.innerHeight * 1.1 * aspect, 640)
    const startHeight = startWidth / aspect
    const startLeft = Math.round(window.innerWidth / 2 - startWidth / 2)
    const startTop = Math.round(window.innerHeight / 2 - startHeight / 2)

    // Фокус на оверлей — чтобы Escape срабатывал без предварительного клика
    overlay.focus()

    // Начальное состояние: центр экрана, скрыт
    gsap.set(logo, {
      position: 'absolute',
      width: startWidth,
      height: startHeight,
      top: startTop,
      left: startLeft,
      opacity: 0,
    })

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('logo-intro-played', '1')
        setVisible(false)
      },
    })

    // Фаза 1: появление в центре
    tl.to(logo, { opacity: 1, duration: 0.8, ease: 'power2.out' })
      // Свежий замер цели ровно в момент старта фазы 2 (layout уже стабилен) —
      // тот же тайминг, что раньше давали function-based top/left/width/height,
      // но здесь замер разовый и синхронный, без пересчёта на каждый кадр.
      // Layout геометрию элемента сразу переставляем на ЦЕЛЕВУЮ (хедерную) —
      // и в том же тике компенсируем transform'ом (x/y/scale), чтобы визуально
      // логотип остался на месте. Дальше твинится только transform: перелёт —
      // чистый compositor-слой, без рефлоу на каждый кадр (критично для мобилки).
      .call(() => {
        const target = measureTarget()
        gsap.set(logo, {
          top: target.top,
          left: target.left,
          width: target.width,
          height: target.height,
          transformOrigin: 'top left',
          x: startLeft - target.left,
          y: startTop - target.top,
          scale: startWidth / target.width,
        })
      })
      // Фаза 2: сжатие и перелёт точно в хедер — только transform
      .to(logo, { x: 0, y: 0, scale: 1, duration: 1.7, ease: 'power3.inOut' })
      // Фаза 3: оверлей тает, открывая сайт (лого уже стоит поверх хедерного)
      .to(overlay, { opacity: 0, duration: 0.4 })

    tlRef.current = tl

    return () => {
      tl.kill()
    }
  }, [])

  if (!visible) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Логотип компании"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-[var(--color-bg)] cursor-pointer"
      onClick={dismiss}
      onKeyDown={(e) => e.key === 'Escape' && dismiss()}
    >
      {/* Логотип скрыт через style (не className) — не зависит от порядка загрузки CSS */}
      <div ref={logoRef} style={{ opacity: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- статичный SVG-логотип в оверлее интро, next/image здесь избыточен */}
        <img
          src="/images/logo.svg"
          alt="Шумская и Партнёры"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--color-muted)] text-xs tracking-widest uppercase pointer-events-none select-none">
        Нажмите чтобы пропустить
      </p>
    </div>
  )
}
