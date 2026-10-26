"use client";

import { ArrowUp, LoaderCircle, Maximize2, Mic, MicOff, Minimize2, Minus, Paperclip, Plus, Radio, Sparkles, Square, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { requestStudioAnswer, STUDIO_AI_PROVIDERS } from "@/lib/studio-ai.mjs";
import { StudioBadge, StudioButton } from "./kit";
import { useStudioDock } from "./StudioConversation";
import { useStudioVoice } from "./useStudioVoice";
import { useStudioActions } from "./StudioActions";
import { VoiceSpeechModal } from "./VoiceSpeechModal";
import { parseStudioCommand } from "@/lib/studio-actions.mjs";

export type StudioChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;
  meta?: string;
  assetJobId?: string;
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
  onMessagesChange?: Dispatch<SetStateAction<StudioChatMessage[]>>;
  requestAnswer?: typeof requestStudioAnswer;
  onClearMessages?: () => void;
  onNewChat?: () => void;
  referenceImage?: string | null;
  onAttachImage?: (file: File) => void;
  onRemoveImage?: () => void;
  onInsertGeneratedModel?: (id:string) => Promise<void>;
  onPreviewGeneratedModel?: (id:string) => Promise<void>;
  onDownloadGeneratedModel?: (id:string) => Promise<void>;
  generationStatus?: string | null;
  quickPrompts?: Array<{ label: string; prompt: string }>;
  onQuickPrompt?: (prompt: string) => void;
  placeholder?: string;
  statusLabel?: string;
  selectedContext?: string;
  contextControls?:ReactNode;
  onHistoryRequest?:(redo:boolean)=>void;
  onExecutionChange?: (active:boolean)=>void;
  className?: string;
};
const PROVIDER_MODELS: StudioChatModelOption[] = [
  { id: "gemini", label: "Gemini" }, { id: "groq", label: "Groq" }, { id: "you", label: "You" },
];
const DEFAULT_MODELS: Record<StudioAIChatProps["studio"], StudioChatModelOption[]> = {
  modeling: [...PROVIDER_MODELS, { id: "Precision Mode", label: "Local scene commands" }, { id: "Fast Concept", label: "Local concept demo" }],
  "floor-plan": [...PROVIDER_MODELS, { id: "Precision Mode", label: "Local floor-plan layout" }, { id: "Fast Concept", label: "Local concept layout" }],
  infrastructure: [...PROVIDER_MODELS, { id: "Precision Mode", label: "Local site review" }, { id: "Site Assistant", label: "Local site assistant" }, { id: "Mobility Review", label: "Local mobility review" }],
};
const STUDIO_NAMES = { modeling: "3D Studio", "floor-plan": "Interior", infrastructure: "Infrastructure" };

