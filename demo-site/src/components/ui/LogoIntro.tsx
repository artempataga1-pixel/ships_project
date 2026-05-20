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

    Object.assign(logo.style, {
      position: "absolute",
      width: `${size}px`,
      height: `${size}px`,
      top: `${startTop}px`,
      left: `${startLeft}px`,
      opacity: "0",
    });

    const run = async () => {
      await animate(logo, { opacity: 1 }, { duration: 0.8, ease: "easeOut" });
      if (cancelled || dismissed.current) return;

      await animate(
        logo,
        { width: 40, height: 40, top: 14, left: 16 },
        { duration: 1.7, ease: [0.4, 0, 0.2, 1] }
      );
      if (cancelled || dismissed.current) return;

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
      <div ref={logoRef}>
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
