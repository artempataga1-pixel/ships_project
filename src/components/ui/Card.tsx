import { type ReactNode } from 'react'
import Link from 'next/link'

interface CardProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function Card({ children, className, href, onClick }: CardProps) {
  const baseClasses = [
    'block rounded-lg border border-[var(--color-card-border)]/40',
    'bg-gradient-to-b from-zinc-800 to-zinc-900',
    'transition-all duration-300',
    'hover:border-[var(--color-card-border)]',
    'hover:shadow-[0_0_24px_rgba(119,99,75,0.35)]',
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
