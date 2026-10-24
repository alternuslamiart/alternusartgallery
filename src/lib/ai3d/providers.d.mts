export type Provider3D = "meshy" | "tripo" | "hunyuan";
export function configured3DProviders(env?: Record<string, string | undefined>): Array<{ id: Provider3D; label: string; model: string }>;
export function safeModelURL(value: unknown): string;
export function submit3DTask(provider: string, prompt: string, options?: { env?: Record<string, string | undefined>; fetchImpl?: typeof fetch; previewTaskId?: string; image?: string }): Promise<string>;
export function inspect3DTask(provider: string, taskId: string): Promise<{ status: "SUCCEEDED" | "FAILED" | "RUNNING" | "QUEUED"; progress: number; modelURL?: string; error?: string }>;
