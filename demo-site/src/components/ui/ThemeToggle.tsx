"use client";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Нейтральный плейсхолдер до mount — нет hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`w-10 h-10 rounded-full border border-gold bg-charcoal ${className}`}
        aria-hidden
        tabIndex={-1}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      className={`w-10 h-10 rounded-full border border-gold bg-charcoal text-gold flex items-center justify-center hover:bg-charcoal-soft transition-colors ${className}`}
      aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