export function StudioAIChat({
  studio, open, onOpenChange, prompt, onPromptChange, onSubmit, onStop,
  loading: workspaceLoading = false, progress = 0, error, onClearError, model, onModelChange,
  models, messages = [], onMessagesChange, requestAnswer, referenceImage, onAttachImage, onRemoveImage, onInsertGeneratedModel, onPreviewGeneratedModel, onDownloadGeneratedModel, generationStatus, onNewChat, onClearMessages, statusLabel, selectedContext, onExecutionChange,contextControls,onHistoryRequest,
  quickPrompts = [], onQuickPrompt, placeholder = "What do you want to create?", className = "",
}: StudioAIChatProps) {
  const { expanded, setExpanded } = useStudioDock();
  const actions=useStudioActions();
  const { data: session, status: sessionStatus } = useSession();
  const identity = session?.user?.id ?? session?.user?.email ?? (sessionStatus === "loading" ? "loading" : "guest");
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const pendingRequest = useRef<AbortController | null>(null);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [sessionExpired,setSessionExpired]=useState(false);
  const voiceControl = useRef<{ stop: () => void } | null>(null);
  const loading = workspaceLoading || remoteLoading;
  const signInRequired=sessionExpired||(model==='hunyuan'&&sessionStatus!=='loading'&&!session?.user?.id);
  const displayError = remoteError || error || (signInRequired?'Sign in to your account before generating 3D models.':null);
  const signInHref=`/login?callbackUrl=${encodeURIComponent(studio==='modeling'?'/casynus':studio==='infrastructure'?'/infrastructure':'/interior?workspace=3d')}`;
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [imageFile,setImageFile]=useState<File|null>(null);
  const [imageStage,setImageStage]=useState('');
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelId = useId();
  const availableModels = models ?? DEFAULT_MODELS[studio];
  const activeModel = availableModels.find(item => item.id === model || item.label === model) ?? availableModels[0];
  const activeImage = referenceImage ?? localImage;
  const hasUserMessages = messages.some(message => message.role === "user");
  const visibleMessages = expanded ? messages : hasUserMessages ? messages.slice(-2) : [];

  useEffect(() => {
    setRemoteLoading(false);
    setRemoteError(null);
    setSessionExpired(false);
    setImageFile(null);setLocalImage(null);
    return () => { pendingRequest.current?.abort(); pendingRequest.current = null; };
  }, [identity]);

  const submitPrompt = async (providerOverride?: string, fromVoice = false, spokenCommand?:string) => {
    if ((!(spokenCommand??promptRef.current).trim() && !(model==='hunyuan'&&imageFile)) || loading || pendingRequest.current) return;
    if (!fromVoice) voiceControl.current?.stop();
    const selectedProvider = providerOverride && STUDIO_AI_PROVIDERS.includes(providerOverride) ? providerOverride : model;
    if(selectedProvider==='hunyuan'&&!session?.user?.id){setSessionExpired(true);setRemoteError('Sign in to your account before generating 3D models.');return;}
    let localCommand=false;try{localCommand=Boolean(parseStudioCommand(spokenCommand??promptRef.current));}catch{localCommand=true;}
    if(!localCommand&&!STUDIO_AI_PROVIDERS.includes(selectedProvider)&&!requestAnswer){onSubmit();return;}
    if (providerOverride) onModelChange(selectedProvider);
    if (!onMessagesChange) { setRemoteError("This workspace cannot receive AI replies."); return; }
    const requestIdentity = identity;
    const controller = new AbortController();
    pendingRequest.current = controller;
    setRemoteLoading(true);
    onExecutionChange?.(true);
    setRemoteError(null);
    onClearError?.();
    const message = (spokenCommand??promptRef.current).trim() || 'Generate 3D from reference image';
    onMessagesChange(current => [...current, { id: crypto.randomUUID(), role: "user", text: message }]);
    if(!spokenCommand)onPromptChange("");
    try {
      const command=selectedProvider==='hunyuan'?null:await actions.run(message,controller.signal);
      if(command){
        if(command.status==='error')throw new Error(command.message);
        if(controller.signal.aborted||identityRef.current!==requestIdentity)return;
        onMessagesChange(current=>[...current,{id:crypto.randomUUID(),role:'assistant',text:command.message,meta:command.status==='confirmation'?'Confirmation required':'Studio action confirmed'}]);
        return command.message;
      }
      if (!STUDIO_AI_PROVIDERS.includes(selectedProvider) && !requestAnswer) { if(!spokenCommand)onPromptChange(message);onSubmit();return; }
      let image:string|undefined;
      if(selectedProvider==='hunyuan'){
        if(!imageFile)throw new Error('Attach a reference image first. Hunyuan Shape supports Image to 3D.');
        setImageStage('Preparing image');
        image=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Image could not be read.'));reader.readAsDataURL(imageFile);});
        setImageStage('Submitting generation');
      }
      const result = await (requestAnswer ?? requestStudioAnswer)({ provider: selectedProvider, message, image, messages, signal: controller.signal });
      if (controller.signal.aborted || identityRef.current !== requestIdentity) return;
      const sources = result.citations?.length ? `\n\nSources:\n${result.citations.map(item => item.source).join("\n")}` : "";
      onMessagesChange(current => [...current, { id: crypto.randomUUID(), role: "assistant", text: result.message + sources, meta: `${result.provider} · ${result.model}`, ...(result.assetJobId?{assetJobId:result.assetJobId}:{}) }]);
      if (result.warning) setRemoteError(result.warning);
      return result.message;
    } catch (caught) {
      if (!controller.signal.aborted && identityRef.current === requestIdentity) {
        setRemoteError(caught instanceof Error ? caught.message : "The AI request failed.");
        if(caught&&typeof caught==='object'&&'status' in caught&&caught.status===401)setSessionExpired(true);
        if (!spokenCommand&&!promptRef.current.trim()) onPromptChange(message);
      }
      if(fromVoice)throw caught;
    } finally {
      if (pendingRequest.current === controller) { pendingRequest.current = null; setRemoteLoading(false);setImageStage(''); onExecutionChange?.(false); }
    }
  };

  const voice=useStudioVoice({identity,getDraft:()=>promptRef.current,
    onDraft:text=>{const bounded=text.slice(0,model==="you"?400:12_000);promptRef.current=bounded;onPromptChange(bounded);},
    onOpen:()=>{onOpenChange(true);requestAnimationFrame(()=>textareaRef.current?.focus());},
    onSend:command=>submitPrompt(undefined,true,command),
    onCancel:()=>pendingRequest.current?.abort(),
    canConverse:STUDIO_AI_PROVIDERS.includes(model)||Boolean(requestAnswer),
  });
  voiceControl.current=voice;
  const voiceModal=<VoiceSpeechModal open={voice.modalOpen} listening={voice.listening} busy={['preparing','requesting','transcribing','processing','executing','speaking'].includes(voice.phase)} level={voice.level} phase={voice.phase} feedback={voice.backend==='server'&&voice.listening?'Recording · server transcription':voice.feedback} error={voice.error} onStart={voice.start} onStop={voice.finish} onClose={voice.closeModal}/>;

  useEffect(() => {
    const submitFromMobileHome = (event: Event) => { void submitPrompt((event as CustomEvent<string>).detail); };
    window.addEventListener("crystal:submit-ai-chat", submitFromMobileHome);
    return () => window.removeEventListener("crystal:submit-ai-chat", submitFromMobileHome);
  });

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, loading, expanded, open]);
  useEffect(() => () => { if (localImage) URL.revokeObjectURL(localImage); }, [localImage]);

  if (!open) return <><button type="button" aria-label="Show AI chat" title="Open AI Assistant" aria-expanded={false}
    onClick={() => onOpenChange(true)} className={`crystal-ai-chat-toggle studio-ai-reopen-btn ${className}`}>
    <Sparkles size={16} /><span>Casynus AI</span>{voice.mode!=="off"&&<Mic size={13} aria-label="Voice listening enabled" />}{hasUserMessages && <StudioBadge>{messages.length}</StudioBadge>}
  </button>{voiceModal}</>;

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
    {selectedContext&&<div className="cs-chat-selection" aria-label="Selected object context" title={selectedContext}>Selected: {selectedContext}</div>}
    {contextControls}
    {(visibleMessages.length > 0 || expanded || loading) && <div id={panelId + "-thread"} className="studio-ai-thread" role="log" aria-live="polite" ref={threadRef}>
      {!visibleMessages.length && !loading && <p className="cs-chat-empty">Describe your idea or choose a suggestion to start.</p>}
      {visibleMessages.map(message => <div key={message.id} className={`studio-ai-message is-${message.role}`}>
        <div className="studio-ai-message-meta"><span>{message.role === "user" ? "You" : message.role === "system" ? "Workspace" : "Casynus"}</span>{message.meta && <small>{message.meta}</small>}</div>
        <div className="studio-ai-message-body">{message.text}</div>
        {message.assetJobId&&onInsertGeneratedModel&&<StudioButton size="sm" disabled={loading} onClick={()=>{setRemoteLoading(true);void onInsertGeneratedModel(message.assetJobId!).catch(error=>setRemoteError(error instanceof Error?error.message:'Model insertion failed.')).finally(()=>setRemoteLoading(false));}}>Insert into Studio</StudioButton>}
        {message.assetJobId&&onPreviewGeneratedModel&&<StudioButton size="sm" variant="ghost" disabled={loading} onClick={()=>{setRemoteLoading(true);void onPreviewGeneratedModel(message.assetJobId!).catch(error=>setRemoteError(error instanceof Error?error.message:'Preview failed.')).finally(()=>setRemoteLoading(false));}}>Preview 3D</StudioButton>}
        {message.assetJobId&&onDownloadGeneratedModel&&<StudioButton size="sm" variant="ghost" aria-label="Download GLB" disabled={loading} onClick={()=>{setRemoteLoading(true);void onDownloadGeneratedModel(message.assetJobId!).catch(error=>setRemoteError(error instanceof Error?error.message:'Download failed.')).finally(()=>setRemoteLoading(false));}}>Download GLB</StudioButton>}
      </div>)}
      {loading && <div className="studio-ai-message is-assistant" aria-busy="true">
        <div className="studio-ai-progress-row"><LoaderCircle size={14} className="cs-spin" /><span>{model==='hunyuan'?(generationStatus||imageStage||'Processing'):`Processing your request${progress > 0 ? ` · ${progress}%` : '…'}`}</span></div>
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
      <div className="studio-ai-attachment-info"><span>Reference image</span><small>{model==='hunyuan'?'Hunyuan3D 2.1 · Image to 3D':'Attached to this workspace'}</small></div>
      {model==='hunyuan'&&<StudioButton size="sm" variant="primary" disabled={loading} onClick={()=>void submitPrompt()}>Generate 3D</StudioButton>}
      <StudioButton size="icon" variant="ghost" aria-label="Remove uploaded image" title="Remove attachment"
        onClick={() => { onRemoveImage?.(); setLocalImage(null);setImageFile(null); }}><X size={14} /></StudioButton>
    </div>}
    {displayError && <div className="studio-ai-error" role="alert"><span>{displayError}</span>
      {signInRequired&&<a href={signInHref}>Sign in</a>}
      <StudioButton size="icon" variant="ghost" aria-label="Dismiss error" onClick={() => { setRemoteError(null); onClearError?.(); }}><X size={14} /></StudioButton>
    </div>}
    {voice.error&&<div className="studio-ai-error" role="alert"><span>{voice.error}</span><StudioButton size="icon" variant="ghost" aria-label="Dismiss voice error" onClick={voice.stop}><X size={14} /></StudioButton></div>}
    {!voice.modalOpen&&(voice.mode!=="off"||voice.conversation)&&<div className="cs-voice-status" role="status">
      <Mic size={13} />{voice.phase==='processing'?'Voice session · processing':voice.phase==='speaking'?'Voice session · speaking':voice.phase==='transcribing'?'Transcribing audio…':voice.phase==='preparing'?'Preparing server transcription…':!voice.listening?'Starting microphone · allow access if prompted':voice.backend==='server'?'Recording · audio will be sent for transcription':voice.conversation?'Voice session · speak your request':voice.mode==="wake"?'Listening for “Hey, Casynus”':'Recording dictation · review text before sending'}
      {voice.listening&&<meter className="cs-voice-level" aria-label="Microphone activity" min={0} max={1} value={voice.level} />}
      {voice.interim&&<span className="cs-voice-interim" aria-label="Interim transcription">{voice.interim}</span>}
      {voice.backend==='server'&&voice.phase==='recording'&&<StudioButton size="sm" variant="ghost" onClick={voice.finish} aria-label="Finish voice recording">Finish</StudioButton>}
      <StudioButton size="icon" variant="ghost" aria-label="Stop voice listening" title="Stop microphone (Esc)" onClick={voice.stop}><Square size={12} /></StudioButton>
    </div>}
    <div className="studio-ai-composer">
      <textarea ref={textareaRef} aria-label={studio === "floor-plan" ? "AI floor-plan prompt" : studio === "infrastructure" ? "Message the site assistant" : "AI model prompt"}
        value={prompt} onChange={event => onPromptChange(event.target.value)} rows={2} placeholder={placeholder}
        className="studio-ai-textarea" maxLength={model === "you" ? 400 : 12_000} enterKeyHint="send" onKeyDown={event => {
          if(onHistoryRequest&&!prompt.trim()&&!loading&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();onHistoryRequest(event.shiftKey);return;}
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault(); if ((prompt.trim() || (model==='hunyuan'&&imageFile)) && !loading) void submitPrompt();
          }
        }} />
      <div className="studio-ai-controls">
        <div className="studio-ai-controls-left">
          <label className="studio-ai-attach-btn" title="Attach reference image">
            <Paperclip size={16} /><input type="file" aria-label="Attach reference image" accept="image/png,image/jpeg,image/webp" disabled={loading} className="sr-only"
              onChange={async event => {
                const file = event.target.files?.[0];
                event.currentTarget.value = "";
                if(!file)return;
                try{
                  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>3_000_000)throw new Error('Use PNG, JPEG or WebP, at most 3 MB.');
                  const bitmap=await createImageBitmap(file);const valid=[bitmap.width,bitmap.height].every(n=>n>=32&&n<=4096);bitmap.close();
                  if(!valid)throw new Error('Image dimensions must be 32–4096 pixels.');
                  setImageFile(file);if(onAttachImage)onAttachImage(file);else setLocalImage(URL.createObjectURL(file));setRemoteError(null);
                }catch(error){setRemoteError(error instanceof Error?error.message:'Invalid image.');}
              }} />
          </label>
          <StudioButton size="icon" variant="ghost" active={voice.mode==="dictation"} aria-label={voice.mode==="dictation"?"Stop voice dictation":"Start voice dictation"} aria-keyshortcuts="Control+Q" title="Voice command (Ctrl + Q)" onClick={voice.toggleDictation}>{voice.mode==="dictation"?<MicOff size={16}/>:<Mic size={16}/>}</StudioButton>
          <StudioButton size="icon" variant="ghost" active={voice.conversation} aria-label={voice.conversation?"End voice conversation":"Start voice conversation"} aria-pressed={voice.conversation} title={voice.conversation?'End voice conversation':'Voice conversation · speech is sent to the selected AI provider; replies are spoken'} onClick={voice.toggleConversation}><Radio size={16}/></StudioButton>
          <select aria-label="AI mode" className="cs-chat-model" disabled={loading} value={activeModel?.id ?? ""} onChange={event => { setRemoteError(null); onModelChange(event.target.value); }}>
            {availableModels.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        {loading && (onStop||remoteLoading)
          ? <StudioButton size="icon" variant="primary" onClick={()=>{pendingRequest.current?.abort();onStop?.();}} aria-label={model==='hunyuan'?'Stop monitoring':'Stop generation'} title={model==='hunyuan'?'Stop monitoring; GPU job continues and can be resumed from AI generation jobs':'Stop generation'}><Square size={13} fill="currentColor" /></StudioButton>
          : <StudioButton size="icon" variant="primary" aria-label={model==='hunyuan'?'Generate 3D':'Send AI request'} title={model==='hunyuan'?'Generate 3D from attached image':'Send prompt (Enter)'} disabled={(!prompt.trim()&&!(model==='hunyuan'&&imageFile)) || loading} onClick={() => void submitPrompt()}>
            {loading ? <LoaderCircle size={16} className="cs-spin" /> : model==='hunyuan'?<Sparkles size={17}/>:<ArrowUp size={17} />}
          </StudioButton>}
      </div>
    </div>
    {statusLabel && <div className="cs-chat-status">{statusLabel}</div>}
    {voiceModal}
  </div>;
}
