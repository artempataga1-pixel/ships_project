'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import type { NavItem } from '@/types/content'

interface Props {
  item: NavItem
}

export function NavLanternItem({ item }: Props) {
  const pathname = usePathname()
  // /#about считается активным на главной странице
  const isActive =
    item.href === '/#about' ? pathname === '/' : pathname === item.href

  const containerRef = useRef<HTMLLIElement>(null)
  const coneRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLAnchorElement>(null)

  const { contextSafe } = useGSAP({ scope: containerRef })

  useGSAP(
    () => {
      if (isActive) {
        gsap.set(coneRef.current, { scaleY: 1, opacity: 1 })
        gsap.set(textRef.current, {
          textShadow: '0 0 14px rgba(170,210,255,0.65)',
        })
      } else {
        gsap.set(coneRef.current, { scaleY: 0, opacity: 0 })
        gsap.set(textRef.current, { textShadow: 'none' })
      }
    },
    { scope: containerRef, dependencies: [isActive] }
  )

  const handleEnter = contextSafe(() => {
    if (isActive) return
    gsap.to(coneRef.current, {
      scaleY: 1,
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(textRef.current, {
      textShadow: '0 0 14px rgba(170,210,255,0.65)',
      duration: 0.3,
    })
  })

  const handleLeave = contextSafe(() => {
    if (isActive) return
    gsap.to(coneRef.current, { scaleY: 0, opacity: 0, duration: 0.25 })
    gsap.to(textRef.current, { textShadow: 'none', duration: 0.25 })
  })

  return (
    <li
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        ref={textRef}
        href={item.href}
        className="block py-2 text-sm tracking-wide text-white/75 hover:text-white transition-colors duration-200"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {item.label}
      </Link>
      {/* Конус-фонарь под пунктом меню */}
      <div
        ref={coneRef}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          top: '100%',
          width: '120%',
          height: '60px',
          background:
            'radial-gradient(ellipse at top center, rgba(170,210,255,0.4) 0%, transparent 70%)',
          transformOrigin: 'top center',
        }}
      />
    </li>
  )
}
