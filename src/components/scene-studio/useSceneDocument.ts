"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { commitHistory, createTemplate, makeDocument, redoHistory, undoHistory, validateDocument, type SceneDocument, type SceneHistory } from "@/lib/scene/document.mjs";
import { latestRecovery, readRecovery, writeRecovery } from "@/lib/scene/recovery";
import {loadWorkspaceDocument,saveWorkspaceDocument} from '@/lib/scene/workspace-save.mjs';

export function useSceneDocument(studio: string, identity: string, authenticated: boolean, requestedId?: string) {
  const [history, setHistory] = useState<SceneHistory>(() => {
    const document = makeDocument(studio);
    document.objects = createTemplate(studio === "architecture" ? "building" : studio === "interior" ? "room" : "intersection");
    return { past: [], present: document, future: [] };
  });
  const [ready, setReady] = useState(() => !requestedId), [status, setStatus] = useState("Opening project…"), [conflict, setConflict] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const revision = useRef(0), cloudHash = useRef(""), localHash = useRef("");
  const saveFailure=useRef<{id:string;error:Error}|null>(null);
  const current = useRef(history.present); current.current = history.present;
  const mounted = useRef(true), blocked = useRef(false), queue = useRef(Promise.resolve());
  const retryTimer=useRef<ReturnType<typeof setTimeout>|null>(null),retryCount=useRef(0);
  const scope = `casynus:scene-active:${identity}:${studio}`;
  const cloudReadRequired = useRef(false);
  const activeScope = useRef(scope); activeScope.current = scope;
  const openedScope = useRef<string | null>(null);
  const remember = (document: SceneDocument) => {
    try { sessionStorage.setItem(scope, document.id); } catch { /* Optional pointer, not scene storage. */ }
    const url = new URL(window.location.href); url.searchParams.set("project", document.id);
    url.searchParams.delete("cloud");
    window.history.replaceState(window.history.state, "", url);
  };
  useEffect(() => {
    mounted.current = true;
    // StrictMode replays initialization. Keep editing disabled until the latest
    // asynchronous recovery/cloud lookup finishes, so it cannot replace a newly
    // created project while its first authenticated save is in flight.
    if (requestedId) setReady(false);
    openedScope.current = null;
    blocked.current = false; setConflict(false);
    cloudHash.current = ""; localHash.current = ""; saveFailure.current = null;
    const controller = new AbortController();
    let cancelled = false;
    void (async () => {
      let id = requestedId;
      const preferCloud = new URL(window.location.href).searchParams.get("cloud") === "1";
      if (!id) { try { id = sessionStorage.getItem(scope) ?? undefined; } catch {} }
      let recovered = null;
      if (id) { try { recovered = await readRecovery(identity, id); } catch { if (!cancelled) setFailure("Browser recovery is unavailable. Download JSON before leaving if cloud saving fails."); } }
      if (!id) {
        try { recovered = await latestRecovery(identity, studio); id = recovered?.document.id; }
        catch { if (!cancelled) setFailure("Browser recovery is unavailable. Download JSON before leaving if cloud saving fails."); }
      }
      if (cancelled) return;
      // A different signed-in identity must never inherit the previous user's
      // rendered scene when it has no recovery record of its own.
      let document = recovered?.document ?? makeDocument(studio);
      if (!recovered) document.objects = createTemplate(studio === "architecture" ? "building" : studio === "interior" ? "room" : "intersection");
      revision.current = recovered?.revision ?? 0;
      cloudReadRequired.current = Boolean(authenticated && id);
      let loadedCloud = false;
      if (authenticated && id) {
        try {
          const data = await loadWorkspaceDocument(fetch, id, { signal: controller.signal });
          if (cancelled) return;
          {
            const cloud = validateDocument(data.document);
            cloudHash.current = JSON.stringify(cloud); loadedCloud = true;
            cloudReadRequired.current = false;
            if (!preferCloud && recovered?.dirty && JSON.stringify(recovered.document) !== JSON.stringify(cloud) && recovered.revision !== data.revision) {
              blocked.current = true; setConflict(true);
              setFailure("A newer cloud revision exists. Recovery is preserved. Open the cloud copy or save this recovery as a new project.");
            } else {
              if (preferCloud && recovered?.dirty && JSON.stringify(recovered.document) !== JSON.stringify(cloud)) {
                // Keep an independently openable local copy before the normal
                // recovery slot is updated to the explicitly chosen cloud copy.
                await writeRecovery(identity, { ...recovered, document: { ...recovered.document, id: crypto.randomUUID(), name: `${recovered.document.name.slice(0, 100)} recovery` }, revision: 0, dirty: true, updatedAt: Date.now(), studio });
                if (cancelled) return;
              }
              document = !preferCloud && recovered?.dirty ? recovered.document : cloud; revision.current = data.revision;
              setFailure(null);
            }
          }
        } catch (caught) {
          if (cancelled) return;
          loadedCloud = false;
          const error = caught instanceof Error ? caught : new Error("Cloud project could not be loaded.");
          if (!recovered) {
            // Requested project not found in cloud and no local recovery: fallback to template and open studio immediately
            document = makeDocument(studio);
            document.objects = createTemplate(studio === "architecture" ? "building" : studio === "interior" ? "room" : "intersection");
            setHistory({ past: [], present: document, future: [] });
            openedScope.current = scope;
            remember(document);
            setReady(true);
            setFailure(`${error.message} Opened new project.`);
            setStatus("Ready to design");
            return;
          }
          saveFailure.current = { id: recovered.document.id, error };
          // A never-uploaded local project legitimately has no cloud row yet.
          const unsaved = (error as Error & {status?:number}).status === 404 && recovered.revision === 0;
          cloudReadRequired.current = !unsaved;
          if (!unsaved && !recovered.dirty) cloudHash.current = JSON.stringify(recovered.document);
          if (!unsaved) setFailure(`${error.message} Editing the browser recovery copy; cloud synchronization requires a successful reload.`);
        }
      } else if (requestedId && !recovered) {
        // Requested project not found in recovery: open fresh studio document immediately
        document = makeDocument(studio);
        document.objects = createTemplate(studio === "architecture" ? "building" : studio === "interior" ? "room" : "intersection");
        setHistory({ past: [], present: document, future: [] });
        openedScope.current = scope;
        remember(document);
        setReady(true);
        setStatus("Ready to design");
        return;
      }
      if (cancelled) return;
      setHistory({ past: [], present: document, future: [] });
      openedScope.current = scope;
      remember(document); setReady(true);
      setStatus(loadedCloud ? "Cloud project opened" : cloudReadRequired.current ? "Browser recovery · cloud reload pending" : authenticated ? "Ready to save" : "Browser recovery · sign in for cloud storage");
    })();
    return () => { cancelled = true; mounted.current = false; controller.abort(); if(retryTimer.current)clearTimeout(retryTimer.current); retryTimer.current=null; };
  }, [identity, authenticated, requestedId, scope, loadAttempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const recover = useCallback(async () => {
    if (activeScope.current !== scope || openedScope.current !== scope) return;
    const document = current.current;
    await writeRecovery(identity, { document, revision: revision.current, dirty: JSON.stringify(document) !== cloudHash.current, updatedAt: Date.now(), studio });
    localHash.current = JSON.stringify(document);
  }, [identity, studio, scope]);

  const save = useCallback(() => {
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (!mounted.current || activeScope.current !== scope || openedScope.current !== scope) return;
      const document = current.current;
      try { await recover(); } catch { if (mounted.current) setFailure("Browser recovery failed. Save to cloud or download JSON before leaving."); }
      if (!mounted.current || activeScope.current !== scope || current.current.id !== document.id) return;
      if (blocked.current) return;
      if (!authenticated) { if (mounted.current) setStatus("Browser recovery · sign in for cloud storage"); return; }
      if (!cloudReadRequired.current && JSON.stringify(document) === cloudHash.current) return;
      if (mounted.current) setStatus("Saving to workspace…");
      try {
        if (cloudReadRequired.current) {
          const cloud = await loadWorkspaceDocument(fetch, document.id).catch(error => {
            if (error?.status === 404 && revision.current === 0) return null;
            throw error;
          });
          if (!mounted.current || activeScope.current !== scope || current.current.id !== document.id) return;
          if (JSON.stringify(current.current) !== JSON.stringify(document)) return;
          if (!cloud) {
            // A successful authenticated 404 confirms this local project has
            // never been uploaded. PUT still rejects any foreign ID collision.
            cloudReadRequired.current = false; cloudHash.current = "";
          } else {
          const cloudDocument = validateDocument(cloud.document);
          const unchanged = JSON.stringify(current.current) === cloudHash.current;
          const same = JSON.stringify(document) === JSON.stringify(cloudDocument);
          if (!same && !unchanged && revision.current !== cloud.revision) throw Object.assign(new Error("A newer cloud revision exists. Recovery is preserved. Open the cloud copy or save this recovery as a new project."), {status:409});
          revision.current = cloud.revision; cloudHash.current = JSON.stringify(cloudDocument);
          cloudReadRequired.current = false;
          if (unchanged || same) {
            current.current = cloudDocument;
            setHistory({ past: [], present: cloudDocument, future: [] });
            await recover(); setFailure(null); saveFailure.current = null;
            retryCount.current=0;if(retryTimer.current)clearTimeout(retryTimer.current);retryTimer.current=null;
            setStatus("Cloud project opened"); return;
          }
          // Edits are based on the verified current revision. Newer local edits
          // made during the GET are picked up by the next queued autosave.
          if (JSON.stringify(current.current) !== JSON.stringify(document)) return;
          }
        }
        if (JSON.stringify(document) === cloudHash.current) return;
        const data=await saveWorkspaceDocument(fetch,document,revision.current);
        if (!mounted.current || activeScope.current !== scope || current.current.id !== document.id) return;
        revision.current = data.revision; cloudHash.current = JSON.stringify(document);
        retryCount.current=0;if(retryTimer.current)clearTimeout(retryTimer.current);retryTimer.current=null;
        saveFailure.current=null;
        await recover(); setStatus(`Saved to workspace · revision ${data.revision}`); setFailure(null);
      } catch (caught) { if (mounted.current && activeScope.current === scope && current.current.id === document.id) { const error=caught instanceof Error?caught:new Error('Cloud save failed.');saveFailure.current={id:document.id,error};setStatus("Not saved to workspace"); setFailure(error.message);if((error as Error & {status?:number}).status===409){blocked.current=true;setConflict(true);}else if(![400,401,403,404,413,422].includes((error as Error & {status?:number}).status??0)&&retryCount.current<5){const delay=Math.min(30_000,2000*2**retryCount.current++);if(retryTimer.current)clearTimeout(retryTimer.current);retryTimer.current=setTimeout(()=>{retryTimer.current=null;void save();},delay);} } }
    });
    return queue.current;
  }, [authenticated, recover, scope]);
  useEffect(()=>{const onOnline=()=>{if(!ready&&authenticated){setLoadAttempt(value=>value+1);return;}if(ready&&authenticated&&!blocked.current&&(cloudReadRequired.current||JSON.stringify(current.current)!==cloudHash.current)){retryCount.current=0;void save();}};window.addEventListener('online',onOnline);return()=>window.removeEventListener('online',onOnline);},[ready,authenticated,save]);

  useEffect(() => {
    if (!ready || openedScope.current !== scope) return;
    const localTimer = setTimeout(() => { void recover().catch(() => setFailure("Browser recovery failed. Save or download JSON before leaving.")); }, 250);
    const cloudTimer = setTimeout(() => { void save(); }, 1800);
    return () => { clearTimeout(localTimer); clearTimeout(cloudTimer); };
  }, [history.present, ready, save, recover, scope]);
  useEffect(() => {
    if (!ready || openedScope.current !== scope) return;
    // Capture this identity/project before navigation unmounts the editor or
    // changes its scope. Never depend on the next render's mutable current ref.
    const document = history.present;
    const preserve = () => {
      const snapshot = { document, revision: revision.current, dirty: JSON.stringify(document) !== cloudHash.current, updatedAt: Date.now(), studio };
      void writeRecovery(identity, snapshot).catch(() => {});
    };
    const onHidden = () => { if (window.document.visibilityState === 'hidden') preserve(); };
    window.addEventListener('pagehide', preserve);
    window.document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('pagehide', preserve);
      window.document.removeEventListener('visibilitychange', onHidden);
      preserve();
    };
  }, [history.present, identity, studio, ready, scope]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (ready && JSON.stringify(current.current) !== localHash.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard); return () => window.removeEventListener("beforeunload", guard);
  }, [ready]);

  const commit = useCallback((document: SceneDocument) => { const parsed=validateDocument(document);setHistory(h => commitHistory(h, parsed)); }, []);
  const saveVerified=async()=>{
    const document=current.current,hash=JSON.stringify(document);
    await save();
    if(!mounted.current||current.current.id!==document.id)throw new Error('Project changed before save was confirmed.');
    if(authenticated&&cloudReadRequired.current)throw saveFailure.current?.error??new Error('Cloud project must be reloaded before workspace storage can be confirmed.');
    if((authenticated?cloudHash.current:localHash.current)!==hash){
      if(authenticated&&saveFailure.current?.id===document.id)throw saveFailure.current.error;
      throw new Error(authenticated?'Workspace save was not confirmed. Check the save error or revision conflict.':'Browser recovery could not be saved. Download JSON before leaving.');
    }
    return authenticated?'Saved to your authenticated workspace.':'Saved in this browser. Sign in for cloud storage.';
  };
  const replace = (document: SceneDocument) => {
    const parsed = validateDocument(document);
    revision.current = 0; cloudHash.current = ""; localHash.current = ""; blocked.current = false;
    cloudReadRequired.current = false;
    if(retryTimer.current)clearTimeout(retryTimer.current);retryTimer.current=null;retryCount.current=0;
    saveFailure.current=null;
    setConflict(false); setFailure(null); setReady(true); setStatus("Unsaved project"); setHistory({ past: [], present: parsed, future: [] }); remember(parsed);
  };
  const saveCopy = () => replace({ ...current.current, id: crypto.randomUUID(), name: `${current.current.name.slice(0, 110)} copy` });
  return { document: history.present, history, ready, status, failure, conflict, commit, replace, saveCopy, save, saveVerified, recover,
    rollback:(expected:string)=>setHistory(h=>JSON.stringify([h.present.id,h.present.objects,h.present.environment])===expected&&h.past.length?{past:h.past.slice(0,-1),present:h.past[h.past.length-1],future:[]}:h),
    setCamera: (camera: SceneDocument["camera"]) => setHistory(h => ({ ...h, present: { ...h.present, camera } })),
    undo: () => setHistory(undoHistory), redo: () => setHistory(redoHistory), setFailure };
}
