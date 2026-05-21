"use client";
import { useState, useEffect, useRef } from "react";
import {
  Home, Users, TrendingUp, Briefcase, ListOrdered,
  FolderOpen, Building2, MessageSquare, Newspaper, UserCheck, HelpCircle, Phone,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Home,          label: "Главная",    href: "#hero",         section: "hero" },
  { icon: Users,         label: "Команда",    href: "#partners",     section: "partners" },
  { icon: TrendingUp,    label: "Результаты", href: "#stats",        section: "stats" },
  { icon: Briefcase,     label: "Практика",   href: "#services",     section: "services" },
  { icon: ListOrdered,   label: "Процесс",    href: "#process",      section: "process" },
  { icon: FolderOpen,    label: "Кейсы",      href: "#cases",        section: "cases" },
  { icon: Building2,     label: "О компании", href: "#principles",   section: "principles" },
  { icon: MessageSquare, label: "Отзывы",     href: "#testimonials", section: "testimonials" },
  { icon: Newspaper,     label: "Новости",    href: "#news",         section: "news" },
  { icon: UserCheck,     label: "Клиенты",    href: "#clients",      section: "clients" },
  { icon: HelpCircle,    label: "Q&A",        href: "#faq",          section: "faq" },
  { icon: Phone,         label: "Контакты",   href: "#contact",      section: "contact" },
];

export function BottomNav() {
  const [activeSection, setActiveSection] = useState("hero");
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>(new Array(NAV_ITEMS.length).fill(null));

  // Единый observer — выбираем секцию с наибольшим пересечением, без race condition
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActiveSection(best.target.id);
      },
      { threshold: 0.3, rootMargin: "-64px 0px 0px 0px" }
    );

    NAV_ITEMS.forEach(({ section }) => {
      const el = document.getElementById(section);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Прокручиваем панель к активному пункту через rAF (избегаем reflow)
  useEffect(() => {
    const idx = NAV_ITEMS.findIndex((i) => i.section === activeSection);
    if (idx === -1) return;
    const el = itemRefs.current[idx];
    const container = scrollRef.current;
    if (!el || !container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2,
        behavior: "smooth",
      });
    });
  }, [activeSection]);

  return (
    <nav
      aria-label="Мобильная навигация"
      className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden h-16 bg-charcoal/95 backdrop-blur-md border-t border-white/10"
    >
      {/* Fade-подсказка — есть ещё пункты справа */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-charcoal/95 to-transparent z-10" />

      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto hide-scrollbar"
      >
        {NAV_ITEMS.map(({ icon: Icon, label, href, section }, idx) => {
          const isActive = activeSection === section;
          return (
            <a
              key={section}
              ref={(el) => { itemRefs.current[idx] = el; }}
              href={href}
              aria-current={isActive ? "location" : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-[68px] px-1 flex-shrink-0 transition-colors duration-200 ${
                isActive ? "text-gold" : "text-white/50 active:text-white/70"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] font-medium leading-none whitespace-nowrap">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
