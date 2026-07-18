'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    if (!titleRef.current) return

    const split = new SplitText(titleRef.current, { type: 'lines', mask: 'lines' })

    gsap.from(split.lines, {
      y: '100%',
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
        once: true,
      },
    })

    if (subtitleRef.current) {
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: subtitleRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    }

    return () => split.revert()
  }, { scope: containerRef, dependencies: [] })

  return (
    <div ref={containerRef} className={className}>
      <h2
        ref={titleRef}
        className="font-heading text-3xl font-extrabold uppercase leading-tight lg:text-5xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p ref={subtitleRef} className="mt-4 text-[var(--color-muted)] text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}
