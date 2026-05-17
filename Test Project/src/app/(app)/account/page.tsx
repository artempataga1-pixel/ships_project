"use client";

import { useEffect, useState } from "react";

type AccountData = {
  email: string;
  name: string | null;
  plan: string;
  dailyUsed: number;
  dailyLimit: number;
};

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <style jsx>{`
          .loading { display: flex; justify-content: center; padding: 5rem; }
          .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const used = data?.dailyUsed ?? 0;
  const limit = data?.dailyLimit ?? 5;
  const progressPct = Math.min(100, (used / limit) * 100);

  return (
    <div className="account-page">
      <h1>Аккаунт</h1>

      <div className="cards">
        <div className="card">
          <h2>Профиль</h2>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{data?.email}</span>
          </div>
          {data?.name && (
            <div className="info-row">
              <span className="info-label">Имя</span>
              <span className="info-value">{data.name}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Тариф</span>
            <span className="plan-badge">{data?.plan ?? "Free"}</span>
          </div>
        </div>

        <div className="card">
          <h2>Лимит генераций</h2>
          <p className="limit-text">
            {used} из {limit} сегодня
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressPct}%`,
                background: progressPct >= 100 ? "var(--error)" : "var(--accent)",
              }}
            />
          </div>
          {progressPct >= 100 ? (
            <p className="limit-msg limit-full">Лимит исчерпан. Обновится завтра.</p>
          ) : (
            <p className="limit-msg">Осталось {limit - used} генераций на сегодня</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .account-page { padding-bottom: 3rem; }
        h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 1.5rem; }
        .cards { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; }
        .card {
          background: var(--background-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .card h2 { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; color: var(--foreground-muted); }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-size: 0.875rem; color: var(--foreground-muted); }
        .info-value { font-size: 0.875rem; color: var(--foreground); }
        .plan-badge {
          background: rgba(0, 122, 255, 0.15);
          color: var(--accent);
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .limit-text { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.75rem; }
        .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 0.75rem; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
        .limit-msg { font-size: 0.85rem; color: var(--foreground-muted); margin: 0; }
        .limit-full { color: var(--error); }
      `}</style>
    </div>
  );
}
