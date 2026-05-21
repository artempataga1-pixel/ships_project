import type { NewsItem } from "@/lib/constants";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <article className="flex flex-col gap-3 p-6 rounded-lg transition-all duration-300" style={{ background: "var(--card-bg)", border: "1px solid var(--news-card-border)", boxShadow: "var(--news-card-shadow)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: "var(--dark-text-100)" }}>{news.category}</span>
        <span className="text-xs" style={{ color: "var(--dark-text-100)" }}>{news.date}</span>
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug" style={{ color: "var(--card-accent)" }}>{news.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--dark-text-100)" }}>{news.excerpt}</p>
    </article>
  );
}
