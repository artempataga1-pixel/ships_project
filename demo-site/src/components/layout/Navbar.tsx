"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { label: "Команда", href: "#partners" },
  { label: "Практика", href: "#services" },
  { label: "Кейсы", href: "#cases" },
  { label: "О компании", href: "#principles" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Братья Разумовские и Партнёры"
              width={36}
              height={36}
              className="object-contain"
            />
            <span className="font-display text-sm font-semibold tracking-wide hidden sm:block">
              Разумовские и Партнёры
            </span>
          </a>

          <ul className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-white/75 hover:text-white transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-sm text-gold font-medium tracking-wide px-3 py-1.5 border border-gold/30 rounded-lg">
              +7 (495) 000-00-00
            </span>
            <a
              href="#contact"
              className="hidden lg:inline-flex items-center px-5 py-2.5 text-sm font-semibold bg-gold text-charcoal rounded-lg hover:bg-gold-dark transition-all duration-300"
            >
              Записаться
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Открыть меню"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </>
  );
}
