'use client'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { gsap } from '@/lib/gsap'
import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { LenisRef } from 'lenis/react'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)
  const pathname = usePathname()

  useEffect(() => {
    function update(time: number) {
      // GSAP ticker: секунды → Lenis.raf(): миллисекунды
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  // При смене страницы: останавливаем Lenis на время fade-transition (300ms),
  // чтобы скролл не конфликтовал со снимком View Transitions API
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return
    lenis.stop()
    const id = setTimeout(() => lenis.start(), 350)
    return () => clearTimeout(id)
  }, [pathname])

  return (
    // anchors: клики по <a href="#..."> плавно скроллят к секции;
    // высоту header компенсирует scroll-margin-top у секций (globals.css)
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
      {children}
    </ReactLenis>
  )
}
