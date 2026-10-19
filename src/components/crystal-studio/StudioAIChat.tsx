"use client";

import {
  ArrowUp,
  Check,
  ChevronDown,
  CornerDownLeft,
  Eraser,
  FilePlus2,
  History,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Paperclip,
  Sparkles,
  Square,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type StudioChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;
  meta?: string;
};

export type StudioChatModelOption = {
  id: string;
  label: string;
  badge?: string;
  description?: string;
};

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
  modeling: [
    { id: "Precision Mode", label: "Precision Mode", badge: "CAD", description: "High-accuracy mesh & transform synthesis" },
    { id: "Fast Concept", label: "Fast Concept", badge: "Draft", description: "Rapid 3D massing and blockout generation" },
  ],
  "floor-plan": [
    { id: "Precision Mode", label: "Precision Mode", badge: "2D CAD", description: "Metric-aligned walls, rooms, and openings" },
    { id: "Fast Concept", label: "Fast Concept", badge: "Layout", description: "Quick schematic room partitioning" },
  ],
  infrastructure: [
    { id: "Site Assistant", label: "Site Assistant", badge: "Local", description: "Local circulation, drainage & landscape review" },
    { id: "Mobility Review", label: "Mobility Review", badge: "Local", description: "Road network, parking & pedestrian access checks" },
  ],
};

const STUDIO_TITLES: Record<StudioAIChatProps["studio"], { title: string; subtitle: string }> = {
  modeling: { title: "Casynus AI Assistant", subtitle: "3D Object & Scene Generation" },
  "floor-plan": { title: "Drafting AI Assistant", subtitle: "2D Floor Plan & Room Layout" },
  infrastructure: { title: "Site Planning Assistant", subtitle: "Civil & Landscape Concept Review" },
};

