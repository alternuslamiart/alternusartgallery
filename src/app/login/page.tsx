"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlternusLogo,
  DARK_BG,
  DARK_BORDER,
  DARK_MUTED,
  DARK_SURFACE,
  DARK_SURFACE_SOFT,
  DARK_TEXT,
  useAlternusMode,
} from "@/components/alternus-shell";

const COBALT = "#4284FF";
const INK = "#1F1F1F";
const PAPER = "#F4F6FB";

const socialProviders = [
  {
    id: "google",
    label: "Continue with Google",
    icon: "M21.35 11.1h-9.2v2.96h5.28c-.23 1.23-1.54 3.6-5.28 3.6-3.18 0-5.78-2.63-5.78-5.87s2.6-5.87 5.78-5.87c1.8 0 3.02.77 3.72 1.43l2.54-2.44C16.46 3.55 14.5 2.7 12.15 2.7 6.96 2.7 2.77 6.9 2.77 12.1s4.19 9.4 9.38 9.4c5.41 0 9-3.8 9-9.14 0-.62-.07-1.08-.15-1.26z",
  },
  {
    id: "github",
    label: "Continue with GitHub",
    icon: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03a9.57 9.57 0 015 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.68.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z",
  },
  {
    id: "sso",
    label: "Continue with SSO",
    icon: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z",
  },
];

