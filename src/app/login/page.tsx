"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COBALT = "#4284FF";
const INK = "#1F1F1F";
const PAPER = "#F4F6FB";

export default function Login() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const bg = isDark ? INK : PAPER;
  const fg = isDark ? "#FFFFFF" : INK;
  const muted = isDark ? "rgba(255,255,255,0.6)" : "rgba(5,8,15,0.62)";
  const faint = isDark ? "rgba(255,255,255,0.1)" : "rgba(5,8,15,0.1)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(5,8,15,0.035)";
  const raised = isDark ? "#2A2A2A" : "#FFFFFF";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!email || !pw) { setErr("Email and password are required."); return; }
      router.push("/os");
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes marq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.92)} }
        @keyframes gridShift { from{background-position:0 0} to{background-position:60px 60px} }
        .marquee-track{animation:marq 32s linear infinite}
        .pulse-dot{animation:pulse 2s ease-in-out infinite}
        .grid-bg{animation:gridShift 30s linear infinite}
      `}</style>

      {/* Slim top bar */}
      <header style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: COBALT, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 4, border: `2px solid ${INK}`, borderRight: 0, borderBottom: 0 }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: fg, fontStretch: "90%" }}>ALTERNUS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: muted }}>New here?</span>
          <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: COBALT, textDecoration: "none", borderBottom: `2px solid ${COBALT}`, paddingBottom: 2 }}>Create account →</Link>
          <button onClick={() => setIsDark(!isDark)} style={{ width: 34, height: 34, border: `1px solid ${faint}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, borderRadius: 8, marginLeft: 12 }}>
            {isDark
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", alignItems: "stretch" }} className="lg:!grid-cols-2">

        {/* ── Left: editorial marketing panel ── */}
        <section className="hidden lg:flex" style={{ position: "relative", padding: "60px 56px", overflow: "hidden", borderRight: `1px solid ${faint}` }}>
          {/* Blueprint grid */}
          <div className="grid-bg" style={{ position: "absolute", inset: 0, backgroundImage: isDark
            ? `linear-gradient(${faint} 1px,transparent 1px),linear-gradient(90deg,${faint} 1px,transparent 1px)`
            : `linear-gradient(rgba(66,132,255,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(66,132,255,0.07) 1px,transparent 1px)`,
            backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse at 30% 50%,black 30%,transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at 30% 50%,black 30%,transparent 80%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: "-30%", bottom: "-20%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(closest-side,${COBALT}30,transparent 70%)`, filter: "blur(30px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 28 }}>§ SIGN IN</div>
              <h1 style={{ fontSize: "clamp(48px,6vw,92px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.9, margin: 0, fontStretch: "84%" }}>
                <span style={{ display: "block", color: fg }}>Welcome</span>
                <span style={{ display: "block", color: fg }}>back to</span>
                <span style={{ display: "block", color: COBALT, fontStyle: "italic" }}>your desktop.</span>
              </h1>
              <p style={{ marginTop: 32, fontSize: 16.5, color: muted, lineHeight: 1.6, maxWidth: 420 }}>
                Your mail, files, code and memory are waiting exactly where you left them. The agent has been reading while you were away.
              </p>
            </div>

            {/* Live status card */}
            <div style={{ marginTop: 40, border: `1px solid ${faint}`, borderRadius: 12, padding: "18px 22px", background: surface, maxWidth: 440 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 700, color: muted }}>LIVE STATUS</span>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: fg, lineHeight: 1, fontStretch: "88%" }}>Claude Opus 4.6 · Online</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${faint}` }}>
                {[["200ms", "latency"], ["99.9%", "uptime"], ["10k+", "users"]].map(([v, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: fg, letterSpacing: "-0.02em" }}>{v}</div>
                    <div style={{ fontSize: 9, color: muted, letterSpacing: "0.12em", marginTop: 2 }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Right: login form ── */}
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px" }}>
          <div style={{ width: "100%", maxWidth: 420 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 18 }}>LOG IN · v2.1</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 0.95, margin: 0, marginBottom: 10, fontStretch: "88%" }}>Sign in to Alternus.</h2>
            <p style={{ fontSize: 14.5, color: muted, lineHeight: 1.55, margin: 0, marginBottom: 36 }}>
              Continue with your work email or one of your providers.
            </p>

            {/* OAuth buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { l: "Continue with Google", k: "google", d: "M21.35 11.1h-9.2v2.96h5.28c-.23 1.23-1.54 3.6-5.28 3.6-3.18 0-5.78-2.63-5.78-5.87s2.6-5.87 5.78-5.87c1.8 0 3.02.77 3.72 1.43l2.54-2.44C16.46 3.55 14.5 2.7 12.15 2.7 6.96 2.7 2.77 6.9 2.77 12.1s4.19 9.4 9.38 9.4c5.41 0 9-3.8 9-9.14 0-.62-.07-1.08-.15-1.26z" },
                { l: "Continue with GitHub", k: "github", d: "M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-2 1.03-2.7-.1-.26-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.03a9.57 9.57 0 015 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.39.2 2.42.1 2.68.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0012 2z" },
                { l: "Continue with SSO", k: "sso", d: "M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" },
              ].map((o) => (
                <button key={o.k} onClick={() => router.push("/os")} style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: raised, border: `1px solid ${faint}`, borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: fg, letterSpacing: "-0.01em", transition: "border-color 0.15s" }} className="hover:!border-[#4284FF]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={o.d}/></svg>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "28px 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: faint }} />
              <span style={{ fontSize: 10.5, color: muted, letterSpacing: "0.14em", fontWeight: 700 }}>OR WITH EMAIL</span>
              <div style={{ flex: 1, height: 1, background: faint }} />
            </div>

            {/* Email + password */}
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ border: `1px solid ${faint}`, borderRadius: 12, overflow: "hidden", background: raised, boxShadow: `8px 8px 0 0 ${COBALT}` }}>
                <div style={{ display: "flex", alignItems: "center", height: 28, padding: "0 12px", borderBottom: `1px solid ${faint}`, background: surface, gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FF5F57" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#FEBC2E" }} />
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#28C840" }} />
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: muted, fontFamily: "var(--font-geist-mono),monospace" }}>login@alternus</span>
                </div>

                {/* Email field */}
                <label style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10, borderBottom: `1px solid ${faint}` }}>
                  <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 13, color: COBALT, fontWeight: 700 }}>$</span>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@work.com" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: fg, fontSize: 14, fontFamily: "var(--font-geist-mono),monospace" }} className="placeholder:opacity-40" />
                </label>

                {/* Password field */}
                <label style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-geist-mono),monospace", fontSize: 13, color: COBALT, fontWeight: 700 }}>▸</span>
                  <input required type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="password" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: fg, fontSize: 14, fontFamily: "var(--font-geist-mono),monospace" }} className="placeholder:opacity-40" />
                </label>
              </div>

              {/* Remember + forgot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" style={{ width: 14, height: 14, accentColor: COBALT }} />
                  <span style={{ fontSize: 12.5, color: muted }}>Keep me signed in for 30 days</span>
                </label>
                <Link href="/reset-password" style={{ fontSize: 12.5, color: COBALT, textDecoration: "none", fontWeight: 600 }}>Forgot?</Link>
              </div>

              {err && (
                <div style={{ marginTop: 4, padding: "10px 14px", fontSize: 12.5, color: "#F87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8 }}>
                  {err}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: 12, height: 50, background: COBALT, color: "#FFF", fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em", border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Signing in…" : <>Sign in →</>}
              </button>
            </form>

            {/* Footer meta */}
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${faint}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: muted }}>
              <span>Need an account? <Link href="/signup" style={{ color: COBALT, fontWeight: 700, textDecoration: "none" }}>Sign up free</Link></span>
              <Link href="/contact" style={{ color: muted, textDecoration: "none" }}>Having trouble?</Link>
            </div>

            <div style={{ marginTop: 20, fontSize: 10.5, color: muted, lineHeight: 1.6 }}>
              By continuing, you agree to our <Link href="/terms" style={{ color: muted, textDecoration: "underline" }}>Terms</Link> and <Link href="/privacy" style={{ color: muted, textDecoration: "underline" }}>Privacy Policy</Link>.
            </div>
          </div>
        </section>
      </main>

      {/* Footer strip */}
      <footer style={{ borderTop: `1px solid ${faint}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: muted }}>
        <span>© 2026 Alternus · Built with Claude</span>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/security" style={{ color: muted, textDecoration: "none" }}>Security</Link>
          <Link href="/platform/status" style={{ color: muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />All systems operational
          </Link>
        </div>
      </footer>
    </div>
  );
}
