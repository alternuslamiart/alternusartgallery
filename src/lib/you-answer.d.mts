export class YouAnswerError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string);
}
export type YouCitation = { source: string };
export function buildYouQuery(message: string, history?: Array<{ role: "user" | "assistant"; content: string }>): string;
export function askYou(message: string, history?: Array<{ role: "user" | "assistant"; content: string }>, options?: { apiKey?: string; fetchImpl?: typeof fetch }): Promise<{ message: string; citations: YouCitation[] }>;
