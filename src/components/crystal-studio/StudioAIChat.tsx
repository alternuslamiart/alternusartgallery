"use client";

import { ArrowUp, LoaderCircle, Maximize2, Minimize2, Minus, Paperclip, Plus, Sparkles, Square, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { StudioBadge, StudioButton } from "./kit";
import { useStudioDock } from "./StudioConversation";

export type StudioChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;
  meta?: string;
};
export type StudioChatModelOption = { id: string; label: string; badge?: string; description?: string };
type StudioAIChatProps = {
  studio: "modeling" | "floor-plan" | "infrastructure";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  loading?: boolean;
  progress?: number;
  error?: string | null;
  onClearError?: () => void;
  model: string;
  onModelChange: (model: string) => void;
  models?: StudioChatModelOption[];
  messages?: StudioChatMessage[];
  onClearMessages?: () => void;
  onNewChat?: () => void;
  referenceImage?: string | null;
  onAttachImage?: (file: File) => void;
  onRemoveImage?: () => void;
  quickPrompts?: Array<{ label: string; prompt: string }>;
  onQuickPrompt?: (prompt: string) => void;
  placeholder?: string;
  statusLabel?: string;
  className?: string;
};
const DEFAULT_MODELS: Record<StudioAIChatProps["studio"], StudioChatModelOption[]> = {
  modeling: [{ id: "Precision Mode", label: "Precision Mode" }, { id: "Fast Concept", label: "Fast Concept" }],
  "floor-plan": [{ id: "Precision Mode", label: "Precision Mode" }, { id: "Fast Concept", label: "Fast Concept" }],
  infrastructure: [{ id: "Precision Mode", label: "Precision Mode" }, { id: "Site Assistant", label: "Site Assistant" }, { id: "Mobility Review", label: "Mobility Review" }],
};
const STUDIO_NAMES = { modeling: "3D Studio", "floor-plan": "Interior", infrastructure: "Infrastructure" };

