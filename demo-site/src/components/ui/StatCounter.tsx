"use client";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useCountUp } from "@/hooks/useCountUp";

interface StatCounterProps {
  value: number;
  suffix?: string;
  unit?: string;
  label: string;
}

export function StatCounter({ value, suffix = "", unit = "", label }: StatCounterProps) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 });
  const count = useCountUp(value, 2000, isVisible);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <div className="font-display text-5xl font-bold text-gold tracking-tight leading-none">
        {count}
        {suffix}
        {unit && (
          <span className="ml-2 text-xl font-sans font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
