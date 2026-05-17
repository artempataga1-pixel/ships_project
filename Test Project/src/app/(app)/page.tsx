"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const STYLES = [
  { id: "cinematic", label: "Кинематографический", emoji: "🎬" },
  { id: "vintage", label: "Винтаж / Ретро", emoji: "📷" },
  { id: "fairytale", label: "Сказочный", emoji: "🧚" },
  { id: "boho", label: "Бохо", emoji: "🌿" },
  { id: "minimalist", label: "Минималистичный", emoji: "⬜" },
  { id: "holiday", label: "Праздничный", emoji: "🎄" },
  { id: "blackwhite", label: "Чёрно-белый", emoji: "🖤" },
  { id: "dreamy", label: "Мечтательный", emoji: "☁️" },
  { id: "goldenhour", label: "Золотой час", emoji: "🌅" },
  { id: "studio", label: "Студийный", emoji: "💡" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 Квадрат" },
  { value: "9:16", label: "9:16 Портрет" },
  { value: "16:9", label: "16:9 Пейзаж" },
];

type GenStatus = "idle" | "uploading" | "queued" | "processing" | "completed" | "failed";

export default function GeneratorPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [dragOver, setDragOver] = useState(false);

  const [status, setStatus] = useState<GenStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  function addFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    const total = [...files, ...arr].slice(0, 5);
    setFiles(total);

    const newPreviews = total.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
  }

  function removeFile(i: number) {
    const newFiles = files.filter((_, idx) => idx !== i);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    [files]
  );

  async function handleGenerate() {
    if (files.length === 0) {
      setErrorMsg("Загрузи хотя бы одно фото");
      return;
    }

    setStatus("uploading");
    setErrorMsg("");
    setProgress(10);

    const formData = new FormData();
    formData.append("style", selectedStyle);
    formData.append("prompt", prompt);
    formData.append("aspectRatio", aspectRatio);
    files.forEach((f) => formData.append("images", f));

    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setErrorMsg(data.error ?? "Ошибка при отправке");
      setStatus("failed");
      return;
    }

    const { id, position } = await res.json();
    setResultId(id);
    setQueuePosition(position);
    setStatus("queued");
    setProgress(20);

    // Подключаемся к SSE
    const sse = new EventSource(`/api/generation/${id}/status`);
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.status === "queued") {
        setQueuePosition(data.position ?? null);
        setProgress(20 + Math.min(10, (5 - (data.position ?? 5)) * 2));
      }
      if (data.status === "processing") {
        setStatus("processing");
        setQueuePosition(null);
        setProgress(60);
      }
      if (data.status === "completed") {
        setStatus("completed");
        setProgress(100);
        sse.close();
      }
      if (data.status === "failed") {
        setStatus("failed");
        setErrorMsg(data.error ?? "AI не смог обработать фото");
        setProgress(0);
        sse.close();
      }
    };
    sse.onerror = () => {
      sse.close();
    };
  }

  const isGenerating = status === "uploading" || status === "queued" || status === "processing";

  return (
    <div className="generator">
      <div className="page-header">
        <h1>Генератор фотосессий</h1>
        <p className="subtitle">Загрузи фото семьи и выбери стиль — AI создаст стилизованный результат</p>
      </div>

      <div className="generator-grid">
        {/* Левая колонка — настройки */}
        <div className="settings-col">
          {/* Загрузка фото */}
          <section className="card">
            <h2>Фотографии</h2>
            <p className="hint">До 5 фото семьи</p>

            <div
              className={`dropzone ${dragOver ? "drag-active" : ""} ${files.length >= 5 ? "dropzone-full" : ""}`}
              onClick={() => files.length < 5 && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {files.length === 0 ? (
                <div className="dropzone-placeholder">
                  <span className="dropzone-icon">📁</span>
                  <span>Нажми или перетащи фото сюда</span>
                  <span className="dropzone-sub">JPG, PNG, WEBP · максимум 5 файлов</span>
                </div>
              ) : (
                <div className="photo-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="photo-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Фото ${i + 1}`} />
                      <button
                        className="remove-btn"
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        title="Удалить"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {files.length < 5 && (
                    <div className="add-more">
                      <span>+</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </section>

          {/* Стили */}
          <section className="card">
            <h2>Стиль</h2>
            <div className="styles-grid">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  className={`style-btn ${selectedStyle === style.id ? "style-selected" : ""}`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-label">{style.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Дополнительно */}
          <section className="card">
            <h2>Дополнительно</h2>

            <div className="field">
              <label>Соотношение сторон</label>
              <div className="ratio-group">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.value}
                    className={`ratio-btn ${aspectRatio === r.value ? "ratio-selected" : ""}`}
                    onClick={() => setAspectRatio(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Дополнительный промпт (необязательно)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Например: с воздушными шариками, в лесу..."
                rows={3}
                maxLength={300}
              />
            </div>
          </section>
        </div>

        {/* Правая колонка — результат и кнопка */}
        <div className="result-col">
          <div className="generate-card">
            {status === "idle" && (
              <div className="result-placeholder">
                <span className="result-icon">✦</span>
                <p>Результат появится здесь</p>
              </div>
            )}

            {isGenerating && (
              <div className="generating">
                <div className="spinner" />
                <p className="gen-status">
                  {status === "uploading" && "Загружаем фото..."}
                  {status === "queued" && queuePosition !== null && `В очереди: позиция ${queuePosition}`}
                  {status === "processing" && "AI обрабатывает фото..."}
                </p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {status === "completed" && resultId && (
              <div className="result-done">
                <div className="result-actions">
                  <a
                    href={`/api/generation/${resultId}/download`}
                    download
                    className="btn-download"
                  >
                    ↓ Скачать
                  </a>
                  <button
                    className="btn-history"
                    onClick={() => router.push("/history")}
                  >
                    История
                  </button>
                </div>
                <div className="result-preview-placeholder">
                  <span>✓</span>
                  <p>Готово! Скачай или посмотри в истории</p>
                </div>
                <button
                  className="btn-new"
                  onClick={() => {
                    setStatus("idle");
                    setResultId(null);
                    setProgress(0);
                    setFiles([]);
                    setPreviews([]);
                  }}
                >
                  Новая генерация
                </button>
              </div>
            )}

            {status === "failed" && (
              <div className="result-error">
                <span className="error-icon">✕</span>
                <p>{errorMsg || "Не удалось создать фото"}</p>
                <button className="btn-retry" onClick={() => setStatus("idle")}>
                  Попробовать снова
                </button>
              </div>
            )}

            {status === "idle" && (
              <button
                className="btn-generate"
                onClick={handleGenerate}
                disabled={files.length === 0}
              >
                ✦ Сгенерировать
              </button>
            )}

            {errorMsg && status === "idle" && (
              <p className="inline-error">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .generator {
          padding-bottom: 3rem;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }
        .subtitle {
          color: var(--foreground-muted);
          margin: 0;
          font-size: 0.95rem;
        }
        .generator-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 1.5rem;
          align-items: start;
        }
        .settings-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .card {
          background: var(--background-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .card h2 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        .hint {
          color: var(--foreground-muted);
          font-size: 0.8rem;
          margin: 0 0 1rem;
        }
        .dropzone {
          border: 2px dashed var(--border);
          border-radius: 10px;
          padding: 1.5rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          min-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dropzone:hover:not(.dropzone-full) {
          border-color: var(--accent);
          background: rgba(0, 122, 255, 0.04);
        }
        .drag-active {
          border-color: var(--accent) !important;
          background: rgba(0, 122, 255, 0.08) !important;
        }
        .dropzone-full {
          cursor: default;
        }
        .dropzone-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--foreground-muted);
          font-size: 0.9rem;
        }
        .dropzone-icon {
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .dropzone-sub {
          font-size: 0.75rem;
          opacity: 0.7;
        }
        .photo-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
        }
        .photo-thumb {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
        }
        .photo-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0,0,0,0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          font-size: 0.65rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .add-more {
          width: 80px;
          height: 80px;
          border: 2px dashed var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--foreground-muted);
          font-size: 1.5rem;
          cursor: pointer;
        }
        .styles-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 0.75rem;
        }
        .style-btn {
          background: var(--background-input);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
        }
        .style-btn:hover {
          border-color: var(--accent);
        }
        .style-selected {
          border-color: var(--accent) !important;
          background: rgba(0, 122, 255, 0.1) !important;
        }
        .style-emoji {
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .style-label {
          font-size: 0.8rem;
          color: var(--foreground);
          line-height: 1.2;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 1rem;
        }
        .field:first-child {
          margin-top: 0;
        }
        .field label {
          font-size: 0.8rem;
          color: var(--foreground-muted);
          font-weight: 500;
        }
        .ratio-group {
          display: flex;
          gap: 8px;
        }
        .ratio-btn {
          background: var(--background-input);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--foreground);
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .ratio-selected {
          border-color: var(--accent) !important;
          background: rgba(0, 122, 255, 0.1) !important;
        }
        textarea {
          background: var(--background-input);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          padding: 0.75rem;
          font-size: 0.9rem;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        textarea:focus {
          border-color: var(--accent);
        }
        .generate-card {
          background: var(--background-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 2rem 1.5rem;
          position: sticky;
          top: 80px;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }
        .result-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: var(--foreground-muted);
        }
        .result-icon {
          font-size: 2.5rem;
          color: var(--accent);
          opacity: 0.4;
        }
        .generating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .gen-status {
          color: var(--foreground-muted);
          font-size: 0.9rem;
          margin: 0;
          text-align: center;
        }
        .progress-bar {
          width: 100%;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .result-done {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }
        .result-actions {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .btn-download {
          flex: 1;
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
          transition: background 0.2s;
        }
        .btn-download:hover {
          background: var(--accent-hover);
        }
        .btn-history {
          background: var(--background-input);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .result-preview-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--success);
          font-size: 0.9rem;
        }
        .result-preview-placeholder span {
          font-size: 2rem;
        }
        .result-preview-placeholder p {
          margin: 0;
          color: var(--foreground-muted);
          text-align: center;
        }
        .btn-new {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--foreground-muted);
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-new:hover {
          color: var(--foreground);
          border-color: var(--foreground-muted);
        }
        .result-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .error-icon {
          font-size: 2rem;
          color: var(--error);
        }
        .result-error p {
          color: var(--error);
          font-size: 0.9rem;
          text-align: center;
          margin: 0;
        }
        .btn-retry {
          background: var(--background-input);
          border: 1px solid var(--border);
          color: var(--foreground);
          border-radius: 8px;
          padding: 0.6rem 1.25rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .btn-generate {
          width: 100%;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 1rem;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.02em;
        }
        .btn-generate:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }
        .btn-generate:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .inline-error {
          color: var(--error);
          font-size: 0.85rem;
          margin: 0;
        }
        @media (max-width: 900px) {
          .generator-grid {
            grid-template-columns: 1fr;
          }
          .generate-card {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
