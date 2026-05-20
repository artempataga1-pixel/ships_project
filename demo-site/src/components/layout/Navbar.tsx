"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
  { label: "Главная", href: "#hero" },
  { label: "Команда", href: "#partners" },
  { label: "Результаты", href: "#stats" },
  { label: "Практика", href: "#services" },
  { label: "Процесс", href: "#process" },
  { label: "Кейсы", href: "#cases" },
  { label: "О компании", href: "#principles" },
  { label: "Отзывы", href: "#testimonials" },
  { label: "Новости", href: "#news" },
  { label: "Клиенты", href: "#clients" },
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
            ? "bg-charcoal/95 backdrop-blur-md border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center">
          {/* Левая часть: логотип + название */}
          <a href="#hero" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/images/logo2.png"
              alt="Братья Разумовские и Партнёры"
              width={40}
              height={40}
              className="object-contain mix-blend-screen"
            />
            <span className="hidden lg:block text-sm font-semibold text-gold tracking-wide whitespace-nowrap">
              Разумовские и Партнёры
            </span>
          </a>

          {/* Центр: навигация (flex-1 — равные отступы по бокам) */}
          <ul className="hidden lg:flex flex-1 items-center justify-center gap-3 px-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs text-white/75 hover:text-white transition-colors relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
                </a>
              </li>
            ))}
          </ul>

          {/* Правая часть: телефон + кнопка */}
          <div className="flex items-center gap-3 shrink-0 ml-auto lg:ml-0">
            <span className="hidden lg:block text-xs text-gold font-medium whitespace-nowrap">
              +7 (495) 000-00-00
            </span>
            <a
              href="#contact"
              className="hidden lg:inline-flex items-center px-4 py-2 text-sm font-semibold bg-gold text-charcoal rounded-lg hover:bg-gold-dark transition-all duration-300 whitespace-nowrap"
            >
              Записаться
            </a>
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -mr-2 text-white/70 hover:text-white transition-colors"
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
