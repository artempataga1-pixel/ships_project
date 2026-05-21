import { ShieldCheck, Target, TrendingUp, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { PRINCIPLES, MEDIA_LOGOS } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Target,
  TrendingUp,
  Scale,
};

export function PrinciplesSection() {
  return (
    <SectionWrapper id="principles">
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">О компании</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
          Наши принципы
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PRINCIPLES.map((principle) => {
          const Icon = ICONS[principle.icon];
          return (
            <div
              key={principle.id}
              className="group flex gap-4 sm:gap-6 p-6 sm:p-8 border border-gold/25 rounded-lg shadow-[0_0_15px_rgba(228,199,83,0.06)] hover:border-gold/55 hover:shadow-[0_0_25px_rgba(228,199,83,0.18)] transition-all duration-300"
            >
              <div className="shrink-0 pt-1">
                {Icon && (
                  <Icon className="w-9 h-9 text-gold" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-3">{principle.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Нас рекомендуют — часть раздела «О компании» */}
      <div id="recommend" className="mt-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
            Нас рекомендуют
          </h2>
          <GoldDivider className="max-w-xs mx-auto" />
          <p className="mt-6 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Партнёры компании выступают экспертами ведущих деловых изданий России и мира.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-14 gap-y-6 sm:gap-y-10">
          {MEDIA_LOGOS.map((media) => (
            <div
              key={media.id}
              className="flex items-center justify-center transition-transform duration-300 hover:scale-110 cursor-default"
              title={media.name}
            >
              <Image
                src={media.logo}
                alt={media.name}
                width={140}
                height={40}
                unoptimized
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
