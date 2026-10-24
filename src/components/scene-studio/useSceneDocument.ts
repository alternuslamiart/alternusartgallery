"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { commitHistory, createTemplate, makeDocument, redoHistory, undoHistory, validateDocument, type SceneDocument, type SceneHistory } from "@/lib/scene/document.mjs";
import { readRecovery, writeRecovery } from "@/lib/scene/recovery";

export function useSceneDocument(studio: string, identity: string, authenticated: boolean, requestedId?: string) {
  const [history, setHistory] = useState<SceneHistory>(() => {
    const document = makeDocument(studio);
    document.objects = createTemplate(studio === "architecture" ? "building" : studio === "interior" ? "room" : "intersection");
    return { past: [], present: document, future: [] };
  });
  const [ready, setReady] = useState(false), [status, setStatus] = useState("Opening project…"), [conflict, setConflict] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const revision = useRef(0), cloudHash = useRef(""), localHash = useRef("");
  const current = useRef(history.present); current.current = history.present;
  const mounted = useRef(true), blocked = useRef(false), queue = useRef(Promise.resolve());
  const scope = `casynus:scene-active:${identity}`;
  const remember = (document: SceneDocument) => {
    try { sessionStorage.setItem(scope, document.id); } catch { /* Optional pointer, not scene storage. */ }
    const url = new URL(window.location.href); url.searchParams.set("project", document.id);
    url.searchParams.delete("cloud");
    window.history.replaceState(window.history.state, "", url);
  };
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    let cancelled = false;
    void (async () => {
      let id = requestedId;
      const preferCloud = new URL(window.location.href).searchParams.get("cloud") === "1";
      if (!id) { try { id = sessionStorage.getItem(scope) ?? undefined; } catch {} }
      let recovered = null;
      if (id) { try { recovered = await readRecovery(identity, id); } catch { if (!cancelled) setFailure("Browser recovery is unavailable. Download JSON before leaving if cloud saving fails."); } }
      let document = recovered?.document ?? current.current;
      revision.current = recovered?.revision ?? 0;
      let loadedCloud = false;
      if (authenticated && id) {
        try {
          const response = await fetch(`/api/studio-projects?id=${encodeURIComponent(id)}`, { signal: controller.signal, cache: "no-store" });
          const data = await response.json();
          if (!response.ok) { if (response.status !== 404 || !recovered) throw new Error(data.error || "Could not open cloud project."); }
          else {
            const cloud = validateDocument(data.document);
            cloudHash.current = JSON.stringify(cloud); loadedCloud = true;
            if (!preferCloud && recovered?.dirty && JSON.stringify(recovered.document) !== JSON.stringify(cloud) && recovered.revision !== data.revision) {
              blocked.current = true; setConflict(true);
              setFailure("A newer cloud revision exists. Recovery is preserved. Open the cloud copy or save this recovery as a new project.");
            } else { document = !preferCloud && recovered?.dirty ? recovered.document : cloud; revision.current = data.revision; }
          }
        } catch (caught) {
          if (cancelled) return;
          if (requestedId && !recovered) { setFailure(caught instanceof Error ? caught.message : "Project unavailable."); setStatus("Project could not be opened"); return; }
          setFailure("Cloud project could not be loaded. Editing the browser recovery copy.");
        }
      } else if (requestedId && !recovered) {
        setFailure("This project is not in this browser's recovery storage. Sign in to reopen a saved project."); setStatus("Project not available"); return;
      }
      if (cancelled) return;
      setHistory({ past: [], present: document, future: [] });
      remember(document); setReady(true);
      setStatus(loadedCloud ? "Cloud project opened" : authenticated ? "Ready to save" : "Browser recovery · sign in for cloud storage");
    })();
    return () => { cancelled = true; mounted.current = false; controller.abort(); };
  }, [identity, authenticated, requestedId, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const recover = useCallback(async () => {
    const document = current.current;
    await writeRecovery(identity, { document, revision: revision.current, dirty: JSON.stringify(document) !== cloudHash.current, updatedAt: Date.now() });
    localHash.current = JSON.stringify(document);
  }, [identity]);

  const save = useCallback(() => {
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!mounted.current || blocked.current) return;
      const document = current.current;
      try { await recover(); } catch { if (mounted.current) setFailure("Browser recovery failed. Save to cloud or download JSON before leaving."); }
      if (!mounted.current || current.current.id !== document.id) return;
      if (!authenticated) { if (mounted.current) setStatus("Browser recovery · sign in for cloud storage"); return; }
      if (JSON.stringify(document) === cloudHash.current) return;
      if (mounted.current) setStatus("Saving to workspace…");
      try {
        const response = await fetch("/api/studio-projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ document, revision: revision.current }), signal: AbortSignal.timeout(20_000) });
        const data = await response.json();
        if (!mounted.current || current.current.id !== document.id) return;
        if (!response.ok) {
          if (response.status === 409) { blocked.current = true; if (mounted.current) setConflict(true); }
          throw new Error(data.error || "Cloud save failed.");
        }
        // A new/open project must never inherit a reply from the previous ID.
        if (!mounted.current || current.current.id !== document.id) return;
        revision.current = data.revision; cloudHash.current = JSON.stringify(document);
        await recover(); setStatus(`Saved to workspace · revision ${data.revision}`); setFailure(null);
      } catch (caught) { if (mounted.current && current.current.id === document.id) { setStatus("Not saved to workspace"); setFailure(caught instanceof Error ? caught.message : "Cloud save failed."); } }
    });
    return queue.current;
  }, [authenticated, recover]);

  useEffect(() => {
    if (!ready) return;
    const localTimer = setTimeout(() => { void recover().catch(() => setFailure("Browser recovery failed. Save or download JSON before leaving.")); }, 250);
    const cloudTimer = setTimeout(() => { void save(); }, 1800);
    return () => { clearTimeout(localTimer); clearTimeout(cloudTimer); };
  }, [history.present, ready, save, recover]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (ready && JSON.stringify(current.current) !== localHash.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard);
  }, [ready]);

  const commit = useCallback((document: SceneDocument) => { const parsed=validateDocument(document);setHistory(h => commitHistory(h, parsed)); }, []);
  const saveVerified=async()=>{
    const document=current.current,hash=JSON.stringify(document);
    await save();
    if(!mounted.current||current.current.id!==document.id)throw new Error('Project changed before save was confirmed.');
    if((authenticated?cloudHash.current:localHash.current)!==hash)throw new Error(authenticated?'Workspace save was not confirmed. Check the save error or revision conflict.':'Browser recovery could not be saved. Download JSON before leaving.');
    return authenticated?'Saved to your authenticated workspace.':'Saved in this browser. Sign in for cloud storage.';
  };
  const replace = (document: SceneDocument) => {
    const parsed = validateDocument(document);
    revision.current = 0; cloudHash.current = ""; localHash.current = ""; blocked.current = false;
    setConflict(false); setFailure(null); setReady(true); setStatus("Unsaved project"); setHistory({ past: [], present: parsed, future: [] }); remember(parsed);
  };
  const saveCopy = () => replace({ ...current.current, id: crypto.randomUUID(), name: `${current.current.name.slice(0, 110)} copy` });
  return { document: history.present, history, ready, status, failure, conflict, commit, replace, saveCopy, save, saveVerified, recover,
    rollback:(expected:string)=>setHistory(h=>JSON.stringify([h.present.id,h.present.objects,h.present.environment])===expected&&h.past.length?{past:h.past.slice(0,-1),present:h.past[h.past.length-1],future:[]}:h),
    setCamera: (camera: SceneDocument["camera"]) => setHistory(h => ({ ...h, present: { ...h.present, camera } })),
    undo: () => setHistory(undoHistory), redo: () => setHistory(redoHistory), setFailure };
}
