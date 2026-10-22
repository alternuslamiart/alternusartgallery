"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useSession } from "next-auth/react";

type Theme = { baseCard: CSSProperties; muted: string; fg: string; softFill: string; faintBorder: string };
type Summary = { plan: string; limit: number; used: number; remaining: number; percent: number; resetAt: string; history: { date: string; units: number }[] };
const names: Record<string, string> = { BASIC: "Basic", PRO: "Pro", TEAM: "Teams", STUDIO: "Studio" };
export default function AccountUsage({ t }: { t: Theme }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [days, setDays] = useState(15);
  const [result, setResult] = useState<{ userId: string; days: number; data: Summary } | null>(null);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const reload = useCallback(() => setRefresh(value => value + 1), []);
  useEffect(() => {
    setError("");
    if (!userId) { setResult(null); return; }
    const controller = new AbortController();
    fetch(`/api/usage?days=${days}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : body.error?.message || "Usage could not be loaded.");
        if (!controller.signal.aborted) setResult({ userId, days, data: body });
      }).catch(caught => { if (!controller.signal.aborted) { setResult(null); setError(caught instanceof Error ? caught.message : "Usage could not be loaded."); } });
    return () => controller.abort();
  }, [userId, days, refresh]);
  useEffect(() => {
    const timer = setInterval(reload, 30_000);
    window.addEventListener("focus", reload);
    return () => { clearInterval(timer); window.removeEventListener("focus", reload); };
  }, [reload]);
  const data = result?.userId === userId && result?.days === days ? result.data : null;
  const button: CSSProperties = { padding: "8px 12px", border: `1px solid ${t.faintBorder}`, borderRadius: 8, color: t.fg, background: t.softFill, cursor: "pointer" };
  if (status === "loading") return <p role="status">Loading usage…</p>;
  if (!userId) return <p><Link href="/login">Sign in</Link> to view your AI usage.</p>;
  const peak = Math.max(1, ...(data?.history.map(day => day.units) ?? []));
  return <>
    <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 28, fontWeight: 800 }}>Your AI usage.</h2><p style={{ color: t.muted }}>Actual AI requests across your workspace. Allowance renews on the first day of each month (UTC).</p></div>
    {error && <div role="alert" style={{ marginBottom: 16 }}>{error} <button style={button} onClick={reload}>Retry</button></div>}
    {!data && !error && <p role="status">Loading usage…</p>}
    {data && <>
      <div style={{ ...t.baseCard, padding: 24, maxWidth: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}><strong>{names[data.plan] ?? data.plan} · monthly AI credits</strong><button style={button} onClick={reload}>Refresh</button></div>
        <div style={{ fontSize: 36, fontWeight: 800, marginTop: 18 }}>{data.percent}% <span style={{ fontSize: 14, color: t.muted }}>used</span></div>
        <div role="progressbar" aria-label="Monthly AI allowance used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, data.percent)} aria-valuetext={`${data.percent}% used`} style={{ height: 8, background: t.softFill, borderRadius: 4, overflow: "hidden", margin: "14px 0" }}><div style={{ height: "100%", width: `${Math.min(100, data.percent)}%`, background: data.percent >= 100 ? "#ef4444" : data.percent >= 80 ? "#d97706" : "#4284ff" }} /></div>
        <p>{data.used.toLocaleString()} / {data.limit.toLocaleString()} credits · {data.remaining.toLocaleString()} remaining</p>
        <p style={{ color: t.muted, fontSize: 13, marginTop: 8 }}>Renews {new Date(data.resetAt).toLocaleDateString(undefined, { timeZone: "UTC" })} · 00:00 UTC</p>
        {data.percent >= 80 && <p role="status" style={{ marginTop: 12 }}>{data.remaining === 0 ? "Monthly limit reached. AI requests are paused until renewal or a plan upgrade." : "You have used over 80% of your monthly AI allowance."} <Link href="/pricing">View plans</Link></p>}
      </div>
      <div style={{ ...t.baseCard, padding: 24, maxWidth: 820, marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}><strong>Daily AI credits · last {days} days</strong><div style={{ display: "flex", gap: 6 }}>{[7, 15, 30, 90].map(value => <button key={value} style={{ ...button, background: days === value ? "#4284ff" : t.softFill, color: days === value ? "white" : t.fg }} aria-pressed={days === value} onClick={() => setDays(value)}>{value}d</button>)}</div></div>
        <div aria-label="Daily AI credit history" style={{ display: "flex", alignItems: "end", height: 160, gap: 3, marginTop: 24 }}>{data.history.map(day => <div key={day.date} title={`${day.date}: ${day.units} credits`} aria-label={`${day.date}: ${day.units} credits`} style={{ flex: 1, minWidth: 0, height: `${Math.max(1, day.units / peak * 100)}%`, background: day.units ? "#4284ff" : t.softFill, borderRadius: "3px 3px 0 0" }} />)}</div>
        <p style={{ color: t.muted, fontSize: 12, marginTop: 12 }}>{data.history[0]?.date} — {data.history.at(-1)?.date} · {data.history.reduce((sum, day) => sum + day.units, 0).toLocaleString()} credits</p>
        {!data.history.some(day => day.units) && <p>No AI usage recorded in this period.</p>}
      </div>
    </>}
    <p style={{ color: t.muted, fontSize: 13, maxWidth: 820, marginTop: 20 }}>Basic: 200 · Pro: 800 (4×) · Teams: 2,000 (10×) · Studio: 4,000 (20×) credits/month. Chat or scene proposal: 1 credit. Submitted 3D generation: 20 credits, including textures/refinement. Manual editing uses no AI credits. Failed chat/scene requests are refunded; submitted 3D jobs remain charged because provider work may have started. Tracking begins when this feature is activated.</p>
  </>;
}
