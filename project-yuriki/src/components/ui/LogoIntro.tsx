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
    // Если уже показывали в этой сессии — скрыть без анимации
    if (sessionStorage.getItem('logo-intro-played')) {
      setVisible(false)
      return
    }

    const logo = logoRef.current
    const overlay = overlayRef.current
    if (!logo || !overlay) return

    const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 1.5)
    const startLeft = Math.floor(window.innerWidth / 2 - size / 2)
    const startTop = Math.floor(window.innerHeight / 2 - size / 2)

    // Координаты логотипа в header (data-header-logo на Link)
    const headerLogoEl = document.querySelector('[data-header-logo]') as HTMLElement | null
    let targetTop = 12
    let targetLeft = 16
    let targetSize = 36

    if (headerLogoEl) {
      const rect = headerLogoEl.getBoundingClientRect()
      targetTop = Math.round(rect.top)
      targetLeft = Math.round(rect.left)
      targetSize = Math.round(rect.width) || 36
    }

    // Фокус на оверлей — чтобы Escape срабатывал без предварительного клика
    overlay.focus()

    // Устанавливаем начальную позицию (центр экрана, скрыт)
    gsap.set(logo, {
      position: 'absolute',
      width: size,
      height: size,
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
      // Фаза 2: сжатие и перелёт в header
      .to(logo, {
        top: targetTop,
        left: targetLeft,
        width: targetSize,
        height: targetSize,
        duration: 1.7,
        ease: 'power3.inOut',
      })
      // Фаза 3: оверлей тает
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
      className="fixed inset-0 z-[100] bg-[#262424] cursor-pointer"
      onClick={dismiss}
      onKeyDown={(e) => e.key === 'Escape' && dismiss()}
    >
      {/* Логотип скрыт через style (не className) — не зависит от порядка загрузки CSS */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <div ref={logoRef} style={{ opacity: 0 }}>
        <img
          src="/images/logo.svg"
          alt="Шумская и Партнёры"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-widest uppercase pointer-events-none select-none">
        Нажмите чтобы пропустить
      </p>
    </div>
  )
}
