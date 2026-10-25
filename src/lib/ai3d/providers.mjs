import { hunyuanConfig, hunyuanRequest, validateImageData, workerTaskId } from './hunyuan.mjs';
const definitions = {
  hunyuan: { label: "Hunyuan3D · Image to 3D", key: "HUNYUAN_API_URL", model: "HUNYUAN_MODEL", fallback: "Hunyuan3D-2.1 shape" },
  meshy: { label: "Meshy · 3D model", key: "MESHY_API_KEY", model: "MESHY_MODEL", fallback: "latest", base: "https://api.meshy.ai/openapi/v2/text-to-3d" },
  tripo: { label: "Tripo · 3D model", key: "TRIPO_API_KEY", model: "TRIPO_MODEL", fallback: "v3.1-20260211", base: "https://openapi.tripo3d.ai/v3" },
};
export function configured3DProviders(env = process.env) { return Object.entries(definitions).filter(([id, d]) => {if(!env[d.key]?.trim())return false;if(id==='hunyuan'){try{hunyuanConfig(env);}catch{return false;}}return true;}).map(([id, d]) => ({ id, label: d.label, model: env[d.model]?.trim() || d.fallback })); }
function config(provider, env) { const d = definitions[provider]; if (!d) throw new Error("Unsupported 3D provider."); const key = env[d.key]?.trim(); if (!key) throw new Error(`${provider} is not configured on the server.`); return { ...d, key, model: env[d.model]?.trim() || d.fallback }; }
async function jsonRequest(url, init, fetchImpl) {
  const response = await fetchImpl(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(25_000) });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "3D provider rejected its server API key or access permissions." : response.status === 402 ? "3D provider requires credits or billing." : response.status === 429 ? "3D provider quota/rate limit reached. Resume this job later." : `3D provider request failed (${response.status}).`);
  const result = await response.json();
  if (result.code !== undefined && result.code !== 0) throw new Error("3D provider rejected this generation request. Check model access, credits and prompt.");
  return result;
}
export function safeModelURL(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port || !["meshy.ai", "tripo3d.ai", "tripo3d.com"].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))) throw new Error("The provider returned an unsupported asset host.");
  return url.href;
}
export async function submit3DTask(provider, prompt, { env = process.env, fetchImpl = fetch, previewTaskId, image } = {}) {
  if (provider === 'hunyuan') {
    const response = await hunyuanRequest('/send', {env, fetchImpl, method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({image:validateImageData(image),texture:false})});
    return workerTaskId((await response.json()).uid);
  }
  const c = config(provider, env), meshy = provider === "meshy";
  const body = meshy ? previewTaskId ? { mode: "refine", preview_task_id: previewTaskId, enable_pbr: true, texture_resolution: "2k", target_formats: ["glb"] } : { mode: "preview", prompt, ai_model: c.model, topology: "triangle", target_polycount: 8000, should_remesh: true, target_formats: ["glb"] } : { prompt, model: c.model, face_limit: 8000, texture: true, pbr: true, auto_size: true };
  const result = await jsonRequest(meshy ? c.base : `${c.base}/generation/text-to-model`, { method: "POST", headers: { Authorization: `Bearer ${c.key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }, fetchImpl);
  const id = meshy ? result.result : result.data?.task_id;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new Error("The 3D provider returned no valid task ID.");
  return id;
}
export async function inspect3DTask(provider, taskId, { env = process.env, fetchImpl = fetch } = {}) {
  if (provider === 'hunyuan') {
    let data;
    try {data = await (await hunyuanRequest(`/status/${workerTaskId(taskId)}`, {env, fetchImpl})).json();}
    catch(error){if(error.status===404)return{status:'FAILED',progress:0,error:'GPU job expired or is unavailable. Submit a new image job.'};throw error;}
    const status = {queued:'QUEUED',processing:'RUNNING',completed:'SUCCEEDED',failed:'FAILED'}[data.status];
    if (!status) throw new Error('GPU worker returned an unknown job state.');
    const stage=['queued','loading_model','generating_geometry','processing_mesh','completed','failed'].includes(data.phase)?data.phase:undefined;
    const sampling=Number.isInteger(data.sampling_step)&&Number.isInteger(data.sampling_steps)&&data.sampling_step>=1&&data.sampling_step<=data.sampling_steps&&data.sampling_steps<=1000?{samplingStep:data.sampling_step,samplingSteps:data.sampling_steps}:{};
    return {status,stage,...sampling,progress:status==='SUCCEEDED'?100:0,error:typeof data.error==='string'?data.error:undefined};
  }
  const c = config(provider, env), meshy = provider === "meshy";
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(taskId)) throw new Error("Invalid provider task ID.");
  const result = await jsonRequest(meshy ? `${c.base}/${encodeURIComponent(taskId)}` : `${c.base}/tasks/${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${c.key}` } }, fetchImpl);
  const data = meshy ? result : result.data;
  const status = String(data?.status ?? "").toUpperCase();
  const normalized = ["SUCCESS", "SUCCEEDED"].includes(status) ? "SUCCEEDED" : ["FAILED", "CANCELED", "CANCELLED", "EXPIRED"].includes(status) ? "FAILED" : ["PENDING", "QUEUED", "RUNNING", "IN_PROGRESS", "PROCESSING"].includes(status) ? "RUNNING" : null;
  if (!normalized) throw new Error("The 3D provider returned an unknown task status.");
  const modelURL = normalized === "SUCCEEDED" ? safeModelURL(meshy ? data.model_urls?.glb : data.output?.model_url) : undefined;
  return { status: normalized, progress: Math.max(0, Math.min(100, Number(data.progress) || 0)), ...(modelURL ? { modelURL } : {}) };
}