export function StudioAIChat({
  studio,
  open,
  onOpenChange,
  prompt,
  onPromptChange,
  onSubmit,
  onStop,
  loading = false,
  progress = 0,
  error = null,
  onClearError,
  model,
  onModelChange,
  models,
  messages = [],
  onClearMessages,
  onNewChat,
  referenceImage,
  onAttachImage,
  onRemoveImage,
  quickPrompts = [],
  onQuickPrompt,
  placeholder = "What do you want to create?",
  statusLabel,
  className = "",
}: StudioAIChatProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const availableModels = models ?? DEFAULT_MODELS[studio];
  const activeModel = availableModels.find((item) => item.id === model || item.label === model) ?? availableModels[0];
  const meta = STUDIO_TITLES[studio];

  useEffect(() => {
    if (threadRef.current && showHistory) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages.length, loading, showHistory]);

  useEffect(() => {
    if (!modelMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setModelMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [modelMenuOpen]);

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Show AI chat"
        title="Open AI Assistant"
        onClick={() => onOpenChange(true)}
        className={`crystal-ai-chat-toggle studio-ai-reopen-btn ${className}`}
      >
        <span className="studio-ai-reopen-icon">
          <Sparkles size={14} />
        </span>
        <span className="studio-ai-reopen-label">{meta.title}</span>
        {messages.length > 0 && <span className="studio-ai-reopen-count">{messages.length}</span>}
      </button>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`crystal-ai-prompt studio-ai-panel ${expanded ? "is-expanded" : ""} ${className}`}
      role="region"
      aria-label={meta.title}
    >
      {/* Header Bar */}
      <div className="studio-ai-header">
        <div className="studio-ai-identity">
          <span className="studio-ai-badge" aria-hidden="true">
            <Sparkles size={13} />
          </span>
          <div className="min-w-0">
            <div className="studio-ai-title-row">
              <strong className="studio-ai-title">{meta.title}</strong>
              <span className={`studio-ai-status ${loading ? "is-busy" : ""}`}>
                <i />
                {loading
                  ? progress > 0
                    ? `Generating ${progress}%`
                    : "Working…"
                  : statusLabel ?? (studio === "infrastructure" ? "Local" : "Ready")}
              </span>
            </div>
          </div>
        </div>

        <div className="studio-ai-header-actions">
          {hasMessages && (
            <button
              type="button"
              onClick={() => setShowHistory((current) => !current)}
              aria-pressed={showHistory}
              title={showHistory ? "Collapse conversation history" : "Show conversation history"}
              aria-label={showHistory ? "Collapse conversation history" : "Show conversation history"}
              className={`studio-ai-icon-btn ${showHistory ? "is-active" : ""}`}
            >
              <History size={14} />
            </button>
          )}
          {onNewChat && (
            <button
              type="button"
              onClick={() => {
                setConfirmClear(false);
                onNewChat();
                textareaRef.current?.focus();
              }}
              title="New chat"
              aria-label="New chat"
              className="studio-ai-icon-btn"
            >
              <FilePlus2 size={14} />
            </button>
          )}
          {hasMessages && onClearMessages && (
            confirmClear ? (
              <div className="studio-ai-confirm-bar" role="group" aria-label="Confirm clear conversation">
                <span>Clear chat?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearMessages();
                    setConfirmClear(false);
                  }}
                  className="studio-ai-confirm-yes"
                  title="Confirm clear conversation"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="studio-ai-confirm-no"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="studio-ai-icon-btn"
              >
                <Trash2 size={14} />
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            title={expanded ? "Compact chat panel" : "Expand chat panel"}
            aria-label={expanded ? "Compact chat panel" : "Expand chat panel"}
            className="studio-ai-icon-btn"
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            title="Minimize AI chat"
            aria-label="Hide AI chat"
            className="studio-ai-icon-btn"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Conversation History Thread */}
      {showHistory && hasMessages && (
        <div ref={threadRef} className="studio-ai-thread" role="log" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`studio-ai-message is-${message.role}`}>
              <div className="studio-ai-message-meta">
                <span>
                  {message.role === "user"
                    ? "You"
                    : message.role === "system"
                      ? "Workspace"
                      : activeModel.label}
                </span>
                {message.meta && <small>{message.meta}</small>}
              </div>
              <div className="studio-ai-message-body">{message.text}</div>
            </div>
          ))}
          {loading && (
            <div className="studio-ai-message is-assistant is-loading">
              <div className="studio-ai-message-meta">
                <span>{activeModel.label}</span>
                <small>{progress > 0 ? `${progress}%` : "Synthesizing"}</small>
              </div>
              <div className="studio-ai-progress-row">
                <LoaderCircle size={13} className="animate-spin text-[#4A90D9]" />
                <span>Generating geometry & updating workspace…</span>
              </div>
              {progress > 0 && (
                <div className="studio-ai-progress-bar" aria-hidden="true">
                  <div style={{ width: `${Math.min(100, Math.max(8, progress))}%` }} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts Bar when thread is empty or collapsed */}
      {quickPrompts.length > 0 && (!hasMessages || !showHistory) && (
        <div className="studio-ai-suggestions" aria-label="Quick prompts">
          {quickPrompts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (onQuickPrompt) {
                  onQuickPrompt(item.prompt);
                } else {
                  onPromptChange(item.prompt);
                  textareaRef.current?.focus();
                }
              }}
              className="studio-ai-chip"
            >
              <Wand2 size={11} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Reference Image Attachment Preview */}
      {referenceImage && (
        <div className="crystal-mobile-reference studio-ai-attachment">
          <img src={referenceImage} alt="Uploaded reference" />
          <div className="studio-ai-attachment-info">
            <span>Reference image attached</span>
            <small>Used as visual constraint</small>
          </div>
          {onRemoveImage && (
            <button
              type="button"
              aria-label="Remove uploaded image"
              title="Remove attachment"
              onClick={onRemoveImage}
              className="studio-ai-attachment-remove"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="studio-ai-error" role="alert">
          <span>{error}</span>
          {onClearError && (
            <button type="button" onClick={onClearError} aria-label="Dismiss error">
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Multiline Composer */}
      <div className="studio-ai-composer">
        <textarea
          ref={textareaRef}
          aria-label={
            studio === "floor-plan"
              ? "AI floor-plan prompt"
              : studio === "infrastructure"
                ? "Message the site assistant"
                : "AI model prompt"
          }
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (!event.shiftKey || event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              if (prompt.trim() && !loading) onSubmit();
            }
          }}
          enterKeyHint="send"
          placeholder={placeholder}
          rows={expanded ? 3 : 2}
          className="studio-ai-textarea"
        />

        {/* Composer Footer Controls */}
        <div className="studio-ai-controls">
          <div className="studio-ai-controls-left">
            {onAttachImage && (
              <label
                className="studio-ai-control-btn"
                aria-label="Attach reference"
                title="Attach reference image (PNG, JPG)"
              >
                <Paperclip size={15} />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onAttachImage(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            )}

            {/* Model Selector */}
            <div ref={modelDropdownRef} className="studio-ai-model-wrap">
              <button
                type="button"
                aria-label="AI mode"
                aria-expanded={modelMenuOpen}
                onClick={() => setModelMenuOpen((current) => !current)}
                title="Select AI generation mode"
                className="studio-ai-model-trigger"
              >
                <span className="studio-ai-model-dot" />
                <span className="truncate">{activeModel.label}</span>
                {activeModel.badge && <em className="studio-ai-model-badge">{activeModel.badge}</em>}
                <ChevronDown size={13} className={`transition-transform ${modelMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {modelMenuOpen && (
                <div className="studio-ai-model-menu" role="listbox" aria-label="AI model options">
                  <div className="studio-ai-model-menu-header">Select Mode</div>
                  {availableModels.map((option) => {
                    const isSelected = option.id === activeModel.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onModelChange(option.id);
                          setModelMenuOpen(false);
                        }}
                        className={`studio-ai-model-option ${isSelected ? "is-selected" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span>{option.label}</span>
                            {option.badge && <em>{option.badge}</em>}
                          </div>
                          {option.description && <small>{option.description}</small>}
                        </div>
                        {isSelected && <Check size={13} className="shrink-0 text-[#4A90D9]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {prompt.trim().length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onPromptChange("");
                  textareaRef.current?.focus();
                }}
                title="Clear input"
                aria-label="Clear input"
                className="studio-ai-control-btn is-subtle"
              >
                <Eraser size={14} />
              </button>
            )}
          </div>

          <div className="studio-ai-controls-right">
            <span className="studio-ai-shortcut-hint" aria-hidden="true">
              <CornerDownLeft size={11} /> Enter
            </span>
            {loading && onStop ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generation"
                title="Stop generation"
                className="studio-ai-send-btn is-stop"
              >
                <Square size={13} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Send AI request"
                title="Send prompt (Enter)"
                disabled={!prompt.trim() || loading}
                onClick={onSubmit}
                className="studio-ai-send-btn"
              >
                {loading ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.2} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
