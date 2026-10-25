export type Generation3DJob = { id: string; projectId: string; provider: string; model: string; prompt: string; status: string; progress: number; pollWarning?:boolean; stage?:string; samplingStep?:number; samplingSteps?:number; modelURL?: string; assetPath?: string; error?: string; createdAt?: string };
export function generationLabel(job:Generation3DJob):string;
export function require3DSession(options?:{signal?:AbortSignal;fetchImpl?:typeof fetch}):Promise<void>;
export function discover3DProviders(options?:{signal?:AbortSignal;fetchImpl?:typeof fetch}):Promise<Array<{id:string;label:string;model:string}>>;
export function readModelBytes(response: Response, limit?: number): Promise<ArrayBuffer>;
export function generate3DModel(options: { provider?: string; prompt?: string; image?: string; projectId: string; studio: string; signal?: AbortSignal; resumeId?: string; onProgress?: (job: Generation3DJob) => void; fetchImpl?: typeof fetch; pollMs?: number; timeoutMs?: number }): Promise<{ job: Generation3DJob; buffer: ArrayBuffer }>;
