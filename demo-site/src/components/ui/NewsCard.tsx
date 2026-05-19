import type { NewsItem } from "@/lib/constants";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <article className="flex flex-col gap-3 p-6 border border-border rounded-lg hover:border-gold/30 transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gold font-medium">{news.category}</span>
        <span className="text-xs text-muted-foreground">{news.date}</span>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug">{news.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{news.excerpt}</p>
    </article>
  );
}
