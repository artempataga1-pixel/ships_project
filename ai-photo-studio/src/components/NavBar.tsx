"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LimitBadge } from "@/components/LimitBadge"

const navLinks = [
  { href: "/", label: "Генератор" },
  { href: "/history", label: "История" },
  { href: "/account", label: "Аккаунт" },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Camera className="size-5 text-primary" />
          <span className="hidden sm:inline">AI Photo Studio</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted hover:text-foreground",
                pathname === href
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LimitBadge />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
