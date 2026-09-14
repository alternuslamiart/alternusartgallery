"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
 CoreforgeLogo,
 DARK_BG,
 DARK_BORDER,
 DARK_BORDER_SOFT,
 DARK_MUTED,
 DARK_SURFACE,
 DARK_SURFACE_SOFT,
 DARK_TEXT,
 useCoreforgeMode,
} from "@/components/cedium-shell";

const COBALT = "#4284FF";
const LIGHT_BACKGROUND_PRIMARY = "#FFFFFF";
const LIGHT_BACKGROUND_SECONDARY = "#EBEBEB";
const LIGHT_BACKGROUND_TERTIARY = "#D7D7D7";
const LIGHT_BACKGROUND_QUATERNARY = "#C3C3C3";
const LIGHT_LABEL_PRIMARY = "#000000";
const LIGHT_LABEL_SECONDARY = "#282828";
const LIGHT_LABEL_TERTIARY = "#3C3C3C";
const LIGHT_LABEL_QUATERNARY = "#505050";

type SectionId =
 | "organization" | "access" | "members"
 | "subscriptions" | "billing"
 | "chat" | "api-keys" | "usage" | "limits" | "workspaces" | "privacy";

const nav: { heading: string; items: { id: SectionId; label: string }[] }[] = [
 { heading: "Administration", items: [
 { id: "organization", label: "Organization" },
 { id: "access", label: "Access" },
 { id: "members", label: "Members" },
 ]},
 { heading: "Subscriptions", items: [
 { id: "subscriptions", label: "Subscriptions" },
 { id: "billing", label: "Billing" },
 ]},
 { heading: "Manage", items: [
 { id: "chat", label: "Chat" },
 { id: "api-keys", label: "API Keys" },
 { id: "usage", label: "Usage" },
 { id: "limits", label: "Limits" },
 { id: "workspaces", label: "Workspaces" },
 { id: "privacy", label: "Privacy" },
 ]},
];

