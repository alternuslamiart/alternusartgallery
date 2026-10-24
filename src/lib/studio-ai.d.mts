export const STUDIO_AI_PROVIDERS: string[];
export function requestStudioAnswer(options: {
  provider: string;
  message: string;
  image?: string;
  messages?: Array<{ role: string; text: string }>;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<{ message: string; provider: string; model: string; assetJobId?: string; warning?: string; citations?: Array<{ source: string }> }>;
