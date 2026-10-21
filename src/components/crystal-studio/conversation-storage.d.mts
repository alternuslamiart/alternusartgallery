import type { StudioChatMessage } from "./StudioAIChat";
export function parseStudioConversation(raw: string | null): { messages: StudioChatMessage[]; open: boolean; expanded: boolean } | null;
export function serializeStudioConversation(value: { messages: StudioChatMessage[]; open: boolean; expanded: boolean }): string | null;