export default function Account() {
 const [isDark, setIsDark] = useCoreforgeMode();
 const { data: session } = useSession();
 const [active, setActive] = useState<SectionId>("usage");
 const accountName = session?.user?.name?.trim() || "Crystal Studio User";
 const accountEmail = session?.user?.email || "you@alternusart.com";
 const accountInitials = accountName
  .split(/\s+/)
  .map((part) => part[0])
  .filter(Boolean)
  .slice(0, 2)
  .join("")
  .toUpperCase() || "AL";

 const bg = isDark ? DARK_BG : LIGHT_BACKGROUND_PRIMARY;
 const fg = isDark ? DARK_TEXT : LIGHT_LABEL_PRIMARY;
 const muted = isDark ? DARK_MUTED : LIGHT_LABEL_SECONDARY;
 const faint = isDark ? DARK_BORDER_SOFT : LIGHT_BACKGROUND_TERTIARY;
 const faintBorder = isDark ? DARK_BORDER : LIGHT_BACKGROUND_QUATERNARY;
 const raised = isDark ? DARK_SURFACE : LIGHT_BACKGROUND_PRIMARY;
 const softFill = isDark ? DARK_SURFACE_SOFT : LIGHT_BACKGROUND_SECONDARY;

 const cardShadow = isDark ? "none" : "0 1px 4px rgba(5,8,15,0.04)";
 const baseCard: React.CSSProperties = { background: raised, border: `1px solid ${faintBorder}`, borderRadius: 12, boxShadow: cardShadow };

 return (
 <div className="crystal-account-page" style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "var(--font-roboto-flex),-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", display: "flex", flexDirection: "column" }}>

 {/* Slim top bar */}
 <header style={{ padding: "16px 24px", borderBottom: `1px solid ${faintBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: raised }}>
 <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
 <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
 <CoreforgeLogo size={26} radius={7} />
 <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", color: fg, fontStretch: "90%" }}>Crystal Studio</span>
 <span style={{ fontSize: 10, fontWeight: 600, color: muted, padding: "2px 6px", border: `1px solid ${faintBorder}`, borderRadius: 4, letterSpacing: "0.08em" }}>ACCOUNT</span>
 </Link>
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <button onClick={() => setIsDark(!isDark)} style={{ width: 32, height: 32, border: `1px solid ${faintBorder}`, background: isDark ? softFill : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: muted, borderRadius: 8 }}>
 {isDark
 ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
 : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
 }
 </button>
 <Link href="/ai-assistant" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", background: COBALT, color: "#FFF", fontSize: 12.5, fontWeight: 700, textDecoration: "none", letterSpacing: "-0.01em", borderRadius: 8 }}>
 Launch Studio <span style={{ fontSize: 10, opacity: 0.8 }}>↗</span>
 </Link>
 <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>{accountInitials}</div>
 </div>
 </header>

 <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 0 }}>

 {/* ── Sidebar ── */}
 <aside style={{ borderRight: `1px solid ${faintBorder}`, padding: "28px 20px", overflowY: "auto" }}>
 {/* User identity card */}
 <div style={{ ...baseCard, padding: "14px 14px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{accountInitials}</div>
 <div style={{ minWidth: 0, flex: 1 }}>
 <div style={{ fontSize: 13, fontWeight: 700, color: fg, letterSpacing: "-0.01em" }}>{accountName}</div>
 <div style={{ fontSize: 11, color: muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{accountEmail}</div>
 </div>
 </div>

 {nav.map((group) => (
 <div key={group.heading} style={{ marginBottom: 22 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px", marginBottom: 8 }}>
 <span style={{ width: 8, height: 8, background: COBALT, borderRadius: 2 }} />
 <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: COBALT, textTransform: "uppercase" }}>{group.heading}</span>
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
 {group.items.map((item) => {
 const isActive = active === item.id;
 return (
 <button key={item.id} onClick={() => setActive(item.id)} style={{
 padding: "8px 12px",
 fontSize: 13.5,
 fontWeight: isActive ? 700 : 500,
 color: isActive ? fg : muted,
 background: isActive ? softFill : "transparent",
 border: "none",
 borderRadius: 8,
 textAlign: "left",
 cursor: "pointer",
 letterSpacing: "-0.01em",
 }}>
 {item.label}
 </button>
 );
 })}
 </div>
 </div>
 ))}
 </aside>

 {/* ── Main ── */}
 <main style={{ overflowY: "auto", padding: "36px 48px 80px" }}>
 <Section
  id={active}
  t={{ fg, muted, labelTertiary: isDark ? DARK_MUTED : LIGHT_LABEL_TERTIARY, labelQuaternary: isDark ? DARK_MUTED : LIGHT_LABEL_QUATERNARY, faint, faintBorder, raised, softFill, baseCard, cardShadow }}
  accountName={accountName}
  accountEmail={accountEmail}
  accountInitials={accountInitials}
 />
 </main>
 </div>
 </div>
 );
}

type Tokens = {
 fg: string; muted: string; labelTertiary: string; labelQuaternary: string; faint: string; faintBorder: string; raised: string; softFill: string;
 baseCard: React.CSSProperties; cardShadow: string;
};

const modalBackdrop: React.CSSProperties = {
 position: "fixed",
 inset: 0,
 zIndex: 100,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 padding: 16,
 background: "rgba(0,0,0,.58)",
};
const primaryButton: React.CSSProperties = {
 height: 40,
 padding: "0 16px",
 border: 0,
 borderRadius: 8,
 background: COBALT,
 color: "#fff",
 fontSize: 12,
 fontWeight: 700,
 cursor: "pointer",
};
const modalActions: React.CSSProperties = {
 display: "flex",
 justifyContent: "flex-end",
 gap: 8,
 marginTop: 22,
};
const secondaryButton = (t: Tokens): React.CSSProperties => ({
 height: 40,
 padding: "0 16px",
 border: `1px solid ${t.faintBorder}`,
 borderRadius: 8,
 background: "transparent",
 color: t.fg,
 fontSize: 12,
 fontWeight: 700,
 cursor: "pointer",
});

function SectionHeading({ eyebrow, title, desc, t }: { eyebrow: string; title: string; desc: string; t: Tokens }) {
 return (
 <div style={{ marginBottom: 32, maxWidth: 820 }}>
 <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: COBALT, marginBottom: 10 }}>{eyebrow}</div>
 <h1 style={{ fontSize: "clamp(32px,3.6vw,44px)", fontWeight: 900, letterSpacing: "-0.035em", lineHeight: 1, margin: 0, marginBottom: 10, fontStretch: "90%", color: t.fg }}>{title}</h1>
 <p style={{ fontSize: 14.5, color: t.labelTertiary, margin: 0, lineHeight: 1.55, maxWidth: 640 }}>{desc}</p>
 </div>
 );
}

function Field({ label, value, placeholder, onChange, t }: { label: string; value?: string; placeholder?: string; onChange?: (value: string) => void; t: Tokens }) {
 return (
 <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
 <span style={{ fontSize: 11, fontWeight: 700, color: t.labelQuaternary, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
 <input value={value ?? ""} onChange={onChange ? (event) => onChange(event.target.value) : undefined} placeholder={placeholder} style={{ height: 42, padding: "0 14px", border: `1px solid ${t.faintBorder}`, borderRadius: 8, background: t.softFill, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit", letterSpacing: "-0.01em" }} />
 </label>
 );
}

type AccountIdentity = {
 accountName: string;
 accountEmail: string;
 accountInitials: string;
};

function Section({ id, t, accountName, accountEmail, accountInitials }: { id: SectionId; t: Tokens } & AccountIdentity) {
 switch (id) {
 case "organization": return <Organization t={t} />;
 case "access": return <Access t={t} />;
 case "members": return <Members t={t} accountName={accountName} accountEmail={accountEmail} accountInitials={accountInitials} />;
 case "subscriptions": return <Subscriptions t={t} />;
 case "billing": return <Billing t={t} />;
 case "chat": return <ChatSection t={t} />;
 case "api-keys": return <APIKeys t={t} />;
 case "usage": return <Usage t={t} />;
 case "limits": return <Limits t={t} />;
 case "workspaces": return <Workspaces t={t} />;
 case "privacy": return <Privacy t={t} />;
 }
}

/* ─────────── Panels ─────────── */

function Organization({ t }: { t: Tokens }) {
 const [form, setForm] = useState({
  name: "Crystal Studio",
  domain: "alternusart.com",
  email: "billing@alternusart.com",
  country: "Albania",
 });
 const [savedAt, setSavedAt] = useState("2 days ago");
 const [saveMessage, setSaveMessage] = useState("");

 useEffect(() => {
  const saved = window.localStorage.getItem("crystal-organization-settings");
  if (!saved) return;
  try {
   const parsed = JSON.parse(saved) as Partial<typeof form> & { savedAt?: string };
   setForm((current) => ({ ...current, ...parsed }));
   if (parsed.savedAt) setSavedAt(parsed.savedAt);
  } catch {
   window.localStorage.removeItem("crystal-organization-settings");
  }
 }, []);

 const updateField = (field: keyof typeof form, value: string) => {
  setForm((current) => ({ ...current, [field]: value }));
  setSaveMessage("");
 };

 const saveChanges = () => {
  const savedAtValue = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  window.localStorage.setItem("crystal-organization-settings", JSON.stringify({ ...form, savedAt: savedAtValue }));
  setSavedAt(savedAtValue);
  setSaveMessage("Changes saved successfully.");
 };

 return (
 <>
 <SectionHeading eyebrow="§ ORGANIZATION" title="Your organization." desc="Public name, logo, and domain that everyone in your workspace sees." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 720 }}>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
 <Field label="Organization name" value={form.name} onChange={(value) => updateField("name", value)} t={t} />
 <Field label="Primary domain" value={form.domain} onChange={(value) => updateField("domain", value)} t={t} />
 <Field label="Billing email" value={form.email} onChange={(value) => updateField("email", value)} t={t} />
 <Field label="Country" value={form.country} onChange={(value) => updateField("country", value)} t={t} />
 </div>
 <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.faintBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
 <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
 <div style={{ fontSize: 12, color: t.muted }}>Last updated · {savedAt}</div>
 {saveMessage && <div role="status" style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>{saveMessage}</div>}
 </div>
 <button type="button" onClick={saveChanges} style={{ height: 40, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>Save changes</button>
 </div>
 </div>
 </>
 );
}

function Access({ t }: { t: Tokens }) {
 type AccessRow = { role: string; can: string[]; count: number };
 const [rows, setRows] = useState<AccessRow[]>([
 { role: "Owner", can: ["manage org", "billing", "invite", "delete"], count: 1 },
 { role: "Admin", can: ["manage workspaces", "invite", "view billing"], count: 2 },
 { role: "Member", can: ["use workspace", "create tasks"], count: 12 },
 { role: "Guest", can: ["view-only"], count: 4 },
 ]);
 const [editingRole, setEditingRole] = useState<string | null>(null);
 const [draft, setDraft] = useState<AccessRow | null>(null);
 const [saveMessage, setSaveMessage] = useState("");

 useEffect(() => {
  const saved = window.localStorage.getItem("crystal-access-settings");
  if (!saved) return;
  try {
   setRows(JSON.parse(saved) as AccessRow[]);
  } catch {
   window.localStorage.removeItem("crystal-access-settings");
  }
 }, []);

 const startEditing = (row: AccessRow) => {
  setEditingRole(row.role);
  setDraft({ ...row, can: [...row.can] });
  setSaveMessage("");
 };

 const saveRole = () => {
  if (!draft) return;
  const nextRows = rows.map((row) => row.role === editingRole ? draft : row);
  setRows(nextRows);
  window.localStorage.setItem("crystal-access-settings", JSON.stringify(nextRows));
  setEditingRole(null);
  setDraft(null);
  setSaveMessage("Permissions saved successfully.");
 };

 return (
 <>
 <SectionHeading eyebrow="§ ACCESS" title="Roles and permissions." desc="Who can do what inside your organization." t={t} />
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {rows.map((r, i) => (
  <div key={r.role}>
 <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 80px", gap: 16, padding: "20px 24px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.015em" }}>{r.role}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{r.count} seat{r.count === 1 ? "" : "s"}</div>
 </div>
 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
 {r.can.map((c) => (
 <span key={c} style={{ fontSize: 11, color: COBALT, background: `${COBALT}10`, padding: "4px 10px", borderRadius: 999, fontWeight: 600 }}>{c}</span>
 ))}
 </div>
 <button type="button" onClick={() => startEditing(r)} style={{ fontSize: 12, fontWeight: 700, color: t.muted, background: "transparent", border: `1px solid ${t.faintBorder}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Edit</button>
 </div>
 {editingRole === r.role && draft && (
 <div style={{ padding: "18px 24px 22px", borderTop: `1px solid ${t.faintBorder}`, background: t.softFill }}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 14, marginBottom: 14 }}>
   <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Role</span>
    <input value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} style={{ height: 36, padding: "0 10px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 13 }} />
   </label>
   <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Seats</span>
    <input type="number" min={0} value={draft.count} onChange={(event) => setDraft({ ...draft, count: Math.max(0, Number(event.target.value) || 0) })} style={{ height: 36, padding: "0 10px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 13 }} />
   </label>
  </div>
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
   <span style={{ fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Permissions (comma separated)</span>
   <input value={draft.can.join(", ")} onChange={(event) => setDraft({ ...draft, can: event.target.value.split(",").map((permission) => permission.trim()).filter(Boolean) })} style={{ height: 36, padding: "0 10px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 13 }} />
  </label>
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
   <button type="button" onClick={() => { setEditingRole(null); setDraft(null); }} style={{ height: 34, padding: "0 14px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: "transparent", color: t.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
   <button type="button" onClick={saveRole} style={{ height: 34, padding: "0 14px", border: "none", borderRadius: 7, background: COBALT, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
  </div>
 </div>
 )}
 </div>
 ))}
 </div>
 {saveMessage && <div role="status" style={{ marginTop: 12, color: "#16A34A", fontSize: 12, fontWeight: 700 }}>{saveMessage}</div>}
 </>
 );
}

function Members({ t, accountName, accountEmail, accountInitials }: { t: Tokens } & AccountIdentity) {
 type Member = { n: string; e: string; r: string; c: string };
 const defaultPeople: Member[] = [
 { n: accountName, e: accountEmail, r: "Owner", c: accountInitials },
 { n: "Maya Ibrahim", e: "maya@alternusart.com", r: "Admin", c: "MI" },
 { n: "Luca Ferrari", e: "luca@alternusart.com", r: "Member", c: "LF" },
 { n: "Priya Sharma", e: "priya@alternusart.com", r: "Member", c: "PS" },
 { n: "David Chen", e: "david@alternusart.com", r: "Guest", c: "DC" },
 ];
 const [people, setPeople] = useState<Member[]>(defaultPeople);
 const [email, setEmail] = useState("");
 const [notice, setNotice] = useState("");
 const [openMenu, setOpenMenu] = useState<string | null>(null);
 const [editingEmail, setEditingEmail] = useState<string | null>(null);
 const [draft, setDraft] = useState<Member | null>(null);

 useEffect(() => {
  const saved = window.localStorage.getItem("crystal-members");
  if (!saved) return;
  try {
   setPeople(JSON.parse(saved) as Member[]);
  } catch {
   window.localStorage.removeItem("crystal-members");
  }
 }, []);

 const persist = (next: Member[]) => {
  setPeople(next);
  window.localStorage.setItem("crystal-members", JSON.stringify(next));
 };

 const inviteMember = () => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
   setNotice("Enter a valid email address.");
   return;
  }
  if (people.some((person) => person.e === normalizedEmail)) {
   setNotice("This email is already a member.");
   return;
  }
  const name = normalizedEmail.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  persist([...people, { n: name || "New member", e: normalizedEmail, r: "Member", c: initials || "NM" }]);
  setEmail("");
  setNotice("Invitation added successfully.");
 };

 const startEdit = (person: Member) => {
  setEditingEmail(person.e);
  setDraft({ ...person });
  setOpenMenu(null);
 };

 const saveEdit = () => {
  if (!draft) return;
  persist(people.map((person) => person.e === editingEmail ? draft : person));
  setEditingEmail(null);
  setDraft(null);
  setNotice("Member details updated.");
 };

 const deleteMember = (person: Member) => {
  if (person.r === "Owner") {
   setNotice("The organization owner cannot be deleted.");
   setOpenMenu(null);
   return;
  }
  persist(people.filter((item) => item.e !== person.e));
  setOpenMenu(null);
  if (editingEmail === person.e) {
   setEditingEmail(null);
   setDraft(null);
  }
  setNotice(`${person.n} was removed from the organization.`);
 };

 return (
 <>
 <SectionHeading eyebrow="§ MEMBERS" title="Team members." desc="Invite your team, assign roles, and manage seat usage." t={t} />
 <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
 <input value={email} onChange={(event) => { setEmail(event.target.value); setNotice(""); }} onKeyDown={(event) => { if (event.key === "Enter") inviteMember(); }} placeholder="Add by email…" style={{ flex: 1, maxWidth: 420, height: 42, padding: "0 14px", border: `1px solid ${t.faintBorder}`, borderRadius: 8, background: t.softFill, color: t.fg, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
 <button type="button" onClick={inviteMember} style={{ height: 42, padding: "0 20px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>+ Invite</button>
 </div>
 {notice && <div role="status" style={{ marginTop: -8, marginBottom: 14, color: notice.includes("successfully") || notice.includes("updated") ? "#16A34A" : "#EF4444", fontSize: 12, fontWeight: 700 }}>{notice}</div>}
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {people.map((p, i) => (
 <div key={p.e} className="group">
 <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 120px 80px", gap: 16, padding: "16px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{p.c}</div>
 <div style={{ minWidth: 0 }}>
 <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{p.n}</div>
 <div style={{ fontSize: 11.5, color: t.muted }}>{p.e}</div>
 </div>
 <div style={{ fontSize: 11.5, fontWeight: 700, color: t.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.r}</div>
 <div style={{ position: "relative", justifySelf: "end" }}>
 <button type="button" onClick={() => setOpenMenu(openMenu === p.e ? null : p.e)} aria-label={`Actions for ${p.n}`} className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100" style={{ fontSize: 16, lineHeight: 1, color: t.muted, background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px" }}>⋯</button>
 {openMenu === p.e && <div style={{ position: "absolute", right: 0, top: 30, zIndex: 10, minWidth: 130, padding: 5, border: `1px solid ${t.faintBorder}`, borderRadius: 8, background: t.raised, boxShadow: "0 10px 24px rgba(0,0,0,.18)" }}>
 <button type="button" onClick={() => startEdit(p)} className="transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.08]" style={{ display: "block", width: "100%", padding: "8px 10px", border: 0, borderRadius: 5, background: "transparent", color: t.fg, textAlign: "left", fontSize: 12, cursor: "pointer" }}>Edit</button>
 <button type="button" onClick={() => deleteMember(p)} className="transition-colors hover:bg-red-500/[0.10]" style={{ display: "block", width: "100%", padding: "8px 10px", border: 0, borderRadius: 5, background: "transparent", color: "#EF4444", textAlign: "left", fontSize: 12, cursor: "pointer" }}>Delete</button>
 </div>}
 </div>
 </div>
 {editingEmail === p.e && draft && <div style={{ padding: "16px 22px 20px", borderTop: `1px solid ${t.faintBorder}`, background: t.softFill }}>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 10 }}>
 <input value={draft.n} onChange={(event) => setDraft({ ...draft, n: event.target.value, c: event.target.value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "NM" })} aria-label="Member name" style={{ height: 36, padding: "0 10px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 12 }} />
 <input value={draft.e} onChange={(event) => setDraft({ ...draft, e: event.target.value })} aria-label="Member email" style={{ height: 36, padding: "0 10px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 12 }} />
 <select value={draft.r} onChange={(event) => setDraft({ ...draft, r: event.target.value })} aria-label="Member role" style={{ height: 36, padding: "0 8px", border: `1px solid ${t.faintBorder}`, borderRadius: 7, background: t.raised, color: t.fg, fontSize: 12 }}>
  {["Owner", "Admin", "Member", "Guest"].map((role) => <option key={role}>{role}</option>)}
 </select>
 </div>
 <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
  <button type="button" onClick={() => { setEditingEmail(null); setDraft(null); }} style={{ height: 32, padding: "0 12px", border: `1px solid ${t.faintBorder}`, borderRadius: 6, background: "transparent", color: t.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
  <button type="button" onClick={saveEdit} style={{ height: 32, padding: "0 12px", border: 0, borderRadius: 6, background: COBALT, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
 </div>
 </div>}
 </div>
 ))}
 </div>
 </>
 );
}

function Subscriptions({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ SUBSCRIPTIONS" title="Current plan." desc="Your active plan, renewal date, and options to upgrade." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820, borderLeft: `3px solid ${COBALT}` }}>
 <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
 <div>
 <div style={{ fontSize: 10, fontWeight: 800, color: COBALT, letterSpacing: "0.16em", marginBottom: 6 }}>ACTIVE</div>
 <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", fontStretch: "88%" }}>Pro · Yearly</div>
 <div style={{ fontSize: 13.5, color: t.muted, marginTop: 4 }}>Renews 2027-04-24 · $228 / year</div>
 </div>
 <div style={{ display: "flex", gap: 10 }}>
 <Link href="/pricing" style={{ height: 40, padding: "0 18px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Change plan</Link>
 <button style={{ height: 40, padding: "0 18px", background: "transparent", color: t.fg, fontSize: 13, fontWeight: 700, borderRadius: 8, border: `1px solid ${t.faintBorder}`, cursor: "pointer" }}>Cancel</button>
 </div>
 </div>
 <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.faintBorder}`, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
 {[["Unlimited", "agent runs"], ["Claude Opus 4.6", "default model"], ["100 GB", "knowledge layer"]].map(([v, l]) => (
 <div key={l as string}>
 <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{v}</div>
 <div style={{ fontSize: 10.5, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
 </div>
 ))}
 </div>
 </div>
 </>
 );
}

function Billing({ t }: { t: Tokens }) {
 const invoices = [
 { id: "INV-2027-0422", d: "2026-04-24", amt: "$228.00", s: "Paid" },
 { id: "INV-2026-0419", d: "2025-04-24", amt: "$228.00", s: "Paid" },
 { id: "INV-2025-0416", d: "2024-04-24", amt: "$192.00", s: "Paid" },
 ];
 const [paymentOpen, setPaymentOpen] = useState(false);
 const [addressOpen, setAddressOpen] = useState(false);
 const [invoice, setInvoice] = useState<(typeof invoices)[number] | null>(null);
 const [payment, setPayment] = useState({ number: "4242", expiry: "08/29", name: "Crystal Studio" });
 const [address, setAddress] = useState({ company: "Crystal Studio by Alternus Art", street: "Rr. e Kavajës", city: "Tirana 1001", country: "Albania" });
 const [notice, setNotice] = useState("");

 useEffect(() => {
  const savedPayment = window.localStorage.getItem("crystal-payment-method");
  const savedAddress = window.localStorage.getItem("crystal-billing-address");
  if (savedPayment) setPayment(JSON.parse(savedPayment));
  if (savedAddress) setAddress(JSON.parse(savedAddress));
 }, []);

 const savePayment = () => {
  window.localStorage.setItem("crystal-payment-method", JSON.stringify(payment));
  setPaymentOpen(false);
  setNotice("Payment method updated successfully.");
 };

 const saveAddress = () => {
  window.localStorage.setItem("crystal-billing-address", JSON.stringify(address));
  setAddressOpen(false);
  setNotice("Billing address updated successfully.");
 };

 const printInvoice = (selectedInvoice: (typeof invoices)[number]) => {
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
   setNotice("Allow pop-ups to download the invoice.");
   return;
  }
  printWindow.document.write(`<!doctype html><html><head><title>${selectedInvoice.id} - Crystal Studio</title><style>
   *{box-sizing:border-box}body{margin:0;background:#f4f7fb;color:#172033;font:14px Arial,sans-serif}.invoice{width:760px;margin:40px auto;padding:52px;background:#fff;box-shadow:0 12px 40px #17203318}.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #4284ff;padding-bottom:30px}.brand{display:flex;align-items:center;gap:12px;font-size:22px;font-weight:800}.logo{width:38px;height:38px;border-radius:10px;background:#4284ff;display:grid;place-items:center;color:#fff;font-size:24px}.muted{color:#65728a}.right{text-align:right}.title{font-size:34px;font-weight:800;margin:38px 0 8px}.meta{display:flex;justify-content:space-between;margin:32px 0}.box{background:#f4f7fb;border-radius:10px;padding:18px;min-width:220px}.table{width:100%;border-collapse:collapse;margin-top:30px}.table th,.table td{text-align:left;padding:16px 0;border-bottom:1px solid #e4e9f1}.table th{color:#65728a;font-size:11px;text-transform:uppercase;letter-spacing:.12em}.total{text-align:right;font-size:25px;font-weight:800;margin-top:26px}.paid{display:inline-block;color:#149447;background:#e4f7eb;border-radius:999px;padding:5px 12px;font-size:11px;font-weight:700;text-transform:uppercase}.foot{margin-top:70px;padding-top:18px;border-top:1px solid #e4e9f1;color:#65728a;font-size:12px}@media print{body{background:#fff}.invoice{margin:0;width:auto;box-shadow:none}}
  </style></head><body><main class="invoice"><div class="top"><div class="brand"><span class="logo">✦</span>Crystal Studio</div><div class="right"><strong>INVOICE</strong><br><span class="muted">${selectedInvoice.id}</span></div></div><div class="title">Invoice</div><div class="meta"><div class="box"><strong>From</strong><br>Crystal Studio by Alternus Art<br>Rr. e Kavajës, Tirana 1001<br>Albania</div><div class="box"><strong>Invoice details</strong><br>Date: ${selectedInvoice.d}<br>Status: <span class="paid">${selectedInvoice.s}</span></div></div><table class="table"><thead><tr><th>Description</th><th>Date</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td>Crystal Studio professional subscription</td><td>${selectedInvoice.d}</td><td style="text-align:right">${selectedInvoice.amt}</td></tr></tbody></table><div class="total">Total paid: ${selectedInvoice.amt}</div><div class="foot">Thank you for choosing Crystal Studio. This invoice was generated from your account billing history.</div></main><script>window.onload=()=>window.print()<\/script></body></html>`);
  printWindow.document.close();
 };

 return (
 <>
 <SectionHeading eyebrow="§ BILLING" title="Billing." desc="Manage your payment method, billing address, and download invoices." t={t} />

 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 820, marginBottom: 28 }}>
 <div style={{ ...t.baseCard, padding: 22 }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Payment method</div>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ width: 44, height: 30, borderRadius: 6, background: `linear-gradient(135deg,${COBALT},#7DA9FF)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>VISA</div>
 <div>
 <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-geist-mono),monospace" }}>•••• {payment.number}</div>
 <div style={{ fontSize: 11, color: t.muted }}>Expires {payment.expiry}</div>
 </div>
 </div>
 <button type="button" onClick={() => setPaymentOpen(true)} style={{ marginTop: 18, fontSize: 12.5, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Update payment method →</button>
 </div>
 <div style={{ ...t.baseCard, padding: 22 }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Billing address</div>
 <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
 {address.company}<br/>{address.street}, {address.city}<br/>{address.country}
 </div>
 <button type="button" onClick={() => setAddressOpen(true)} style={{ marginTop: 18, fontSize: 12.5, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>Edit address →</button>
 </div>
 </div>

 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 <div style={{ padding: "14px 22px", borderBottom: `1px solid ${t.faintBorder}`, display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 90px 80px", gap: 12, fontSize: 10, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase", background: t.softFill }}>
 <span>Invoice</span><span>Date</span><span>Amount</span><span>Status</span><span></span>
 </div>
 {invoices.map((inv, i) => (
 <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 90px 80px", gap: 12, padding: "16px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <span style={{ fontSize: 12.5, fontFamily: "var(--font-geist-mono),monospace", color: t.fg }}>{inv.id}</span>
 <span style={{ fontSize: 12.5, color: t.muted }}>{inv.d}</span>
 <span style={{ fontSize: 13, fontWeight: 700 }}>{inv.amt}</span>
 <span style={{ fontSize: 10.5, fontWeight: 800, color: "#22C55E", background: "rgba(34,197,94,0.1)", padding: "3px 10px", borderRadius: 999, justifySelf: "start", letterSpacing: "0.06em" }}>{inv.s.toUpperCase()}</span>
 <button type="button" onClick={() => setInvoice(inv)} style={{ fontSize: 12, fontWeight: 700, color: COBALT, background: "transparent", border: "none", cursor: "pointer", justifySelf: "end" }}>PDF ↓</button>
 </div>
 ))}
 </div>
 {notice && <div role="status" style={{ marginTop: 12, color: "#16A34A", fontSize: 12, fontWeight: 700 }}>{notice}</div>}
 {paymentOpen && <div style={modalBackdrop}><div style={{ ...t.baseCard, width: "min(440px, calc(100vw - 32px))", padding: 24 }}>
  <h2 style={{ margin: 0, fontSize: 20 }}>Update payment method</h2>
  <div style={{ display: "grid", gap: 12, marginTop: 18 }}><Field label="Card last four digits" value={payment.number} onChange={(value) => setPayment({ ...payment, number: value.replace(/\D/g, "").slice(-4) })} t={t} /><Field label="Expiry" value={payment.expiry} onChange={(value) => setPayment({ ...payment, expiry: value })} t={t} /><Field label="Name on card" value={payment.name} onChange={(value) => setPayment({ ...payment, name: value })} t={t} /></div>
  <div style={modalActions}><button type="button" onClick={() => setPaymentOpen(false)} style={secondaryButton(t)}>Cancel</button><button type="button" onClick={savePayment} style={primaryButton}>Save payment method</button></div>
 </div></div>}
 {addressOpen && <div style={modalBackdrop}><div style={{ ...t.baseCard, width: "min(520px, calc(100vw - 32px))", padding: 24 }}>
  <h2 style={{ margin: 0, fontSize: 20 }}>Edit billing address</h2>
  <div style={{ display: "grid", gap: 12, marginTop: 18 }}><Field label="Company" value={address.company} onChange={(value) => setAddress({ ...address, company: value })} t={t} /><Field label="Street" value={address.street} onChange={(value) => setAddress({ ...address, street: value })} t={t} /><Field label="City and postal code" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} t={t} /><Field label="Country" value={address.country} onChange={(value) => setAddress({ ...address, country: value })} t={t} /></div>
  <div style={modalActions}><button type="button" onClick={() => setAddressOpen(false)} style={secondaryButton(t)}>Cancel</button><button type="button" onClick={saveAddress} style={primaryButton}>Save address</button></div>
 </div></div>}
 {invoice && <div style={modalBackdrop}><div style={{ ...t.baseCard, width: "min(680px, calc(100vw - 32px))", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: 32 }}>
  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `2px solid ${COBALT}`, paddingBottom: 18 }}><div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 900 }}><CoreforgeLogo size={34} radius={9} /> Crystal Studio</div><div style={{ textAlign: "right", fontSize: 12, color: t.muted }}>INVOICE<br/><strong style={{ color: t.fg }}>{invoice.id}</strong></div></div>
  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 20 }}><div style={{ fontSize: 13, lineHeight: 1.6 }}><strong>Crystal Studio by Alternus Art</strong><br/>Rr. e Kavajës, Tirana 1001<br/>Albania</div><div style={{ textAlign: "right", fontSize: 13, lineHeight: 1.6 }}><strong>Date</strong><br/>{invoice.d}<br/><span style={{ color: "#16A34A", fontWeight: 700 }}>PAID</span></div></div>
  <div style={{ marginTop: 30, padding: "18px 0", borderTop: `1px solid ${t.faintBorder}`, borderBottom: `1px solid ${t.faintBorder}`, display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>Crystal Studio professional subscription</span><strong>{invoice.amt}</strong></div>
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}><button type="button" onClick={() => printInvoice(invoice)} style={primaryButton}>Download / Save PDF</button><button type="button" onClick={() => setInvoice(null)} style={secondaryButton(t)}>Close</button></div>
 </div></div>}
 </>
 );
}

function ChatSection({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ CHAT" title="Chat preferences." desc="Tune the default model, tone, and memory used by the agent in your workspaces." t={t} />

 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820, marginBottom: 20 }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 16 }}>Default model</div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
 {[
 { id: "opus", n: "Claude Opus 4.6", d: "Default · most capable", active: true },
 { id: "sonnet", n: "Claude Sonnet 4.6", d: "Balanced latency + cost", active: false },
 { id: "haiku", n: "Claude Haiku 4.5", d: "Fastest · cheapest", active: false },
 ].map((m) => (
 <div key={m.id} style={{ padding: 16, border: `1px solid ${m.active ? COBALT : t.faintBorder}`, borderRadius: 10, background: m.active ? `${COBALT}08` : "transparent", cursor: "pointer" }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>{m.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{m.d}</div>
 {m.active && <div style={{ marginTop: 10, fontSize: 10, fontWeight: 800, color: COBALT, letterSpacing: "0.12em" }}>✓ ACTIVE</div>}
 </div>
 ))}
 </div>
 </div>

 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 16 }}>Memory across sessions</div>
 <Toggle label="Remember context across sessions" desc="The agent keeps a summary of past conversations for personalization." on t={t} />
 <Toggle label="Cite sources from your files" desc="When answering, link to the file and line the answer was pulled from." on t={t} />
 <Toggle label="Show reasoning steps" desc="Expose intermediate tool calls while the agent is thinking." on={false} t={t} />
 </div>
 </>
 );
}

function APIKeys({ t }: { t: Tokens }) {
 const keys = [
 { n: "Production", p: "sk-alt_live_•••••2k9f", c: "2026-01-12", last: "2h ago" },
 { n: "CI · Vercel", p: "sk-alt_live_•••••mc41", c: "2026-03-08", last: "yesterday" },
 { n: "Local dev", p: "sk-alt_test_•••••a0b3", c: "2026-04-20", last: "today" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ API KEYS" title="API keys." desc="Keys the agent runtime will accept. Rotate often, never commit them." t={t} />
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, maxWidth: 820 }}>
 <div style={{ fontSize: 12.5, color: t.muted }}>{keys.length} keys · 2 live / 1 test</div>
 <button style={{ height: 40, padding: "0 18px", background: COBALT, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", borderRadius: 8, cursor: "pointer" }}>+ Create key</button>
 </div>
 <div style={{ ...t.baseCard, overflow: "hidden", maxWidth: 820 }}>
 {keys.map((k, i) => (
 <div key={k.p} style={{ display: "grid", gridTemplateColumns: "200px 1fr auto auto", gap: 16, padding: "18px 22px", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{k.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>Created {k.c}</div>
 </div>
 <code style={{ fontSize: 12, fontFamily: "var(--font-geist-mono),monospace", color: t.muted, background: t.softFill, padding: "6px 10px", borderRadius: 6, justifySelf: "start" }}>{k.p}</code>
 <span style={{ fontSize: 11.5, color: t.muted }}>Used {k.last}</span>
 <button style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "transparent", border: "none", cursor: "pointer" }}>Revoke</button>
 </div>
 ))}
 </div>
 </>
 );
}

function Usage({ t }: { t: Tokens }) {
 const [range, setRange] = useState<"7d" | "15d" | "30d" | "90d">("15d");
 const usageByRange: Record<typeof range, number[]> = {
  "7d": [58, 74, 63, 89, 77, 95, 68],
  "15d": [42, 68, 55, 88, 74, 92, 61, 72, 80, 95, 67, 58, 77, 89, 93],
  "30d": [35, 48, 52, 66, 59, 73, 81, 62, 76, 84, 69, 91, 78, 64, 88, 94, 71, 83, 57, 75, 86, 92, 68, 79, 87, 96, 73, 82, 90, 85],
  "90d": [28, 35, 42, 51, 46, 62, 58, 71, 64, 76, 69, 82, 74, 88, 79, 91, 84, 73, 86, 95, 81, 77, 89, 93, 72, 83, 96, 87, 78, 92],
 };
 const bars = usageByRange[range];
 const peak = Math.max(...bars);
 const average = Math.round(bars.reduce((sum, value) => sum + value, 0) / bars.length);
 const periodLabel = range === "7d" ? "last 7 days" : range === "15d" ? "last 15 days" : range === "30d" ? "last 30 days" : "last 90 days";
 const periodMultiplier = range === "7d" ? 0.48 : range === "15d" ? 1 : range === "30d" ? 1.9 : 5.6;
 const agentRuns = Math.round(3482 * periodMultiplier).toLocaleString();
 const knowledge = (42.8 * Math.min(1.4, periodMultiplier)).toFixed(1);
 const voice = (12.4 * Math.min(1.4, periodMultiplier)).toFixed(1);
 return (
 <>
 <SectionHeading eyebrow="§ USAGE" title="Usage this period." desc="Agent runs, knowledge indexing, and voice minutes used since 2026-04-01." t={t} />

 {/* Stat triplet */}
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, maxWidth: 820, marginBottom: 20 }}>
 {[
 { v: agentRuns, l: "Agent runs", pct: 34, max: "of unlimited", consumed: "Unlimited", remaining: "No cap" },
 { v: `${knowledge} GB`, l: "Knowledge", pct: 43, max: "of 100 GB", consumed: `${knowledge}%`, remaining: `${(100 - Number(knowledge)).toFixed(1)} GB left` },
 { v: `${voice} h`, l: "Voice minutes", pct: 21, max: "of 60 h", consumed: `${((Number(voice) / 60) * 100).toFixed(1)}%`, remaining: `${(60 - Number(voice)).toFixed(1)} h left` },
 ].map((s) => (
 <div key={s.l} style={{ ...t.baseCard, padding: "20px 22px" }}>
 <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{s.l}</div>
 <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.035em", fontStretch: "88%", color: t.fg }}>{s.v}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{s.max}</div>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
 <div>
 <div style={{ fontSize: 9, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Consumed</div>
 <div style={{ fontSize: 13, fontWeight: 800, color: COBALT, marginTop: 3 }}>{s.consumed}</div>
 </div>
 <div>
 <div style={{ fontSize: 9, fontWeight: 800, color: t.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Remaining</div>
 <div style={{ fontSize: 13, fontWeight: 800, color: t.fg, marginTop: 3 }}>{s.remaining}</div>
 </div>
 </div>
 <div style={{ marginTop: 14, height: 4, background: t.softFill, borderRadius: 2, overflow: "hidden" }}>
 <div style={{ width: `${s.pct}%`, height: "100%", background: COBALT, borderRadius: 2 }} />
 </div>
 </div>
 ))}
 </div>

 {/* Chart card */}
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
 <div>
 <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.01em" }}>Agent runs · {periodLabel}</div>
 <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>Peak {peak} runs/day · avg {average}</div>
 </div>
 <div style={{ display: "flex", gap: 6 }}>
 {["7d", "15d", "30d", "90d"].map((r) => (
 <button key={r} onClick={() => setRange(r as typeof range)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 700, background: range === r ? COBALT : "transparent", color: range === r ? "#fff" : t.muted, border: range === r ? "none" : `1px solid ${t.faintBorder}`, borderRadius: 6, cursor: "pointer" }}>{r}</button>
 ))}
 </div>
 </div>
 <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, paddingTop: 20 }}>
 {bars.map((h, i) => (
 <div key={i} title={`${h} runs`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
 <div style={{ width: "100%", height: `${h}%`, background: COBALT, opacity: 0.15 + (h / 100) * 0.85, borderRadius: "4px 4px 0 0" }} />
 <span style={{ fontSize: 9, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>{i + 1}</span>
 </div>
 ))}
 </div>
 </div>
 </>
 );
}

function Limits({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ LIMITS" title="Rate limits." desc="Hard caps to prevent runaway usage. Warnings trigger before the cap is hit." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 {[
 { l: "Requests per minute", v: "600", max: "max 1,200" },
 { l: "Agent runs per day", v: "∞", max: "unlimited on Pro" },
 { l: "Knowledge upload", v: "100 MB", max: "per file" },
 { l: "Voice minutes per day", v: "120", max: "of 60h / month" },
 ].map((r, i) => (
 <div key={r.l} style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", gap: 16, padding: "18px 0", borderTop: i > 0 ? `1px solid ${t.faintBorder}` : "none", alignItems: "center" }}>
 <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{r.l}</div>
 <div style={{ fontSize: 18, fontWeight: 900, color: COBALT, letterSpacing: "-0.02em", fontStretch: "88%" }}>{r.v}</div>
 <div style={{ fontSize: 11.5, color: t.muted }}>{r.max}</div>
 </div>
 ))}
 </div>
 </>
 );
}

function Workspaces({ t }: { t: Tokens }) {
 const list = [
 { n: "Personal", m: 1, s: "Pro", u: "today" },
 { n: "Design team", m: 6, s: "Team", u: "2h ago" },
 { n: "Research", m: 3, s: "Team", u: "yesterday" },
 ];
 return (
 <>
 <SectionHeading eyebrow="§ WORKSPACES" title="Your workspaces." desc="Each workspace has its own knowledge layer, members, and billing line." t={t} />
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, maxWidth: 820 }}>
 {list.map((w) => (
 <div key={w.n} style={{ ...t.baseCard, padding: 20 }}>
 <div style={{ width: 32, height: 32, borderRadius: 8, background: `${COBALT}14`, color: COBALT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>{w.n[0]}</div>
 <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>{w.n}</div>
 <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>{w.m} member{w.m === 1 ? "" : "s"} · {w.s}</div>
 <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${t.faintBorder}`, fontSize: 11, color: t.muted }}>Active {w.u}</div>
 </div>
 ))}
 <button style={{ ...t.baseCard, padding: 20, border: `1px dashed ${t.faint}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", cursor: "pointer", minHeight: 140, color: t.muted }}>
 <span style={{ fontSize: 20, color: COBALT }}>+</span>
 <span style={{ fontSize: 12, fontWeight: 600 }}>New workspace</span>
 </button>
 </div>
 </>
 );
}

function Privacy({ t }: { t: Tokens }) {
 return (
 <>
 <SectionHeading eyebrow="§ PRIVACY" title="Privacy controls." desc="Decide what the agent remembers, what it logs, and who can see what." t={t} />
 <div style={{ ...t.baseCard, padding: 28, maxWidth: 820 }}>
 <Toggle label="Allow product improvements" desc="Share anonymized usage events to help us improve the product. No workspace content is ever shared." on t={t} />
 <Toggle label="Persist agent memory" desc="Let the agent keep a summary of past sessions so it doesn't re-ask you." on t={t} />
 <Toggle label="Record voice sessions" desc="Keep audio recordings of voice-mode sessions for later playback." on={false} t={t} />
 <Toggle label="Third-party integrations" desc="Allow connected apps (Slack, GitHub, Linear) to read your knowledge layer." on t={t} />
 </div>

 <div style={{ marginTop: 20, padding: 20, border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, background: "rgba(239,68,68,0.04)", maxWidth: 820, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
 <div>
 <div style={{ fontSize: 13.5, fontWeight: 800, color: "#EF4444", letterSpacing: "-0.01em" }}>Delete account</div>
 <div style={{ fontSize: 12, color: t.muted, marginTop: 4, maxWidth: 500 }}>
 Deletes your workspace, knowledge layer, and all memory. Cannot be undone.
 </div>
 </div>
 <button style={{ height: 38, padding: "0 18px", background: "transparent", color: "#EF4444", fontSize: 12.5, fontWeight: 700, border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap" }}>Delete account</button>
 </div>
 </>
 );
}

function Toggle({ label, desc, on, t }: { label: string; desc: string; on: boolean; t: Tokens }) {
 const [state, setState] = useState(on);
 return (
 <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "16px 0", borderTop: `1px solid ${t.faintBorder}`, alignItems: "center" }}>
 <div>
 <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{label}</div>
 <div style={{ fontSize: 12, color: t.muted, marginTop: 4, lineHeight: 1.5, maxWidth: 560 }}>{desc}</div>
 </div>
 <button onClick={() => setState(!state)} style={{ width: 44, height: 24, borderRadius: 999, border: "none", background: state ? COBALT : t.faint, cursor: "pointer", position: "relative" }}>
 <span style={{ position: "absolute", top: 3, left: state ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
 </button>
 </div>
 );
}
