"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Generation = {
  id: string;
  status: string;
  style: string;
  prompt: string;
  aspectRatio: string;
  createdAt: number;
  resultImagePath: string | null;
  errorMessage: string | null;
};

const STYLE_LABELS: Record<string, string> = {
  cinematic: "🎬 Кинематографический",
  vintage: "📷 Винтаж",
  fairytale: "🧚 Сказочный",
  boho: "🌿 Бохо",
  minimalist: "⬜ Минималистичный",
  holiday: "🎄 Праздничный",
  blackwhite: "🖤 Чёрно-белый",
  dreamy: "☁️ Мечтательный",
  goldenhour: "🌅 Золотой час",
  studio: "💡 Студийный",
};

export default function HistoryPage() {
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setGenerations(data.generations ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Удалить эту генерацию?")) return;
    setDeletingId(id);
    await fetch("/api/history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setGenerations((prev) => prev.filter((g) => g.id !== id));
    setDeletingId(null);
  }

  function handleRegenerate(gen: Generation) {
    // Переходим на главную с параметрами для pre-fill
    const params = new URLSearchParams({ style: gen.style, prompt: gen.prompt ?? "" });
    router.push(`/?${params.toString()}`);
  }

  function formatDate(ts: number) {
    return new Date(ts * 1000).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const statusLabel: Record<string, string> = {
    queued: "⏳ В очереди",
    processing: "⚙️ Обрабатывается",
    completed: "✓ Готово",
    failed: "✕ Ошибка",
  };

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>История генераций</h1>
        <p className="subtitle">{generations.length} генераций</p>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
        </div>
      )}

      {!loading && generations.length === 0 && (
        <div className="empty">
          <span className="empty-icon">✦</span>
          <p>Пока нет генераций</p>
          <button className="btn-go" onClick={() => router.push("/")}>
            Создать первую
          </button>
        </div>
      )}

      {!loading && generations.length > 0 && (
        <div className="gen-list">
          {generations.map((gen) => (
            <div key={gen.id} className="gen-card">
              <div className="gen-info">
                <div className="gen-style">{STYLE_LABELS[gen.style] ?? gen.style}</div>
                <div className="gen-meta">
                  <span className={`gen-status status-${gen.status}`}>
                    {statusLabel[gen.status] ?? gen.status}
                  </span>
                  <span className="gen-date">{formatDate(gen.createdAt)}</span>
                  <span className="gen-ratio">{gen.aspectRatio}</span>
                </div>
                {gen.prompt && (
                  <p className="gen-prompt">&ldquo;{gen.prompt}&rdquo;</p>
                )}
                {gen.errorMessage && (
                  <p className="gen-error">{gen.errorMessage}</p>
                )}
              </div>

              <div className="gen-actions">
                {gen.status === "completed" && (
                  <a
                    href={`/api/generation/${gen.id}/download`}
                    download
                    className="btn-download"
                  >
                    ↓ Скачать
                  </a>
                )}
                <button
                  className="btn-regen"
                  onClick={() => handleRegenerate(gen)}
                >
                  ↺ Повторить
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(gen.id)}
                  disabled={deletingId === gen.id}
                >
                  {deletingId === gen.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .history-page {
          padding-bottom: 3rem;
        }
        .page-header {
          margin-bottom: 1.5rem;
        }
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
        }
        .subtitle {
          color: var(--foreground-muted);
          margin: 0;
          font-size: 0.9rem;
        }
        .loading {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 5rem 1rem;
          color: var(--foreground-muted);
        }
        .empty-icon {
          font-size: 3rem;
          color: var(--accent);
          opacity: 0.3;
        }
        .btn-go {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
        }
        .gen-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .gen-card {
          background: var(--background-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: space-between;
        }
        .gen-info {
          flex: 1;
          min-width: 0;
        }
        .gen-style {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.35rem;
        }
        .gen-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .gen-status {
          font-size: 0.8rem;
          font-weight: 500;
        }
        .status-completed { color: var(--success); }
        .status-failed { color: var(--error); }
        .status-queued, .status-processing { color: var(--accent); }
        .gen-date {
          font-size: 0.8rem;
          color: var(--foreground-muted);
        }
        .gen-ratio {
          font-size: 0.75rem;
          color: var(--foreground-muted);
          background: var(--background-input);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .gen-prompt {
          font-size: 0.8rem;
          color: var(--foreground-muted);
          margin: 0.35rem 0 0;
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .gen-error {
          font-size: 0.8rem;
          color: var(--error);
          margin: 0.35rem 0 0;
        }
        .gen-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .btn-download {
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          padding: 0.5rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-download:hover { background: var(--accent-hover); }
        .btn-regen {
          background: var(--background-input);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-regen:hover { border-color: var(--foreground-muted); }
        .btn-delete {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--error);
          border-radius: 6px;
          padding: 0.5rem 0.65rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .btn-delete:hover { background: rgba(255, 69, 58, 0.1); border-color: var(--error); }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 600px) {
          .gen-card { flex-direction: column; align-items: flex-start; }
          .gen-actions { width: 100%; }
        }
      `}</style>
    </div>
  );
}
