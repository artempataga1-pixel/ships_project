import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { NewsCard } from "@/components/ui/NewsCard";
import { NEWS } from "@/lib/constants";

export function NewsSection() {
  return (
    <SectionWrapper id="news">
      <div className="text-center mb-14">
        <p className="text-gold text-xs uppercase tracking-[0.2em] mb-4">Новости</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-5">
          Последние события
        </h2>
        <GoldDivider className="max-w-xs mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {NEWS.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </SectionWrapper>
  );
}
