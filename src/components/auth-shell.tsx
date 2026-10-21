"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import "@/app/login/login.css";

export function AuthShell({ children, isLight, onToggleTheme }: {
  children: ReactNode; isLight: boolean; onToggleTheme: () => void;
}) {
  return <main className={`auth-page auth-reference ${isLight ? "auth-light" : "auth-dark"}`}>
    <div className="auth-reference-shell">
      <aside className="auth-reference-visual" aria-label="Casynus creative workspace">
        <div className="auth-reference-art" aria-hidden="true" />
        <Link href="/" className="auth-reference-brand" aria-label="Go to Casynus homepage">
          <Image src="/Logopng.png" alt="" width={28} height={28} />
          <span>Casynus</span>
        </Link>
        <h2>Be a Part of<br />Something <strong>Beautiful</strong></h2>
      </aside>
      <section className="auth-reference-form" aria-label="Casynus account">
        <button type="button" onClick={onToggleTheme} className="auth-reference-theme"
          aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}>
          {isLight ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        {children}
        <footer className="auth-reference-footer"><span>© {new Date().getFullYear()} Casynus</span><Link href="/privacy">Privacy</Link></footer>
      </section>
    </div>
  </main>;
}
