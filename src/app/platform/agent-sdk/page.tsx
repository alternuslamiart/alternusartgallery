"use client";
import { CerevixPage, COBALT } from "@/components/cerevix-shell";

const install = `npm install @Cerevix/agent`;
const example = `import { Agent } from "@Cerevix/agent";

const agent = new Agent({ model: "claude-opus-4-6" });

await agent.run({
  goal: "Draft an email to the team about Q2 launch",
  tools: ["mail", "files", "calendar"],
});`;

export default function AgentSDK() {
  return (
    <CerevixPage>
      {(t) => (
        <>
          <section style={{ padding: "80px 0 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.24em", fontWeight: 700, color: COBALT, marginBottom: 20 }}>/ @Cerevix/agent</div>
              <h1 style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.95, margin: 0, fontStretch: "88%" }}>
                Three lines<br/>to a working agent.
              </h1>
              <p style={{ marginTop: 28, fontSize: 17, color: t.muted, maxWidth: 560, lineHeight: 1.55 }}>
                The same runtime that powers Cerevix OS — shipped as a typed TypeScript SDK. Bring your own tools, your own memory, your own UI.
              </p>
            </div>
          </section>

          <section style={{ padding: "40px 0 120px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
              {/* Install block */}
              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", marginBottom: 20, background: t.raised }}>
                <div style={{ padding: "10px 16px", borderBottom: `1px solid ${t.faint}`, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: t.muted, fontFamily: "var(--font-geist-mono),monospace" }}>
                  <span>INSTALL</span>
                  <button style={{ background: "transparent", border: "none", color: COBALT, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Copy</button>
                </div>
                <pre style={{ margin: 0, padding: "20px 20px", fontFamily: "var(--font-geist-mono),monospace", fontSize: 14, color: t.fg }}>
                  <span style={{ color: COBALT }}>$</span> {install}
                </pre>
              </div>

              {/* Example block */}
              <div style={{ border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden", background: "#0C1220", boxShadow: `12px 12px 0 0 ${COBALT}` }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }}/>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }}/>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }}/>
                  <span style={{ marginLeft: 16, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-geist-mono),monospace" }}>agent.ts</span>
                </div>
                <pre style={{ margin: 0, padding: "24px 24px", fontFamily: "var(--font-geist-mono),monospace", fontSize: 13.5, color: "#E8EBF3", lineHeight: 1.7, overflow: "auto" }}>
                  <code>{example.split("\n").map((line, i) => (
                    <div key={i}>
                      <span style={{ display: "inline-block", width: 24, color: "rgba(255,255,255,0.25)" }}>{i + 1}</span>
                      <span dangerouslySetInnerHTML={{ __html: line
                        .replace(/(import|from|const|await|new)/g, `<span style="color:${COBALT}">$1</span>`)
                        .replace(/("[^"]*")/g, `<span style="color:#8FD694">$1</span>`)
                        .replace(/(\/\/.*$)/g, `<span style="color:rgba(255,255,255,0.35)">$1</span>`)
                      }}/>
                    </div>
                  ))}</code>
                </pre>
              </div>

              <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0, border: `1px solid ${t.faint}`, borderRadius: 12, overflow: "hidden" }}>
                {[
                  { k: "Streaming", v: "First token < 200ms" },
                  { k: "Tool use", v: "Parallel function calls" },
                  { k: "Memory", v: "Checkpointed, resumable" },
                  { k: "Type-safe", v: "Full TypeScript types" },
                ].map((x, i, a) => (
                  <div key={x.k} style={{ padding: "22px 24px", borderRight: i < a.length - 1 ? `1px solid ${t.faint}` : "none", background: t.raised }}>
                    <div style={{ fontSize: 10, color: t.muted, letterSpacing: "0.12em", marginBottom: 8 }}>{x.k.toUpperCase()}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </CerevixPage>
  );
}
