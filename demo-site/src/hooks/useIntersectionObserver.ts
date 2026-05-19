"use client";
import { useEffect, useRef, useState } from "react";

interface Options extends IntersectionObserverInit {
  once?: boolean;
}

export function useIntersectionObserver<T extends Element = HTMLElement>(
  options: Options = {}
) {
  const { once = true, threshold = 0.15, ...rest } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, ...rest }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once, threshold]);

  return { ref, isVisible };
}
