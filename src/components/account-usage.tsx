"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { loadAccountUsage } from "@/lib/account-usage-request.mjs";
import { AI_COSTS, AI_LIMITS } from "@/lib/platform/ai-usage.mjs";

type Theme = { baseCard: CSSProperties; muted: string; fg: string; softFill: string; faintBorder: string; raised?: string; labelTertiary?: string };
type Summary = { plan: string; limit: number; used: number; remaining: number; percent: number; resetAt: string; history: { date: string; units: number }[] };
const BLUE = "#4284FF";
const names: Record<string, string> = { BASIC: "Basic", PRO: "Pro", TEAM: "Teams", STUDIO: "Studio" };
const format = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString();

export default function AccountUsage({ t, view = "usage" }: { t: Theme; view?: "usage" | "limits" }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [days, setDays] = useState(15);
  const [result, setResult] = useState<{ userId: string; days: number; data: Summary } | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const reload = useCallback(() => setRefresh(value => value + 1), []);
  useEffect(() => {
    setError("");
    if (!userId) { setResult(null); return; }
    const controller = new AbortController();
    loadAccountUsage(days, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setResult({ userId, days, data }); })
      .catch(caught => { if (!controller.signal.aborted) { setResult(null); setError(caught instanceof Error ? caught.message : "Usage could not be loaded."); } });
    return () => controller.abort();
  }, [userId, days, refresh]);
  useEffect(() => {
    const timer = setInterval(reload, 30_000);
    window.addEventListener("focus", reload);
    return () => { clearInterval(timer); window.removeEventListener("focus", reload); };
  }, [reload]);

  const data = result?.userId === userId && result?.days === days ? result.data : null;
  const plan = data ? names[data.plan] ?? data.plan : "—";
  const availablePercent = data ? Math.max(0, Math.round(data.remaining / data.limit * 10000) / 100) : undefined;
  const renewal = data ? new Date(data.resetAt).toLocaleDateString(undefined, { timeZone: "UTC" }) : "—";
  const button: CSSProperties = { padding: "6px 12px", fontSize: 11, fontWeight: 700, border: `1px solid ${t.faintBorder}`, borderRadius: 6, color: t.muted, background: "transparent", cursor: "pointer" };
  const loading = status === "loading" || Boolean(userId && !data && !error);
  const peak = data ? Math.max(0, ...data.history.map(day => day.units)) : 0;
  const average = data ? Math.round(data.history.reduce((sum, day) => sum + day.units, 0) / Math.max(1, data.history.length) * 10) / 10 : 0;
  const bars = data?.history ?? Array.from({ length: days }, (_, i) => ({ date: `pending-${i}`, units: 0 }));
  const stats = [
    { label: "AI credits", value: format(data?.used), note: data ? `of ${format(data.limit)} credits this month` : "Monthly consumption", first: "Consumed", firstValue: data ? `${data.percent}%` : "—", second: "Remaining", secondValue: data ? `${format(data.remaining)} credits` : "—" },
    { label: "Current plan", value: plan, note: data ? `${data.limit / AI_LIMITS.BASIC}× Basic allowance` : "Your active workspace plan", first: "Monthly limit", firstValue: format(data?.limit), second: "Renews (UTC)", secondValue: renewal },
    { label: "Remaining credits", value: format(data?.remaining), note: data ? `${availablePercent}% of your allowance available` : "Available this month", first: "Consumed", firstValue: data ? `${data.percent}%` : "—", second: "Available", secondValue: data ? `${availablePercent}%` : "—" },
  ];
  const meter = (accessible: boolean) => <div {...(accessible && data ? { role: "progressbar", "aria-label": "Monthly AI allowance used", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.min(100, data.percent), "aria-valuetext": `${data.percent}% used` } : {})} style={{ marginTop: 14, height: 4, background: t.softFill, borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${Math.min(100, data?.percent ?? 0)}%`, height: "100%", background: data && data.percent >= 100 ? "#EF4444" : data && data.percent >= 80 ? "#D97706" : BLUE, borderRadius: 2 }} /></div>;

  return <div style={{ maxWidth: 820 }}>
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: BLUE, marginBottom: 10 }}>§ {view === "limits" ? "LIMITS" : "USAGE"}</div>
      <h1 style={{ fontSize: "clamp(32px,3.6vw,44px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: "0 0 10px", fontStretch: "90%", color: t.fg }}>{view === "limits" ? "Rate limits." : "Usage this period."}</h1>
      <p style={{ fontSize: 14.5, color: t.labelTertiary ?? t.muted, margin: 0, lineHeight: 1.55, maxWidth: 640 }}>{view === "limits" ? "Your plan allowance and AI request costs. Warnings appear before the monthly cap is reached." : "AI credits consumed across your workspace. Your allowance renews on the first day of each month (UTC)."}</p>
    </div>
    {status !== "loading" && !userId ? <p><Link href="/login">Sign in</Link> to view your AI usage.</p> : <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: t.muted }} role="status">{loading ? "Loading usage…" : data ? `${plan} · ${renewal} renewal at 00:00 UTC` : "Usage unavailable"}</span>
        <button style={button} onClick={reload}>{error ? "Retry" : "Refresh"}</button>
      </div>
      {error && <div role="alert" style={{ ...t.baseCard, padding: "14px 18px", marginBottom: 16, color: t.fg }}>{error}</div>}
      {view === "usage" ? <>
        <div className="account-usage-stats" aria-busy={loading} style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, marginBottom: 20 }}>
          {stats.map((stat, index) => <div key={stat.label} style={{ ...t.baseCard, padding: "20px 22px", minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.035em", fontStretch: "88%", color: t.fg }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 4, minHeight: 28 }}>{stat.note}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              {[{ label: stat.first, value: stat.firstValue }, { label: stat.second, value: stat.secondValue }].map((item, i) => <div key={item.label}>
                <div style={{ fontSize: 9, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? BLUE : t.fg, marginTop: 3, overflowWrap: "anywhere" }}>{item.value}</div>
              </div>)}
            </div>
            {meter(index === 0)}
          </div>)}
        </div>
        <div style={{ ...t.baseCard, padding: 28 }} aria-busy={loading}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <div><div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>AI credits · last {days} days</div><div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>{data ? `Peak ${peak} credits/day · avg ${average}` : "Daily consumption"}</div></div>
            <div style={{ display: "flex", gap: 6 }}>{[7, 15, 30, 90].map(value => <button key={value} style={{ ...button, background: days === value ? BLUE : "transparent", color: days === value ? "#fff" : t.muted, borderColor: days === value ? BLUE : t.faintBorder }} aria-pressed={days === value} onClick={() => { setDays(value); setHoveredIndex(null); }}>{value}d</button>)}</div>
          </div>
          <div aria-label="Daily AI credit history" style={{ display: "flex", alignItems: "stretch", gap: days === 90 ? 3 : 8, height: 160, paddingTop: 20 }}>
            {bars.map((day, index) => <div key={day.date} title={data ? `${day.date}: ${day.units} credits` : "Loading"} aria-label={data ? `${day.date}: ${day.units} credits` : undefined} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0, cursor: "crosshair" }}>
              {data && hoveredIndex === index && <><div style={{ position: "absolute", top: 0, bottom: 18, left: "50%", width: 1, background: BLUE, opacity: 0.75, pointerEvents: "none" }} /><div role="tooltip" style={{ position: "absolute", zIndex: 2, top: -9, ...(index < bars.length / 2 ? { left: 0 } : { right: 0 }), padding: "5px 8px", borderRadius: 5, background: t.fg, color: t.raised ?? t.softFill, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.18)", pointerEvents: "none" }}>{day.units} credits · {day.date}</div></>}
              <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}><div style={{ width: "100%", height: data ? `${day.units ? day.units / Math.max(1, peak) * 100 : 1}%` : "100%", background: day.units ? BLUE : t.softFill, opacity: day.units ? hoveredIndex === index ? 1 : 0.15 + day.units / Math.max(1, peak) * 0.85 : 1, borderRadius: "4px 4px 0 0", transition: "opacity 120ms ease" }} /></div>
              <span style={{ fontSize: 9, color: hoveredIndex === index ? BLUE : t.muted, fontWeight: hoveredIndex === index ? 800 : 400, fontFamily: "var(--font-geist-mono),monospace", marginTop: 3 }}>{days <= 30 || index % 10 === 0 || index === days - 1 ? data ? Number(day.date.slice(-2)) : "·" : ""}</span>
            </div>)}
          </div>
          <div style={{ fontSize: 11.5, color: t.muted, marginTop: 14 }}>{data ? `${data.history[0]?.date} — ${data.history.at(-1)?.date} · ${format(data.history.reduce((sum, day) => sum + day.units, 0))} credits` : "Usage data will appear here when loaded."}</div>
          {data && !data.history.some(day => day.units) && <p style={{ fontSize: 12, color: t.muted, marginTop: 8 }}>No AI usage recorded in this period.</p>}
        </div>
      </> : <div style={{ ...t.baseCard, padding: 28 }} aria-busy={loading}>
        {[
          { label: "Monthly AI credits", value: format(data?.limit), note: data ? `${plan} · ${data.limit / AI_LIMITS.BASIC}× Basic` : "Your plan allowance" },
          { label: "Consumed this month", value: data ? `${data.percent}%` : "—", note: data ? `${format(data.used)} credits used` : "Actual AI consumption" },
          { label: "Remaining credits", value: format(data?.remaining), note: data ? `${availablePercent}% available` : "Shared workspace allowance" },
          { label: "Chat request", value: `${AI_COSTS.chat} credit`, note: "per successful response" },
          { label: "Scene proposal", value: `${AI_COSTS.scene} credit`, note: "per valid proposal" },
          { label: "3D generation", value: `${AI_COSTS.model} credits`, note: "includes refinement" },
          { label: "Allowance renewal", value: renewal, note: "first of each month · UTC" },
        ].map((row, index) => <div key={row.label} className="account-limit-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 140px 140px", gap: 16, padding: "18px 0", borderTop: index ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{row.label}</div><div style={{ fontSize: 18, fontWeight: 900, color: BLUE, letterSpacing: "-0.02em", fontStretch: "88%" }}>{row.value}</div><div style={{ fontSize: 11.5, color: t.muted }}>{row.note}</div>
        </div>)}
        {meter(true)}
      </div>}
      {data && data.percent >= 80 && <p role="status" style={{ fontSize: 13, marginTop: 16, color: data.percent >= 100 ? "#EF4444" : t.fg }}>{data.remaining === 0 ? "Monthly limit reached. AI requests are paused until renewal or a plan upgrade." : "You have used over 80% of your monthly AI allowance."} <Link href="/pricing" style={{ color: BLUE }}>View plans</Link></p>}
      <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.6, marginTop: 20 }}>Basic: 200 · Pro: 800 (4×) · Teams: 2,000 (10×) · Studio: 4,000 (20×) credits/month. AI requests share your workspace allowance; manual editing uses no credits.</p>
    </>}
    <style jsx>{`@media (max-width: 1100px) { .account-usage-stats { grid-template-columns: 1fr !important; } .account-limit-row { grid-template-columns: minmax(0,1fr) auto !important; gap: 8px !important; } .account-limit-row > :last-child { grid-column: 1 / -1; } }`}</style>
  </div>;
}
