"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">AI Photo Studio</span>
        </div>

        <h1 className="auth-title">Войти</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта?{" "}
          <Link href="/register">Зарегистрироваться</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .auth-card {
          background: var(--background-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          width: 100%;
          max-width: 400px;
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2rem;
          justify-content: center;
        }
        .logo-icon {
          font-size: 1.5rem;
          color: var(--accent);
        }
        .logo-text {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--foreground);
        }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 1.5rem;
          text-align: center;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 0.875rem;
          color: var(--foreground-muted);
          font-weight: 500;
        }
        .field input {
          background: var(--background-input);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--foreground);
          padding: 0.75rem 1rem;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus {
          border-color: var(--accent);
        }
        .auth-error {
          color: var(--error);
          font-size: 0.875rem;
          margin: 0;
        }
        .btn-primary {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.5rem;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-switch {
          text-align: center;
          margin: 1.5rem 0 0;
          font-size: 0.9rem;
          color: var(--foreground-muted);
        }
        .auth-switch a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
