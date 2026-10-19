"use client";

import {
  Check,
  LoaderCircle,
  Paperclip,
  Sparkles,
  Square,
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
    { id: "Precision Mode", label: "Precision Mode", badge: "CAD", description: "Precision corridor, junction & site synthesis" },
    { id: "Site Assistant", label: "Site Assistant", badge: "Local", description: "Local circulation, drainage & landscape review" },
    { id: "Mobility Review", label: "Mobility Review", badge: "Local", description: "Road network, parking & pedestrian access checks" },
  ],
};

const STUDIO_TITLES: Record<StudioAIChatProps["studio"], { title: string; subtitle: string }> = {
  modeling: { title: "Casynus AI", subtitle: "3D Studio" },
  "floor-plan": { title: "Casynus AI", subtitle: "Interior & Floor Plan" },
  infrastructure: { title: "Casynus AI", subtitle: "Infrastructure Studio" },
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
  referenceImage,
  onAttachImage,
  onRemoveImage,
  placeholder = "What do you want to create?",
  className = "",
}: StudioAIChatProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const availableModels = models ?? DEFAULT_MODELS[studio];
  const activeModel =
    availableModels.find((item) => item.id === model || item.label === model) ??
    availableModels[0];
  const meta = STUDIO_TITLES[studio];
  const activeReferenceImage = referenceImage ?? localImage;
  const hasUserMessages = messages.some((m) => m.role === "user");

  useEffect(() => {
    if (hasUserMessages) {
      setShowHistory(true);
    }
  }, [hasUserMessages, messages.length]);

  useEffect(() => {
    if (threadRef.current && showHistory) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages.length, loading, showHistory]);

  useEffect(() => {
    if (!modelMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
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
      </button>
    );
  }

  return (
    <div
      className={`crystal-ai-prompt studio-ai-panel ${className}`}
      role="region"
      aria-label={meta.title}
    >
      {/* Conversation Thread (shown when user interacts or generation is active) */}
      {(showHistory && hasUserMessages) || loading ? (
        <div
          ref={threadRef}
          className="studio-ai-thread"
          role="log"
          aria-live="polite"
        >
          <div className="studio-ai-thread-bar">
            <span>{meta.title}</span>
            {hasUserMessages && (
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                aria-label="Collapse conversation history"
                title="Hide messages"
                className="studio-ai-thread-close"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {messages
            .filter((m) => hasUserMessages || m.role === "user")
            .map((message) => (
              <div
                key={message.id}
                className={`studio-ai-message is-${message.role}`}
              >
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
                <LoaderCircle size={13} className="animate-spin text-[#1687f7]" />
                <span>Generating geometry & updating workspace…</span>
              </div>
              {progress > 0 && (
                <div className="studio-ai-progress-bar" aria-hidden="true">
                  <div
                    style={{ width: `${Math.min(100, Math.max(8, progress))}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Reference Image Attachment Preview */}
      {activeReferenceImage && (
        <div className="crystal-mobile-reference studio-ai-attachment">
          <img src={activeReferenceImage} alt="Uploaded reference" />
          <div className="studio-ai-attachment-info">
            <span>Reference image attached</span>
            <small>Used as visual constraint</small>
          </div>
          <button
            type="button"
            aria-label="Remove uploaded image"
            title="Remove attachment"
            onClick={() => {
              if (onRemoveImage) onRemoveImage();
              setLocalImage(null);
            }}
            className="studio-ai-attachment-remove"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="studio-ai-error" role="alert">
          <span>{error}</span>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              aria-label="Dismiss error"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Unified Minimal Composer */}
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
            if (
              event.key === "Enter" &&
              (!event.shiftKey || event.ctrlKey || event.metaKey)
            ) {
              event.preventDefault();
              if (prompt.trim() && !loading) onSubmit();
            }
          }}
          enterKeyHint="send"
          placeholder={placeholder}
          rows={2}
          className="studio-ai-textarea"
        />

        {/* Bottom Controls Row: [Paperclip] [Precision Mode] ... [Blue Send] */}
        <div className="studio-ai-controls">
          <div className="studio-ai-controls-left">
            <label
              className="studio-ai-attach-btn"
              aria-label="Attach reference"
              title="Attach reference image (PNG, JPG)"
            >
              <Paperclip size={16} strokeWidth={1.9} />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    if (onAttachImage) {
                      onAttachImage(file);
                    } else {
                      setLocalImage(URL.createObjectURL(file));
                    }
                  }
                  event.currentTarget.value = "";
                }}
              />
            </label>

            {/* Mode Pill Button */}
            <div ref={modelDropdownRef} className="studio-ai-model-wrap">
              <button
                type="button"
                aria-label="AI mode"
                aria-expanded={modelMenuOpen}
                onClick={() => setModelMenuOpen((current) => !current)}
                title="Select AI generation mode"
                className="studio-ai-mode-pill"
              >
                <span className="truncate">{activeModel.label}</span>
              </button>

              {modelMenuOpen && (
                <div
                  className="studio-ai-model-menu"
                  role="listbox"
                  aria-label="AI model options"
                >
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
                        className={`studio-ai-model-option ${
                          isSelected ? "is-selected" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span>{option.label}</span>
                            {option.badge && <em>{option.badge}</em>}
                          </div>
                          {option.description && (
                            <small>{option.description}</small>
                          )}
                        </div>
                        {isSelected && (
                          <Check size={13} className="shrink-0 text-[#1687f7]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="studio-ai-controls-right">
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
                {loading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
