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
  const count = useCountUp(value, 3000, isVisible);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 text-center">
      <div className="font-sans tabular-nums text-4xl sm:text-5xl font-bold tracking-tight leading-none whitespace-nowrap" style={{ color: "var(--stat-color)" }}>
        {count}{suffix}{unit && (
          <span className="ml-2 text-xl font-normal" style={{ color: "var(--stat-color)" }}>
            {unit}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-widest mt-1" style={{ color: "var(--stat-color)" }}>{label}</p>
    </div>
  );
}
