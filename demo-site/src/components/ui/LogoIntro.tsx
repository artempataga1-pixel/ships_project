"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export function LogoIntro() {
  const [show, setShow] = useState(true);
  const logoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);

  const dismiss = () => {
    if (dismissed.current) return;
    dismissed.current = true;
    setShow(false);
  };

  useEffect(() => {
    const logo = logoRef.current;
    const overlay = overlayRef.current;
    if (!logo || !overlay) return;

    let cancelled = false;

    const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 1.5);
    const startLeft = Math.floor(window.innerWidth / 2 - size / 2);
    const startTop = Math.floor(window.innerHeight / 2 - size / 2);

    // Реальные координаты логотипа в navbar
    const navLogoEl = document.querySelector("[data-navbar-logo]") as HTMLElement | null;
    let targetTop = 12;
    let targetLeft = 16;
    let targetSize = 40;

    if (navLogoEl) {
      const rect = navLogoEl.getBoundingClientRect();
      targetTop = rect.top;
      targetLeft = rect.left;
      targetSize = rect.width || 40;
    }

    Object.assign(logo.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      top: `${startTop}px`,
      left: `${startLeft}px`,
      opacity: "0",
    });

    const run = async () => {
      // Фаза 1: появление в центре
      await animate(logo, { opacity: 1 }, { duration: 0.8, ease: "easeOut" });
      if (cancelled || dismissed.current) return;

      // Фаза 2: плавное уменьшение с перемещением точно в navbar
      await animate(
        logo,
        { width: targetSize, height: targetSize, top: targetTop, left: targetLeft },
        { duration: 1.7, ease: [0.4, 0, 0.2, 1] }
      );
      if (cancelled || dismissed.current) return;

      // Фаза 3: оверлей исчезает
      await animate(overlay, { opacity: 0 }, { duration: 0.4 });
      if (!cancelled) dismiss();
    };

    run();

    return () => { cancelled = true; };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Логотип компании"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[100] bg-charcoal/85 backdrop-blur-sm cursor-pointer"
      onClick={dismiss}
      onKeyDown={(e) => e.key === "Escape" && dismiss()}
    >
      <div ref={logoRef} style={{ opacity: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo2.png"
          alt="Братья Разумовские и Партнёры"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
