"use client";
import { useEffect, useRef } from "react";

const GRADIENT_DARK = "radial-gradient(circle, rgba(228,199,83,0.3) 0%, rgba(228,199,83,0.05) 60%, transparent 100%)";
const GRADIENT_LIGHT = "radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)";

export function CursorBlob() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    blob.style.display = "block";

    const applyTheme = (theme: string) => {
      blob.style.background = theme === "light" ? GRADIENT_LIGHT : GRADIENT_DARK;
    };

    applyTheme(document.documentElement.dataset.theme ?? "light");

    const onThemeChange = (e: Event) => applyTheme((e as CustomEvent<string>).detail);
    window.addEventListener("theme-change", onThemeChange);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      blob.style.transform = `translate(${currentX - 100}px, ${currentY - 100}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("theme-change", onThemeChange);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={blobRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-50 hidden"
      style={{
        width: 200,
        height: 200,
        borderRadius: "50%",
        filter: "blur(25px)",
      }}
    />
  );
}
