export async function readModelBytes(response, limit = 20_000_000) {
  if (!response.ok) throw new Error(`Generated model download failed (${response.status}).`);
  if (Number(response.headers.get("content-length")) > limit) throw new Error("Generated model is too large for this editor. Download the source GLB from generation jobs.");
  const reader = response.body?.getReader(); if (!reader) throw new Error("Generated model has no file data.");
  const parts = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > limit) throw new Error("Generated model exceeds the download size limit. Use the provider's source GLB."); parts.push(value); } }
  catch (error) { await reader.cancel().catch(() => {}); throw error; }
  const bytes = new Uint8Array(size); let offset = 0; for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  if (size < 12 || new DataView(bytes.buffer).getUint32(0, true) !== 0x46546c67 || new DataView(bytes.buffer).getUint32(4, true) !== 2 || new DataView(bytes.buffer).getUint32(8, true) !== size) throw new Error("The provider did not return a valid GLB file.");
  return bytes.buffer;
}
const message = data => typeof data?.error === "string" ? data.error : data?.error?.message || "3D generation request failed.";
const pause = (ms, signal) => new Promise((resolve, reject) => {
  const abort = () => { clearTimeout(timer); reject(new DOMException("Generation monitoring stopped. Resume it from generation jobs.", "AbortError")); };
  const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
  if (signal?.aborted) abort(); else signal?.addEventListener("abort", abort, { once: true });
});
export async function generate3DModel({ provider, prompt, image, projectId, studio, signal, resumeId, onProgress = () => {}, fetchImpl = fetch, pollMs = 3000, timeoutMs = 1800_000 }) {
  const parse = async response => { const data = await response.json(); if (!response.ok) throw new Error(message(data)); return data; };
  let job = resumeId ? await parse(await fetchImpl(`/api/ai3d/jobs/${encodeURIComponent(resumeId)}?refresh=1`, { signal, cache: "no-store" })) : await parse(await fetchImpl("/api/ai3d/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, signal, body: JSON.stringify({ requestId: crypto.randomUUID(), provider, prompt, image, projectId, studio }) }));
  if (job.projectId !== projectId) throw new Error("This generation belongs to a different project.");
  const started = Date.now();
  while (true) {
    if (job.projectId !== projectId) throw new Error("This generation belongs to a different project.");
    signal?.throwIfAborted(); onProgress(job);
    if (job.status === "SUCCEEDED") break;
    if (["FAILED", "CANCELED"].includes(job.status)) throw new Error(job.error || "The 3D generation did not succeed.");
    if (Date.now() - started > timeoutMs) throw new Error("Generation is still processing. Resume it later from generation jobs.");
    await pause(pollMs, signal);
    job = await parse(await fetchImpl(`/api/ai3d/jobs/${encodeURIComponent(job.id)}`, { signal, cache: "no-store" }));
  }
  onProgress({ ...job, status: "IMPORTING" });
  let response;
  try { if(job.modelURL) response = await fetchImpl(job.modelURL, { signal, credentials: "omit" }); }
  catch (error) { if (!(error instanceof TypeError)) throw error; }
  // Use the same-origin bounded proxy if the provider CDN does not allow CORS.
  if (!response || !response.ok) response = await fetchImpl(job.assetPath, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(message(await response.json().catch(() => null)));
  const buffer = await readModelBytes(response); signal?.throwIfAborted();
  return { job, buffer };
}
