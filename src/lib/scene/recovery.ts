import { validateDocument, type SceneDocument } from "./document.mjs";
export type Recovery = { document: SceneDocument; revision: number; dirty: boolean; updatedAt: number; studio?: string };
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("casynus-scene-recovery", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("documents");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readRecovery(identity: string, id: string): Promise<Recovery | null> {
  const db = await database();
  try {
    const saved = await new Promise<Recovery | undefined>((resolve, reject) => {
      const request = db.transaction("documents").objectStore("documents").get(`${identity}:${id}`);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    return saved ? { ...saved, document: validateDocument(saved.document) } : null;
  } finally { db.close(); }
}
export async function writeRecovery(identity: string, value: Recovery) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("documents", "readwrite");
      tx.objectStore("documents").put(value, `${identity}:${value.document.id}`);
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}

// Scan only this identity's records. Invalid records remain untouched so an
// older valid recovery can still be opened without destroying forensic data.
export async function latestRecovery(identity: string, studio: string): Promise<Recovery | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      let latest: Recovery | null = null;
      const request = db.transaction("documents").objectStore("documents").openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) { resolve(latest); return; }
        if (String(cursor.key).startsWith(`${identity}:`)) {
          try {
            const value = cursor.value as Recovery;
            const document = validateDocument(value.document);
            if (value.studio === studio && Number.isFinite(value.updatedAt) && (!latest || value.updatedAt > latest.updatedAt)) latest = { ...value, document };
          } catch { /* Preserve unreadable records. */ }
        }
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

export async function listRecovery(identity: string): Promise<Array<{ id: string; name: string; local: boolean }>> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const output: Array<{ id: string; name: string; local: boolean }> = [];
      const request = db.transaction("documents").objectStore("documents").openCursor();
      request.onsuccess = () => { const cursor = request.result; if (!cursor) { resolve(output); return; } if (String(cursor.key).startsWith(`${identity}:`) && cursor.value?.document?.id) output.push({ id: cursor.value.document.id, name: cursor.value.document.name, local: true }); cursor.continue(); };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
