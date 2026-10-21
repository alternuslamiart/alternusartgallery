export function persistAIResponse(save: () => Promise<unknown>): Promise<{ saved: boolean; warning?: string }>;
