"use client";
import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Читаем то, что уже установил inline-скрипт в <head> — источник правды
    const initial = (document.documentElement.dataset.theme as Theme) || "light";
    setTheme(initial);

    const t = setTimeout(() => {
      document.documentElement.classList.add("transitions-enabled");
    }, 50);

    // Синхронизация между несколькими инстансами ThemeToggle
    const onThemeChange = (e: Event) => {
      setTheme((e as CustomEvent<Theme>).detail);
    };
    window.addEventListener("theme-change", onThemeChange);

    return () => {
      clearTimeout(t);
      window.removeEventListener("theme-change", onThemeChange);
    };
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next }));
  };

  return { theme, toggle };
}
