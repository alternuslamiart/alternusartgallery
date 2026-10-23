"use client";

import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useSession } from "next-auth/react";
import type { StudioChatMessage } from "./StudioAIChat";
import { parseStudioConversation, serializeStudioConversation } from "./conversation-storage.mjs";
import { StudioActionsProvider } from "./StudioActions";

type ConversationContext = {
  messages: StudioChatMessage[];
  setMessages: Dispatch<SetStateAction<StudioChatMessage[]>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
};
const Context = createContext<ConversationContext | null>(null);

function emptyConversation(identity: string) {
  return { identity, loaded: false, messages: [] as StudioChatMessage[], open: true, expanded: false };
}

function ConversationStore({ identity, children }: { identity: string; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState(() => emptyConversation(identity));
  // Reset before children render a different account, without remounting the editor.
  if (snapshot.identity !== identity) setSnapshot(emptyConversation(identity));
  const { messages, open, expanded } = snapshot.identity === identity ? snapshot : emptyConversation(identity);
  const storageKey = `casynus:studio-conversation:${identity}`;
  const setMessages = useCallback<Dispatch<SetStateAction<StudioChatMessage[]>>>(value => {
    setSnapshot(current => current.identity !== identity ? current : {
      ...current, messages: typeof value === "function" ? value(current.messages) : value,
    });
  }, [identity]);
  const setOpen = useCallback<Dispatch<SetStateAction<boolean>>>(value => {
    setSnapshot(current => current.identity !== identity ? current : {
      ...current, open: typeof value === "function" ? value(current.open) : value,
    });
  }, [identity]);
  const setExpanded = useCallback<Dispatch<SetStateAction<boolean>>>(value => {
    setSnapshot(current => current.identity !== identity ? current : {
      ...current, expanded: typeof value === "function" ? value(current.expanded) : value,
    });
  }, [identity]);
  useEffect(() => {
    let saved: ReturnType<typeof parseStudioConversation> = null;
    try {
      saved = parseStudioConversation(sessionStorage.getItem(storageKey));
    } catch { /* The editor remains usable when browser storage is unavailable. */ }
    setSnapshot(current => current.identity !== identity ? current : {
      ...emptyConversation(identity), ...saved, loaded: true,
    });
  }, [identity, storageKey]);
  useEffect(() => {
    if (snapshot.identity !== identity || !snapshot.loaded || identity === "loading") return;
    try {
      const raw = serializeStudioConversation(snapshot);
      if (raw !== null) sessionStorage.setItem(storageKey, raw);
    }
    catch { /* Keep the live conversation if browser storage is full. */ }
  }, [snapshot, identity, storageKey]);
  return <Context.Provider value={{ messages, setMessages, open, setOpen, expanded, setExpanded }}>{children}</Context.Provider>;
}

export function StudioConversationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const identity = session?.user?.id ?? session?.user?.email ?? (status === "loading" ? "loading" : "guest");
  return <ConversationStore identity={identity}><StudioActionsProvider>{children}</StudioActionsProvider></ConversationStore>;
}

export function useStudioDock() {
  const context = useContext(Context);
  if (!context) throw new Error("StudioConversationProvider is required");
  return context;
}

export function useStudioConversation(initial: StudioChatMessage[]): [StudioChatMessage[], Dispatch<SetStateAction<StudioChatMessage[]>>] {
  const { messages, setMessages } = useStudioDock();
  return [messages.length ? messages : initial, setMessages];
}
