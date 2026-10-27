"use client";
import { useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  CreditCard,
  FilePlus2,
  LogOut,
  Moon,
  RefreshCw,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
  Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCrystalTheme } from "@/lib/crystal-theme";
import { StudioButton } from "./kit";
import "./viewport-toolbar.css";

const AI_STUDIO_SETTINGS_KEY = "casynus:ai-studio-settings";

type PersistedStudioSettings = {
  aiModel: string;
  aiAutoAssist: boolean;
  renderQuality: "balanced" | "performance" | "ultra";
  grid: boolean;
  snap: boolean;
  unit: "mm" | "cm" | "m";
  scale: number;
  strokeSmoothing: boolean;
  cloudAutosave: boolean;
};

const DEFAULT_STUDIO_SETTINGS: PersistedStudioSettings = {
  aiModel: "gemini",
  aiAutoAssist: true,
  renderQuality: "balanced",
  grid: true,
  snap: true,
  unit: "mm",
  scale: 100,
  strokeSmoothing: true,
  cloudAutosave: true,
};

function readPersistedSettings(): PersistedStudioSettings {
  if (typeof window === "undefined") return DEFAULT_STUDIO_SETTINGS;
  try {
    const raw = window.localStorage.getItem(AI_STUDIO_SETTINGS_KEY);
    if (!raw) return DEFAULT_STUDIO_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PersistedStudioSettings>;
    return { ...DEFAULT_STUDIO_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_STUDIO_SETTINGS;
  }
}

export function StudioProfileMenu({
  open,
  placement = "top-left",
  onClose,
  onOpenSettings,
  onOpenProfile,
  onOpenUpgrade,
}: {
  open: boolean;
  placement?: "top-left" | "bottom-left";
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  onOpenUpgrade?: () => void;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useCrystalTheme();
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (target.closest('[aria-label="Your profile"]')) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const userName = session?.user?.name?.trim() || "Casynus Creator";
  const userEmail = session?.user?.email?.trim() || "Workspace account";
  const initial = (userName || userEmail || "C").charAt(0).toUpperCase();

  const handleProfile = () => {
    onClose();
    if (onOpenProfile) onOpenProfile();
    else window.open("/account", "_blank", "noopener,noreferrer");
  };

  const handleUpgrade = () => {
    onClose();
    if (onOpenUpgrade) onOpenUpgrade();
    else window.open("/pricing", "_blank", "noopener,noreferrer");
  };

  const handleBilling = () => {
    onClose();
    window.open("/pricing", "_blank", "noopener,noreferrer");
  };

  const handleLogout = () => {
    onClose();
    try {
      window.localStorage.removeItem("crystal-studio-state");
    } catch {
      /* ignore storage errors */
    }
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <section
      ref={menuRef}
      role="menu"
      aria-label="Profile menu"
      className={`cs-profile-menu is-${placement}`}
    >
      <header className="cs-profile-header">
        <span className="cs-profile-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="cs-profile-identity">
          <strong>{userName}</strong>
          <small>{userEmail}</small>
        </div>
        <span className="cs-profile-badge">Starter</span>
      </header>

      <div className="cs-profile-items">
        <button
          type="button"
          role="menuitem"
          aria-label="Open profile"
          className="cs-profile-item"
          onClick={handleProfile}
        >
          <User size={15} />
          <span>Profile</span>
        </button>

        <button
          type="button"
          role="menuitem"
          aria-label="Upgrade plan"
          className="cs-profile-item is-upgrade"
          onClick={handleUpgrade}
        >
          <Zap size={15} />
          <span>Upgrade</span>
          <em>Pro</em>
        </button>

        <div
          className="cs-profile-appearance"
          role="group"
          aria-label="Appearance mode"
        >
          <span className="cs-profile-appearance-label">
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            <span>Appearance</span>
          </span>
          <div className="cs-profile-theme-pills">
            <button
              type="button"
              aria-label="Dark mode"
              aria-pressed={theme === "dark"}
              className={theme === "dark" ? "is-active" : ""}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              type="button"
              aria-label="Light mode"
              aria-pressed={theme === "light"}
              className={theme === "light" ? "is-active" : ""}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        <button
          type="button"
          role="menuitem"
          aria-label="Billing and subscription"
          className="cs-profile-item"
          onClick={handleBilling}
        >
          <CreditCard size={15} />
          <span>Billing</span>
        </button>

        <button
          type="button"
          role="menuitem"
          aria-label="Open studio settings"
          className="cs-profile-item"
          onClick={() => {
            onClose();
            onOpenSettings();
          }}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>

        <i className="cs-profile-divider" aria-hidden="true" />

        <button
          type="button"
          role="menuitem"
          aria-label="Log out"
          className="cs-profile-item is-danger"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </section>
  );
}

export function StudioSettingsFrame({
  open,
  placement = "top-left",
  onClose,
  aiModel,
  onAiModelChange,
  grid,
  onGridChange,
  snap,
  onSnapChange,
  unit,
  onUnitChange,
  scale,
  onScaleChange,
  onOpenCanvasSetup,
  onSaveProject,
  projectStatus,
}: {
  open: boolean;
  placement?: "top-left" | "bottom-left";
  onClose: () => void;
  aiModel?: string;
  onAiModelChange?: (model: string) => void;
  grid?: boolean;
  onGridChange?: (grid: boolean) => void;
  snap?: boolean;
  onSnapChange?: (snap: boolean) => void;
  unit?: "mm" | "cm" | "m";
  onUnitChange?: (unit: "mm" | "cm" | "m") => void;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  onOpenCanvasSetup?: () => void;
  onSaveProject?: () => void;
  projectStatus?: string;
}) {
  const { theme, setTheme } = useCrystalTheme();
  const [persisted, setPersisted] = useState<PersistedStudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const frameRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setPersisted(readPersistedSettings());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (frameRef.current?.contains(target)) return;
      if (target.closest('[aria-label="Studio settings"]')) return;
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updatePersisted = (patch: Partial<PersistedStudioSettings>) => {
    setPersisted((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(AI_STUDIO_SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  };

  const activeModel = aiModel ?? persisted.aiModel;
  const activeGrid = grid ?? persisted.grid;
  const activeSnap = snap ?? persisted.snap;
  const activeUnit = unit ?? persisted.unit;
  const activeScale = scale ?? persisted.scale;

  return (
    <section
      ref={frameRef}
      role="dialog"
      aria-modal="false"
      aria-label="Casynus AI Studio settings"
      className={`cs-studio-settings-frame is-${placement}`}
    >
      <header className="cs-studio-settings-header">
        <div className="cs-studio-settings-title">
          <span className="cs-studio-settings-icon" aria-hidden="true">
            <Sparkles size={15} />
          </span>
          <div>
            <strong>Casynus AI Studio</strong>
            <small>AI Copilot, Workspace & Precision</small>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close studio settings"
          className="cs-studio-settings-close"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </header>

      <div className="cs-studio-settings-section">
        <h3>AI Copilot & Generation</h3>
        <label className="cs-studio-settings-row">
          <span>Default AI Model</span>
          <select
            aria-label="Default AI model"
            value={activeModel}
            onChange={(event) => {
              const next = event.target.value;
              updatePersisted({ aiModel: next });
              onAiModelChange?.(next);
            }}
          >
            <option value="gemini">Gemini 2.5 Pro · Architecture & CAD</option>
            <option value="groq">Groq Llama 3.3 · Fast Drafting</option>
            <option value="you">You Research · Codes & Standards</option>
            <option value="hunyuan">Hunyuan3D 2.1 · 3D Mesh</option>
          </select>
        </label>

        <label className="cs-studio-settings-toggle">
          <span>AI Scene & Sketch Auto-Assist</span>
          <input
            type="checkbox"
            aria-label="AI auto-assist"
            checked={persisted.aiAutoAssist}
            onChange={(event) => updatePersisted({ aiAutoAssist: event.target.checked })}
          />
        </label>

        <label className="cs-studio-settings-row">
          <span>Render & Viewport Quality</span>
          <select
            aria-label="AI studio quality"
            value={persisted.renderQuality}
            onChange={(event) =>
              updatePersisted({
                renderQuality: event.target.value as PersistedStudioSettings["renderQuality"],
              })
            }
          >
            <option value="balanced">Balanced Studio</option>
            <option value="performance">Performance (60 FPS)</option>
            <option value="ultra">Ultra PBR & High-DPI</option>
          </select>
        </label>
      </div>

      <div className="cs-studio-settings-section">
        <h3>Workspace & Precision</h3>
        <div className="cs-studio-settings-inline" role="group" aria-label="Studio appearance mode">
          <span>Appearance</span>
          <div className="cs-profile-theme-pills">
            <button
              type="button"
              aria-label="Studio dark mode"
              aria-pressed={theme === "dark"}
              className={theme === "dark" ? "is-active" : ""}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
            <button
              type="button"
              aria-label="Studio light mode"
              aria-pressed={theme === "light"}
              className={theme === "light" ? "is-active" : ""}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
          </div>
        </div>

        <label className="cs-studio-settings-toggle">
          <span>Show Viewport Grid</span>
          <input
            type="checkbox"
            aria-label="Show studio grid"
            checked={activeGrid}
            onChange={(event) => {
              const next = event.target.checked;
              updatePersisted({ grid: next });
              onGridChange?.(next);
            }}
          />
        </label>

        <label className="cs-studio-settings-toggle">
          <span>Snap to Grid & Endpoints</span>
          <input
            type="checkbox"
            aria-label="Snap to grid and points"
            checked={activeSnap}
            onChange={(event) => {
              const next = event.target.checked;
              updatePersisted({ snap: next });
              onSnapChange?.(next);
            }}
          />
        </label>

        <div className="cs-studio-settings-grid">
          <label>
            <span>Units</span>
            <select
              aria-label="Studio units"
              value={activeUnit}
              onChange={(event) => {
                const next = event.target.value as "mm" | "cm" | "m";
                updatePersisted({ unit: next });
                onUnitChange?.(next);
              }}
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="m">Meters (m)</option>
            </select>
          </label>
          <label>
            <span>Drawing Scale</span>
            <select
              aria-label="Studio scale"
              value={activeScale}
              onChange={(event) => {
                const next = Number(event.target.value) || 100;
                updatePersisted({ scale: next });
                onScaleChange?.(next);
              }}
            >
              <option value={50}>1 : 50</option>
              <option value={100}>1 : 100</option>
              <option value={200}>1 : 200</option>
            </select>
          </label>
        </div>
      </div>

      <div className="cs-studio-settings-section">
        <h3>Drawing & Cloud Sync</h3>
        <label className="cs-studio-settings-toggle">
          <span>Stroke Smoothing & Pen Pressure</span>
          <input
            type="checkbox"
            aria-label="Stroke smoothing and pen pressure"
            checked={persisted.strokeSmoothing}
            onChange={(event) => updatePersisted({ strokeSmoothing: event.target.checked })}
          />
        </label>

        <label className="cs-studio-settings-toggle">
          <span>Cloud Autosave & Recovery</span>
          <input
            type="checkbox"
            aria-label="Cloud autosave"
            checked={persisted.cloudAutosave}
            onChange={(event) => updatePersisted({ cloudAutosave: event.target.checked })}
          />
        </label>

        <div className="cs-studio-settings-status" role="status">
          <span>{projectStatus || "Cloud & browser recovery active"}</span>
        </div>
      </div>

      <footer className="cs-studio-settings-footer">
        {onOpenCanvasSetup && (
          <button
            type="button"
            aria-label="Open canvas setup from settings"
            onClick={() => {
              onClose();
              onOpenCanvasSetup();
            }}
          >
            <FilePlus2 size={14} />
            <span>Canvas Setup</span>
          </button>
        )}
        {onSaveProject && (
          <button
            type="button"
            aria-label="Sync project now"
            onClick={() => onSaveProject()}
          >
            <RefreshCw size={14} />
            <span>Sync Now</span>
          </button>
        )}
        <button
          type="button"
          aria-label="Open account settings"
          onClick={() => {
            onClose();
            window.open("/account", "_blank", "noopener,noreferrer");
          }}
        >
          <User size={14} />
          <span>Account</span>
        </button>
      </footer>
    </section>
  );
}

export function StudioSidebarFooter({
  onSettings,
  onProfile,
}: {
  onSettings: () => void;
  onProfile: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <footer className="cs-sidebar-footer" aria-label="Studio settings and profile">
      <StudioButton
        size="icon"
        variant="ghost"
        aria-label="Studio settings"
        aria-pressed={settingsOpen}
        title="Studio settings"
        onClick={() => {
          onSettings();
          setSettingsOpen((v) => !v);
          setProfileOpen(false);
        }}
      >
        <Settings size={21} />
      </StudioButton>
      <StudioButton
        size="icon"
        variant="ghost"
        aria-label="Your profile"
        aria-pressed={profileOpen}
        title="Your profile"
        onClick={() => {
          setProfileOpen((v) => !v);
          setSettingsOpen(false);
        }}
      >
        <CircleUserRound size={21} />
      </StudioButton>
      <StudioProfileMenu
        open={profileOpen}
        placement="bottom-left"
        onClose={() => setProfileOpen(false)}
        onOpenProfile={onProfile}
        onOpenSettings={() => {
          setProfileOpen(false);
          onSettings();
          setSettingsOpen(true);
        }}
      />
      <StudioSettingsFrame
        open={settingsOpen}
        placement="bottom-left"
        onClose={() => setSettingsOpen(false)}
      />
    </footer>
  );
}
