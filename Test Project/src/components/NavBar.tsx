"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <nav style={{
      background: "var(--background-card)",
      borderBottom: "1px solid var(--border)",
      padding: "0 1.5rem",
      height: "60px",
      display: "flex",
      alignItems: "center",
      gap: "2rem",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}>
        <span style={{ fontSize: "1.2rem", color: "var(--accent)" }}>✦</span>
        <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>AI Photo Studio</span>
      </Link>

      <div style={{ display: "flex", gap: "4px", flex: 1 }}>
        {[
          { href: "/", label: "Генератор" },
          { href: "/history", label: "История" },
          { href: "/account", label: "Аккаунт" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              color: isActive(href) ? "var(--foreground)" : "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              background: isActive(href) ? "var(--background-input)" : "transparent",
              transition: "color 0.2s, background 0.2s",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--foreground-muted)",
          borderRadius: "6px",
          padding: "0.4rem 0.75rem",
          fontSize: "0.875rem",
          cursor: "pointer",
        }}
      >
        Выйти
      </button>
    </nav>
  );
}
