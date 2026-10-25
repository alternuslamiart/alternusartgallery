// Server-only adapter. Never return worker URLs or credentials to a browser.
import imageSize from 'next/dist/compiled/image-size/index.js';
export function hunyuanConfig(env = process.env) {
  const url = new URL(env.HUNYUAN_API_URL || "http://127.0.0.1:8081");
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || (!local && url.protocol !== "https:") || (local && !["http:", "https:"].includes(url.protocol))) throw new Error("Invalid HUNYUAN_API_URL.");
  if (env.NODE_ENV === "production" && local && env.HUNYUAN_LOCAL_DEVELOPMENT !== "1") throw new Error("Local Hunyuan is development-only. Configure a secured remote GPU worker for production.");
  if ((!local || env.NODE_ENV === "production") && !env.HUNYUAN_API_TOKEN) throw new Error("Remote Hunyuan requires server worker authentication.");
  if(env.NODE_ENV==='production'&&!local&&(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY||!env.HUNYUAN_STORAGE_BUCKET))throw new Error('Hunyuan production requires private object storage.');
  return { url: url.origin, headers: env.HUNYUAN_API_TOKEN ? { Authorization: `Bearer ${env.HUNYUAN_API_TOKEN}` } : {} };
}
export async function hunyuanRequest(path, { env = process.env, fetchImpl = fetch, ...init } = {}) {
  const config = hunyuanConfig(env);
  try {
    const response = await fetchImpl(config.url + path, { ...init, headers: { ...config.headers, ...init.headers }, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(25_000) });
    if (!response.ok) throw Object.assign(new Error(response.status === 429 ? "GPU worker queue is full. Retry later." : response.status === 400 ? "GPU worker rejected the image." : response.status === 404 ? "GPU job expired or is unavailable." : `GPU worker request failed (${response.status}).`),{status:response.status});
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("GPU")) throw error;
    throw new Error("GPU worker unavailable or timed out. Start the local shape service and resume the job.");
  }
}
export function validateImageData(value) {
  if (typeof value !== "string" || value.length > 4_000_100 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error("Attach a PNG, JPEG or WebP image of at most 3 MB.");
  const bytes = Buffer.from(value.slice(value.indexOf(",") + 1), "base64");
  if (!bytes.length || bytes.length > 3_000_000) throw new Error("Image exceeds 3 MB.");
  let metadata;
  try { metadata=imageSize(bytes); } catch { throw new Error('Invalid reference image.'); }
  const declared=value.slice(11,value.indexOf(';'));
  if(!['png','jpg','webp'].includes(metadata.type)||({png:'png',jpg:'jpeg',webp:'webp'})[metadata.type]!==declared||![metadata.width,metadata.height].every(n=>n>=32&&n<=4096))throw new Error('Use PNG, JPEG or WebP, 32–4096 pixels.');
  // Full decode, format and dimension validation happens before worker enqueue.
  return value;
}
export const workerTaskId = id => {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error("Invalid GPU task identifier.");
  return id;
};
