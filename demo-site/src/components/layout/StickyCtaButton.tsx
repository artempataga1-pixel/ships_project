"use client";
import { useState, useEffect } from "react";

export function StickyCtaButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 hidden lg:block transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <a
        href="#contact"
        className="flex items-center gap-2 px-6 py-3.5 bg-gold text-gold-foreground font-semibold rounded-full shadow-[0_4px_20px_rgba(228,199,83,0.4)] hover:bg-gold-dark hover:shadow-[0_4px_30px_rgba(228,199,83,0.55)] transition-all duration-300 text-sm"
      >
        Записаться
      </a>
    </div>
  );
}
