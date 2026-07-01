'use client'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { gsap } from '@/lib/gsap'
import { useRef, useEffect } from 'react'
import type { LenisRef } from 'lenis/react'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    function update(time: number) {
      // GSAP ticker: секунды → Lenis.raf(): миллисекунды
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  )
}
