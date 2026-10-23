export type MicrophoneSession = { stream: MediaStream; close: () => void; record: () => void; finish: () => Promise<Blob> };
export function microphoneError(error: unknown): string;
export function openStudioMicrophone(options?: { onLevel?: (level: number) => void; onFailure?: (message: string) => void; environment?: unknown }): Promise<MicrophoneSession>;
