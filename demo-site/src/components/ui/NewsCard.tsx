import type { NewsItem } from "@/lib/constants";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <article className="flex flex-col gap-3 p-6 border border-border rounded-lg hover:border-gold/30 transition-all duration-300" style={{ background: "var(--card-bg)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--dark-text-100)" }}>{news.category}</span>
        <span className="text-xs text-muted-foreground">{news.date}</span>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug">{news.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{news.excerpt}</p>
    </article>
  );
}