export function StudioAIChat({
  studio, open, onOpenChange, prompt, onPromptChange, onSubmit, onStop,
  loading = false, progress = 0, error, onClearError, model, onModelChange,
  models, messages = [], referenceImage, onAttachImage, onRemoveImage, onNewChat, onClearMessages, statusLabel,
  quickPrompts = [], onQuickPrompt, placeholder = "What do you want to create?", className = "",
}: StudioAIChatProps) {
  const { expanded, setExpanded } = useStudioDock();
  const [localImage, setLocalImage] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();
  const availableModels = models ?? DEFAULT_MODELS[studio];
  const activeModel = availableModels.find(item => item.id === model || item.label === model) ?? availableModels[0];
  const activeImage = referenceImage ?? localImage;
  const hasUserMessages = messages.some(message => message.role === "user");
  const visibleMessages = expanded ? messages : hasUserMessages ? messages.slice(-2) : [];

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, loading, expanded, open]);
  useEffect(() => () => { if (localImage) URL.revokeObjectURL(localImage); }, [localImage]);

  if (!open) return <button type="button" aria-label="Show AI chat" title="Open AI Assistant" aria-expanded={false}
    onClick={() => onOpenChange(true)} className={`crystal-ai-chat-toggle studio-ai-reopen-btn ${className}`}>
    <Sparkles size={16} /><span>Casynus AI</span>{hasUserMessages && <StudioBadge>{messages.length}</StudioBadge>}
  </button>;

  return <div id={panelId} className={`crystal-ai-prompt studio-ai-panel cs-chat-dock ${expanded ? "is-expanded" : "is-compact"} ${className}`}
    role="region" aria-label="Casynus AI assistant" data-state={expanded ? "expanded" : "compact"}>
    <div className="cs-chat-header">
      <div className="cs-chat-identity"><Sparkles size={16} /><span>Casynus AI</span><small>{STUDIO_NAMES[studio]}</small></div>
      <div className="cs-chat-actions">
        {onNewChat && <StudioButton size="icon" variant="ghost" aria-label="New studio conversation" title="New conversation" disabled={loading} onClick={onNewChat}><Plus size={14} /></StudioButton>}
        {expanded && onClearMessages && hasUserMessages && <StudioButton size="icon" variant="ghost" aria-label="Clear studio conversation" title="Clear conversation" disabled={loading} onClick={onClearMessages}><Trash2 size={14} /></StudioButton>}
        <StudioButton size="icon" variant="ghost" aria-label={expanded ? "Compact AI assistant" : "Expand AI assistant"}
          title={expanded ? "Compact conversation" : "Expand conversation"} aria-expanded={expanded} aria-controls={panelId + "-thread"}
          onClick={() => setExpanded(value => !value)}>{expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</StudioButton>
        <StudioButton size="icon" variant="ghost" aria-label="Minimize AI assistant" title="Minimize AI assistant"
          onClick={() => onOpenChange(false)}><Minus size={16} /></StudioButton>
      </div>
    </div>
    {(visibleMessages.length > 0 || expanded || loading) && <div id={panelId + "-thread"} className="studio-ai-thread" role="log" aria-live="polite" ref={threadRef}>
      {!visibleMessages.length && !loading && <p className="cs-chat-empty">Describe your idea or choose a suggestion to start.</p>}
      {visibleMessages.map(message => <div key={message.id} className={`studio-ai-message is-${message.role}`}>
        <div className="studio-ai-message-meta"><span>{message.role === "user" ? "You" : message.role === "system" ? "Workspace" : "Casynus"}</span>{message.meta && <small>{message.meta}</small>}</div>
        <div className="studio-ai-message-body">{message.text}</div>
      </div>)}
      {loading && <div className="studio-ai-message is-assistant" aria-busy="true">
        <div className="studio-ai-progress-row"><LoaderCircle size={14} className="cs-spin" /><span>Processing your request{progress > 0 ? ` · ${progress}%` : "…"}</span></div>
        {progress > 0 && <progress className="cs-progress" max={100} value={Math.min(100, Math.max(0, progress))} aria-label="Generation progress" />}
      </div>}
    </div>}
    {expanded && !hasUserMessages && quickPrompts.length > 0 && <div className="cs-chat-suggestions">
      {quickPrompts.map(item => <StudioButton key={item.label} size="sm" onClick={() => {
        if (onQuickPrompt) onQuickPrompt(item.prompt); else onPromptChange(item.prompt);
        textareaRef.current?.focus();
      }}>{item.label}</StudioButton>)}
    </div>}
    {activeImage && <div className="studio-ai-attachment">
      <img src={activeImage} alt="Attached design reference" />
      <div className="studio-ai-attachment-info"><span>Reference image</span><small>Attached to this workspace</small></div>
      <StudioButton size="icon" variant="ghost" aria-label="Remove uploaded image" title="Remove attachment"
        onClick={() => { onRemoveImage?.(); setLocalImage(null); }}><X size={14} /></StudioButton>
    </div>}
    {error && <div className="studio-ai-error" role="alert"><span>{error}</span>
      {onClearError && <StudioButton size="icon" variant="ghost" aria-label="Dismiss error" onClick={onClearError}><X size={14} /></StudioButton>}
    </div>}
    <div className="studio-ai-composer">
      <textarea ref={textareaRef} aria-label={studio === "floor-plan" ? "AI floor-plan prompt" : studio === "infrastructure" ? "Message the site assistant" : "AI model prompt"}
        value={prompt} onChange={event => onPromptChange(event.target.value)} rows={2} placeholder={placeholder}
        className="studio-ai-textarea" maxLength={20_000} enterKeyHint="send" onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault(); if (prompt.trim() && !loading) onSubmit();
          }
        }} />
      <div className="studio-ai-controls">
        <div className="studio-ai-controls-left">
          <label className="studio-ai-attach-btn" title="Attach reference image">
            <Paperclip size={16} /><input type="file" aria-label="Attach reference image" accept="image/png,image/jpeg,image/webp" className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) { if (onAttachImage) onAttachImage(file); else setLocalImage(URL.createObjectURL(file)); }
                event.currentTarget.value = "";
              }} />
          </label>
          <select aria-label="AI mode" className="cs-chat-model" value={activeModel?.id ?? ""} onChange={event => onModelChange(event.target.value)}>
            {availableModels.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        {loading && onStop
          ? <StudioButton size="icon" variant="primary" onClick={onStop} aria-label="Stop generation" title="Stop generation"><Square size={13} fill="currentColor" /></StudioButton>
          : <StudioButton size="icon" variant="primary" aria-label="Send AI request" title="Send prompt (Enter)" disabled={!prompt.trim() || loading} onClick={onSubmit}>
            {loading ? <LoaderCircle size={16} className="cs-spin" /> : <ArrowUp size={17} />}
          </StudioButton>}
      </div>
    </div>
    {statusLabel && <div className="cs-chat-status">{statusLabel}</div>}
  </div>;
}
