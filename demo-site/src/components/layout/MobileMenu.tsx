"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface NavLink {
  label: string;
  mobileLabel?: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-charcoal/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Навигация"
        className={`fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-background border-l border-border flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <span className="font-display text-sm font-semibold">Меню</span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Закрыть меню"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col flex-1 px-6 py-8 gap-1 overflow-y-auto">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="py-3 border-b border-border font-medium text-foreground hover:text-gold transition-colors flex items-center justify-between group"
            >
              {link.mobileLabel ?? link.label}
              <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>
            </a>
          ))}
        </nav>

        <div className="px-6 pb-8 shrink-0">
          <a
            href="#contact"
            onClick={onClose}
            className="block w-full text-center py-3.5 bg-gold text-gold-foreground font-semibold rounded-lg hover:bg-gold-dark transition-colors"
          >
            Записаться на консультацию
          </a>
        </div>
      </div>
    </>
  );
}
