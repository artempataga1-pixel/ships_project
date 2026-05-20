import Image from "next/image";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { MEDIA_LOGOS } from "@/lib/constants";

export function RecommendSection() {
  return (
    <SectionWrapper id="recommend" className="py-20">
      <div className="text-center mb-12">
<h2 className="font-display text-4xl md:text-5xl font-bold mb-5">
          Нас рекомендуют
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
        <p className="mt-6 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Партнёры компании выступают экспертами ведущих деловых изданий России и мира.
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-10">
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
    </SectionWrapper>
  );
}