export default function Login() {
  const router = useRouter();
  const [isDark, setIsDark] = useAlternusMode();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const bg = isDark ? DARK_BG : PAPER;
  const fg = isDark ? DARK_TEXT : INK;
  const muted = isDark ? DARK_MUTED : "rgba(15,23,42,0.58)";
  const faint = isDark ? DARK_BORDER : "rgba(15,23,42,0.1)";
  const line = isDark ? "rgba(255,255,255,0.1)" : "rgba(66,132,255,0.1)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.86)";
  const card = isDark ? "rgba(21,21,24,0.96)" : "rgba(255,255,255,0.94)";
  const field = isDark ? DARK_SURFACE : "rgba(245,247,252,0.92)";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!email || !pw) {
        setErr("Email and password are required.");
        return;
      }
      router.push("/os");
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: fg,
        fontFamily:
          "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .6; transform: scale(.92); } }
        .login-grid {
          background-image:
            linear-gradient(rgba(66,132,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(66,132,255,0.08) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .login-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div
        className="login-grid"
        style={{
          position: "absolute",
          inset: 0,
          opacity: isDark ? 0.18 : 1,
          maskImage: "radial-gradient(circle at center, black 32%, transparent 88%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 32%, transparent 88%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "auto auto 10% 8%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(66,132,255,0.16), transparent 72%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "8% 8% auto auto",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(113,157,255,0.16), transparent 72%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      <header
        style={{
          position: "relative",
          zIndex: 1,
          padding: "24px 28px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <AlternusLogo size={28} radius={8} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: fg }}>ALTERNUS</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: COBALT, textDecoration: "none" }}>
            Create account
          </Link>
          <button
            onClick={() => setIsDark((value) => !value)}
            style={{
              width: 38,
              height: 38,
              border: `1px solid ${faint}`,
              background: isDark ? DARK_SURFACE_SOFT : surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: muted,
              borderRadius: 12,
              backdropFilter: "blur(18px)",
            }}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 76px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 20px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1120, position: "relative" }}>
          <div
            className="hidden xl:block"
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 260,
              border: `1px solid ${line}`,
              borderRadius: 28,
              background: surface,
              padding: 22,
              backdropFilter: "blur(18px)",
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.35)"
                : "0 24px 60px rgba(66,132,255,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700, color: muted }}>LIVE STATUS</span>
              <span className="login-pulse" style={{ width: 9, height: 9, borderRadius: "50%", background: "#22C55E" }} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
              Claude Opus 4.6
            </div>
            <p style={{ marginTop: 10, marginBottom: 0, fontSize: 13.5, lineHeight: 1.6, color: muted }}>
              Mail, files, prompts and context are where you left them.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 18 }}>
              {[
                ["200ms", "Latency"],
                ["99.9%", "Uptime"],
                ["10k+", "Users"],
              ].map(([value, label]) => (
                <div key={label} style={{ borderTop: `1px solid ${faint}`, paddingTop: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</div>
                  <div style={{ fontSize: 9, color: muted, letterSpacing: "0.14em", marginTop: 3 }}>
                    {label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ margin: "0 auto", width: "100%", maxWidth: 520 }}>
            <div
              style={{
                border: `1px solid ${line}`,
                borderRadius: 32,
                background: card,
                backdropFilter: "blur(20px)",
                boxShadow: isDark
                  ? "0 28px 80px rgba(0,0,0,0.38)"
                  : "0 30px 90px rgba(66,132,255,0.15)",
                padding: 32,
              }}
            >
              <div style={{ marginBottom: 26, textAlign: "center" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 14 }}>
                  LOGIN / WORKSPACE
                </div>
                <h1
                  style={{
                    fontSize: "clamp(34px,4vw,48px)",
                    fontWeight: 900,
                    letterSpacing: "-0.045em",
                    lineHeight: 0.92,
                    margin: 0,
                  }}
                >
                  Sign in to Alternus.
                </h1>
                <p style={{ margin: "14px auto 0", maxWidth: 360, fontSize: 14.5, lineHeight: 1.6, color: muted }}>
                  Centered, quieter, and ready to get you back into the workspace.
                </p>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {socialProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => router.push("/os")}
                    style={{
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      background: surface,
                      border: `1px solid ${faint}`,
                      borderRadius: 16,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                      color: fg,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d={provider.icon} />
                    </svg>
                    {provider.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 18px" }}>
                <div style={{ flex: 1, height: 1, background: faint }} />
                <span style={{ fontSize: 10.5, color: muted, letterSpacing: "0.16em", fontWeight: 700 }}>OR WITH EMAIL</span>
                <div style={{ flex: 1, height: 1, background: faint }} />
              </div>

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: muted }}>WORK EMAIL</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@work.com"
                    autoComplete="email"
                    style={{
                      height: 54,
                      borderRadius: 16,
                      border: `1px solid ${faint}`,
                      background: field,
                      padding: "0 16px",
                      outline: "none",
                      color: fg,
                      fontSize: 15,
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: muted }}>PASSWORD</span>
                  <input
                    required
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      height: 54,
                      borderRadius: 16,
                      border: `1px solid ${faint}`,
                      background: field,
                      padding: "0 16px",
                      outline: "none",
                      color: fg,
                      fontSize: 15,
                    }}
                  />
                </label>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" style={{ width: 14, height: 14, accentColor: COBALT }} />
                    <span style={{ fontSize: 12.5, color: muted }}>Keep me signed in</span>
                  </label>
                  <Link href="/reset-password" style={{ fontSize: 12.5, color: COBALT, textDecoration: "none", fontWeight: 700 }}>
                    Forgot password?
                  </Link>
                </div>

                {err ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      fontSize: 12.5,
                      color: "#DC2626",
                      background: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.24)",
                      borderRadius: 14,
                    }}
                  >
                    {err}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6,
                    height: 54,
                    background: "linear-gradient(135deg, #4284FF 0%, #2F6CF1 100%)",
                    color: "#FFF",
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    border: "none",
                    borderRadius: 16,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: loading ? 0.72 : 1,
                    boxShadow: "0 18px 34px rgba(66,132,255,0.24)",
                  }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: `1px solid ${faint}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                  fontSize: 12.5,
                  color: muted,
                }}
              >
                <span>
                  Need an account?{" "}
                  <Link href="/signup" style={{ color: COBALT, fontWeight: 700, textDecoration: "none" }}>
                    Sign up free
                  </Link>
                </span>
                <Link href="/contact" style={{ color: muted, textDecoration: "none" }}>
                  Having trouble?
                </Link>
              </div>

              <div style={{ marginTop: 16, fontSize: 11, color: muted, lineHeight: 1.6, textAlign: "center" }}>
                By continuing, you agree to our{" "}
                <Link href="/terms" style={{ color: muted, textDecoration: "underline" }}>
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ color: muted, textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
