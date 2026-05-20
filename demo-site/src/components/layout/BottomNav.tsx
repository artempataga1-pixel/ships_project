"use client";
import { useState, useEffect } from "react";
import { Home, Users, Briefcase, Newspaper, Phone } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Главная", href: "#hero", section: "hero" },
  { icon: Users, label: "Команда", href: "#partners", section: "partners" },
  { icon: Briefcase, label: "Практика", href: "#services", section: "services" },
  { icon: Newspaper, label: "Новости", href: "#news", section: "news" },
  { icon: Phone, label: "Контакты", href: "#contact", section: "contact" },
];

export function BottomNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_ITEMS.forEach(({ section }) => {
      const el = document.getElementById(section);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section);
        },
        { threshold: 0.3, rootMargin: "-64px 0px 0px 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav aria-label="Мобильная навигация" className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden bg-charcoal/95 backdrop-blur-md border-t border-white/10 h-16">
      {NAV_ITEMS.map(({ icon: Icon, label, href, section }) => {
        const isActive = activeSection === section;
        return (
          <a
            key={section}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors duration-200 ${
              isActive ? "text-gold" : "text-white/50 hover:text-white/70"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
