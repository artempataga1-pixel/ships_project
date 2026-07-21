import { type ReactNode } from 'react'
import Link from 'next/link'

interface CardProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function Card({ children, className, href, onClick }: CardProps) {
  // Белая карточка со светлой рамкой и лайм-полосой у правого края + мягкий
  // glow (см. .case-card/.info-card в референс-коде дизайнера).
  const baseClasses = [
    'block rounded-[var(--radius-lg)] bg-[var(--color-surface)]',
    'border border-[var(--color-line)] border-r-[3px] border-r-[var(--color-lime)]',
    'transition-all duration-300',
    'shadow-[0_24px_70px_rgba(0,0,0,0.05),0_0_34px_rgba(168,204,51,0.1)]',
    'hover:shadow-[0_28px_80px_rgba(0,0,0,0.08),0_0_44px_rgba(168,204,51,0.18)]',
    className ?? '',
  ].join(' ')

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={baseClasses}>
        {children}
      </button>
    )
  }

  return <div className={baseClasses}>{children}</div>
}
