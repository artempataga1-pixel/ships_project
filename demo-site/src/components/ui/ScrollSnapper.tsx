"use client";
import { useEffect } from "react";

export function ScrollSnapper() {
  useEffect(() => {
    let locked = false;
    let accum = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const getSections = (): HTMLElement[] =>
      Array.from(document.querySelectorAll("main > section"));

    const getActiveIndex = (sections: HTMLElement[]): number => {
      const scrollTop = window.scrollY + 80;
      let active = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= scrollTop) active = i;
      }
      return active;
    };

    const NAVBAR_H = 64;

    const goTo = (el: HTMLElement) => {
      locked = true;
      accum = 0;
      window.scrollTo({ top: el.offsetTop - NAVBAR_H, behavior: "smooth" });
      setTimeout(() => { locked = false; }, 950);
    };

    const onWheel = (e: WheelEvent) => {
      if (locked) {
        e.preventDefault();
        return;
      }

      const sections = getSections();
      if (!sections.length) return;

      const idx = getActiveIndex(sections);
      const cur = sections[idx];
      const curBottom = cur.offsetTop + cur.offsetHeight;
      const viewBottom = window.scrollY + window.innerHeight;

      const nearEnd = e.deltaY > 0 && curBottom - viewBottom < 40;
      const nearStart = e.deltaY < 0 && window.scrollY - cur.offsetTop < 40;

      if (!nearEnd && !nearStart) return;

      accum += e.deltaY;
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accum = 0; }, 300);

      if (Math.abs(accum) < 60) return;

      const dir = accum > 0 ? 1 : -1;
      const next = idx + dir;
      if (next >= 0 && next < sections.length) {
        e.preventDefault();
        goTo(sections[next]);
      } else {
        accum = 0;
      }
    };

    // Только для устройств без touch (мышь)
    if (navigator.maxTouchPoints > 0) return;

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return null;
}
