export function hunyuanConfig(env?: Record<string, string | undefined>): {url: string; headers: Record<string,string>};
export function hunyuanRequest(path: string, options?: RequestInit & {env?: Record<string,string|undefined>; fetchImpl?: typeof fetch}): Promise<Response>;
export function validateImageData(value: unknown): string;
export function workerTaskId(id: unknown): string;
