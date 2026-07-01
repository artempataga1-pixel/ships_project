'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

interface RevealOnScrollProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function RevealOnScroll({ children, className, delay = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 40,
      filter: 'blur(8px)',
      duration: 0.8,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, { scope: ref, dependencies: [delay] })

  return (
    // will-change: filter задан на [data-reveal] в globals.css
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}
