export async function require3DSession({signal,fetchImpl=fetch}={}) {
  const response=await fetchImpl('/api/auth/session',{signal,cache:'no-store',credentials:'same-origin'});
  if(response.status===401)throw Object.assign(new Error('Sign in to your account before generating 3D models.'),{status:401});
  if(!response.ok)throw new Error('Your session could not be checked. Retry in a moment.');
  const session=await response.json();
  if(!session?.user?.id)throw Object.assign(new Error('Sign in to your account before generating 3D models.'),{status:401});
}
export async function discover3DProviders({signal,fetchImpl=fetch}={}) {
  const response=await fetchImpl('/api/ai3d/providers',{signal,cache:'no-store'});
  const data=await response.json().catch(()=>null);
  if(!response.ok||!Array.isArray(data?.providers))throw new Error('3D generation availability could not be checked. Please retry.');
  return data.providers.filter(provider=>provider&&['meshy','tripo','hunyuan'].includes(provider.id));
}
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
export function generationLabel(job) {
  if(job.pollWarning)return 'Worker status unavailable · reconnecting';
  if(job.status==='FAILED'||job.status==='CANCELED')return 'Failed';
  if(job.status==='IMPORTING')return 'Loading GLB preview';
  if(job.status==='SUCCEEDED')return 'Completed';
  const label={queued:'Queued',loading_model:'Loading model',generating_geometry:'Generating geometry',processing_mesh:'Processing mesh'}[job.stage]||(job.status==='QUEUED'?'Queued':'Processing');
  return job.stage==='generating_geometry'&&job.samplingStep&&job.samplingSteps?`${label} · step ${job.samplingStep}/${job.samplingSteps}`:label;
}
const pause = (ms, signal) => new Promise((resolve, reject) => {
  const abort = () => { clearTimeout(timer); reject(new DOMException("Generation monitoring stopped. Resume it from generation jobs.", "AbortError")); };
  const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
  if (signal?.aborted) abort(); else signal?.addEventListener("abort", abort, { once: true });
});
export async function generate3DModel({ provider, prompt, image, projectId, studio, signal, resumeId, onProgress = () => {}, fetchImpl = fetch, pollMs = 3000, timeoutMs = 1800_000 }) {
  const parse = async response => { const data = await response.json(); if (!response.ok) throw Object.assign(new Error(message(data)),{status:response.status}); return data; };
  const started = Date.now();
  const inspect = async (url,known) => {
    while(true){
      try{return await parse(await fetchImpl(url,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(60_000)]):AbortSignal.timeout(60_000),cache:'no-store'}));}
      catch(error){
        signal?.throwIfAborted();
        const temporary=[502,503,504].includes(error.status)||error instanceof TypeError||error.name==='TimeoutError';
        if(!temporary||Date.now()-started>timeoutMs)throw error;
        if(known)onProgress({...known,pollWarning:true});
        await pause(Math.max(10,pollMs),signal);
      }
    }
  };
  let job = resumeId ? await inspect(`/api/ai3d/jobs/${encodeURIComponent(resumeId)}?refresh=1`) : await parse(await fetchImpl("/api/ai3d/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, signal, body: JSON.stringify({ requestId: crypto.randomUUID(), provider, prompt, image, projectId, studio }) }));
  if (job.projectId !== projectId) throw new Error("This generation belongs to a different project.");
  while (true) {
    if (job.projectId !== projectId) throw new Error("This generation belongs to a different project.");
    signal?.throwIfAborted(); onProgress(job);
    if (job.status === "SUCCEEDED") break;
    if (["FAILED", "CANCELED"].includes(job.status)) throw new Error(job.error || "The 3D generation did not succeed.");
    if (Date.now() - started > timeoutMs) throw new Error("Generation is still processing. Resume it later from generation jobs.");
    await pause(pollMs, signal);
    job = await inspect(`/api/ai3d/jobs/${encodeURIComponent(job.id)}`,job);
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
