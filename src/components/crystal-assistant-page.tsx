"use client";

import {
  Aperture,
  Box,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  CircleDot,
  CirclePlay,
  Code2,
  Copy,
  Crosshair,
  Cuboid,
  Download,
  FileCode2,
  Gamepad2,
  Grip,
  Globe2,
  Home,
  Image as ImageIcon,
  Layers,
  LocateFixed,
  Maximize,
  Menu,
  Minus,
  Move,
  PanelTop,
  Pause,
  PenLine,
  Play,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Sun,
  Upload,
  Wand2,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const menuItems = ["File", "Edit", "Render", "Window", "Help", "Layout", "2D Sketch", "Texture Paint", "Shading", "Scripting"];
const centerTools: LucideIcon[] = [CircleDot, Maximize, Shuffle, Sun, LocateFixed];
const transformTools: LucideIcon[] = [Grip, Crosshair, Box, Cuboid, Gamepad2, PanelTop];
const modeTools: LucideIcon[] = [Circle, Wand2];
const editTools: LucideIcon[] = [Code2, ImageIcon, FileCode2, Copy, Layers, Square];
const promptTools: LucideIcon[] = [CirclePlay, Crosshair, Move, Aperture, Square, PenLine, Wrench, Cuboid, Box];
const footerTools: LucideIcon[] = [Menu, Settings, Square, Copy, Grip];
const playbackTools: LucideIcon[] = [SkipBack, ChevronsLeft, Play, Pause, SkipForward, ChevronsRight];

function IconButton({
  icon: Icon,
  label,
  active = false,
  size = 32,
  radius = 8,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  size?: number;
  radius?: number;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      type="button"
      className="grid place-items-center border"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: active ? "#0C8CE9" : "#323232",
        borderColor: active ? "#0C8CE9" : "#4E4E4E",
        color: active ? "#ffffff" : "#d8d8d8",
      }}
    >
      <Icon size={size <= 26 ? 14 : 18} strokeWidth={2} />
    </button>
  );
}

function TopGroup({
  children,
  width,
  left,
}: {
  children: React.ReactNode;
  width: number;
  left: number;
}) {
  return (
    <div
      className="absolute top-[82px] flex h-[36px] items-center justify-center gap-[12px] border"
      style={{
        left,
        width,
        borderRadius: 8,
        background: "#323232",
        borderColor: "#4E4E4E",
      }}
    >
      {children}
    </div>
  );
}

function DropControl() {
  return (
    <button
      type="button"
      className="absolute top-[82px] flex h-[36px] w-[117px] items-center justify-between border px-[12px] text-[12px]"
      style={{ left: 488, borderRadius: 8, background: "#323232", borderColor: "#4E4E4E", color: "#ffffff" }}
    >
      <span>Object Mode</span>
      <ChevronDown size={16} />
    </button>
  );
}

function ProjectPill({ left, width, text }: { left: number; width: number; text: string }) {
  return (
    <button
      type="button"
      className="absolute top-[62px] flex h-[26px] items-center justify-between border px-[10px] text-[12px]"
      style={{ left, width, borderRadius: 10, background: "#323232", borderColor: "#4E4E4E", color: "#ffffff" }}
    >
      <span>{text}</span>
      <span className="h-[14px] w-[14px] rounded-[4px]" style={{ background: "#4E4E4E" }} />
    </button>
  );
}

function TimelineCell({ children, left, width }: { children: React.ReactNode; left: number; width: number }) {
  return (
    <div
      className="absolute top-[3px] flex h-[26px] items-center justify-center gap-[6px] border text-[12px]"
      style={{ left, width, borderRadius: 10, background: "#323232", borderColor: "#4E4E4E", color: "#ffffff" }}
    >
      {children}
    </div>
  );
}

export function CrystalAssistantPage() {
  return (
    <div className="fixed inset-0 z-[90] overflow-hidden" style={{ background: "#222222" }}>
      <div
        className="crystal-ui relative h-[1080px] w-[1920px] overflow-hidden"
        style={{
          background: "#222222",
          transformOrigin: "top left",
          transform: "scale(min(calc(100vw / 1920), calc(100vh / 1080)))",
        }}
      >
        <style jsx global>{`
          .crystal-ui,
          .crystal-ui * {
            box-sizing: border-box;
            font-family: var(--font-roboto), Roboto, Arial, sans-serif;
            letter-spacing: 0;
          }

          .crystal-grid {
            background-color: #222222;
            background-image:
              linear-gradient(#4e4e4e 1px, transparent 1px),
              linear-gradient(90deg, #4e4e4e 1px, transparent 1px);
            background-size: 76px 64px;
            background-position: 0 0;
          }
        `}</style>

        <div className="absolute left-[6px] top-0 h-[32px] w-[1909px] border" style={{ borderRadius: 12, background: "#222222", borderColor: "#323232" }}>
          <div className="absolute left-[10px] top-0 flex h-[32px] items-center gap-[10px]">
            <Home size={16} color="#d8d8d8" strokeWidth={2} />
            <span className="text-[16px] font-medium leading-none" style={{ color: "#ffffff" }}>
              Crystal
            </span>
          </div>
          <div className="absolute right-[16px] top-0 flex h-[32px] items-center gap-[26px]" style={{ color: "#4E4E4E" }}>
            <Minus size={16} />
            <Plus size={16} />
            <Square size={14} />
          </div>
        </div>

        <div className="absolute left-[6px] top-[34px] h-[32px] w-[1909px] border" style={{ borderRadius: 12, background: "#222222", borderColor: "#323232" }}>
          <nav className="absolute left-[48px] top-0 flex h-[32px] items-center gap-[28px] text-[12px]" style={{ color: "#d8d8d8" }}>
            {menuItems.map((item) => (
              <button
                key={item}
                type="button"
                className="h-[24px] rounded-[4px] px-[8px] text-[12px]"
                style={{ background: item === "Layout" ? "#323232" : "transparent", color: "#d8d8d8" }}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="absolute right-[94px] top-[3px] flex h-[26px] w-[116px] items-center gap-[6px] border px-[10px]" style={{ borderRadius: 10, background: "#323232", borderColor: "#4E4E4E" }}>
            <Search size={14} color="#d8d8d8" />
            <span className="text-[12px]" style={{ color: "#d8d8d8" }}>
              Search
            </span>
          </div>
        </div>

        <ProjectPill left={10} width={177} text="Air Plane Motor V2.7" />
        <ProjectPill left={200} width={118} text="New Design" />

        <div className="crystal-grid absolute left-[24px] top-[78px] h-[970px] w-[1872px] overflow-hidden">
          <div className="absolute left-[936px] top-0 h-full w-px" style={{ background: "#0C8CE9" }} />
          <div className="absolute left-0 top-[485px] h-px w-full" style={{ background: "#4E4E4E" }} />
        </div>

        <div className="absolute left-[24px] top-[78px] h-[45px] w-[94px] border" style={{ borderRadius: 12, background: "#323232", borderColor: "#4E4E4E" }}>
          <div className="absolute left-[8px] top-[6px]">
            <IconButton icon={Shuffle} label="Link" size={32} radius={8} />
          </div>
          <div className="absolute left-[48px] top-[6px]">
            <IconButton icon={FileCode2} label="Active script" active size={32} radius={8} />
          </div>
        </div>

        <div className="absolute left-[450px] top-[82px]">
          <IconButton icon={Settings} label="Settings" size={32} radius={8} />
        </div>
        <DropControl />

        <TopGroup left={626} width={110}>
          {centerTools.map((Icon, index) => (
            <Icon key={index} size={18} color={index === 0 ? "#0C8CE9" : "#d8d8d8"} strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup left={760} width={110}>
          {transformTools.slice(0, 5).map((Icon, index) => (
            <Icon key={index} size={18} color="#d8d8d8" strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup left={884} width={64}>
          {modeTools.map((Icon, index) => (
            <Icon key={index} size={18} color={index === 1 ? "#0C8CE9" : "#d8d8d8"} strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup left={982} width={36}>
          <Wand2 size={18} color="#d8d8d8" strokeWidth={2} />
        </TopGroup>
        <TopGroup left={1032} width={64}>
          <Save size={18} color="#d8d8d8" strokeWidth={2} />
          <Download size={18} color="#d8d8d8" strokeWidth={2} />
        </TopGroup>
        <TopGroup left={1120} width={110}>
          {editTools.slice(0, 5).map((Icon, index) => (
            <Icon key={index} size={18} color="#d8d8d8" strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup left={1244} width={36}>
          <Layers size={18} color="#d8d8d8" strokeWidth={2} />
        </TopGroup>

        <div className="absolute left-[1798px] top-[78px] h-[45px] w-[94px] border" style={{ borderRadius: 12, background: "#323232", borderColor: "#4E4E4E" }}>
          <div className="absolute left-[8px] top-[6px]">
            <IconButton icon={ChevronDown} label="Open options" size={32} radius={8} />
          </div>
          <div className="absolute left-[54px] top-[6px]">
            <IconButton icon={Play} label="Run" active size={32} radius={8} />
          </div>
        </div>

        <section
          className="absolute left-[716px] top-[826px] h-[120px] w-[487px] overflow-hidden border shadow-[0_16px_42px_rgba(0,0,0,0.32)]"
          style={{ borderRadius: 15, background: "#222222", borderColor: "#323232" }}
        >
          <div className="absolute left-0 top-0 h-[66px] w-[487px] px-[18px] pt-[14px]">
            <div className="text-[12px] leading-none" style={{ color: "#4E4E4E" }}>
              Create script or 3D Model
            </div>
            <div className="absolute bottom-[10px] left-[18px] flex h-[32px] w-[32px] items-center justify-center border" style={{ borderRadius: 10, background: "#323232", borderColor: "#4E4E4E" }}>
              <RotateCcw size={16} color="#d8d8d8" />
            </div>
            <div className="absolute bottom-[10px] left-[60px] flex h-[32px] w-[108px] items-center justify-center border text-[12px]" style={{ borderRadius: 10, background: "#323232", borderColor: "#4E4E4E", color: "#ffffff" }}>
              GPT- Hight
            </div>
            <button
              type="button"
              aria-label="Send"
              title="Send"
              className="absolute bottom-[10px] right-[10px] grid h-[32px] w-[32px] place-items-center border"
              style={{ borderRadius: 15, background: "#0C8CE9", borderColor: "#0C8CE9", color: "#ffffff" }}
            >
              <Play size={15} fill="#ffffff" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 flex h-[54px] w-[487px] items-center justify-center gap-[8px] border-t" style={{ borderColor: "#323232", background: "#323232", borderRadius: 15 }}>
            {promptTools.map((Icon, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Prompt tool ${index + 1}`}
                title={`Prompt tool ${index + 1}`}
                className="grid h-[40px] w-[40px] place-items-center border"
                style={{
                  borderRadius: 10,
                  background: index === 6 ? "#0C8CE9" : "#323232",
                  borderColor: "#4E4E4E",
                  color: index === 6 ? "#ffffff" : "#d8d8d8",
                }}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            ))}
          </div>
        </section>

        <div className="absolute right-[28px] bottom-[72px] flex gap-[12px]">
          <IconButton icon={Globe2} label="World" size={32} radius={16} />
          <IconButton icon={Sparkles} label="Assistant" size={32} radius={16} />
        </div>

        <div className="absolute left-[6px] top-[1048px] h-[32px] w-[1909px] border" style={{ borderRadius: 12, background: "#222222", borderColor: "#323232" }}>
          <div className="absolute left-[8px] top-[3px] flex h-[26px] w-[170px] items-center gap-[8px]">
            {footerTools.map((Icon, index) => (
              <IconButton key={index} icon={Icon} label={`Footer ${index + 1}`} size={26} radius={10} active={index === 4} />
            ))}
          </div>
          <TimelineCell left={810} width={57}>
            <Upload size={14} color="#d8d8d8" />
            <ChevronDown size={14} color="#d8d8d8" />
          </TimelineCell>
          <TimelineCell left={874} width={177}>
            {playbackTools.map((Icon, index) => (
              <button key={index} type="button" aria-label={`Playback ${index + 1}`} title={`Playback ${index + 1}`} className="grid h-[22px] w-[22px] place-items-center">
                <Icon size={15} color="#d8d8d8" fill={Icon === Play ? "#d8d8d8" : "none"} />
              </button>
            ))}
          </TimelineCell>
          <div className="absolute right-[42px] top-[3px] flex h-[26px] items-center overflow-hidden border text-[12px]" style={{ borderRadius: 10, background: "#323232", borderColor: "#4E4E4E", color: "#ffffff" }}>
            <span className="grid h-[26px] w-[76px] place-items-center">Start</span>
            <span className="grid h-[26px] w-[48px] place-items-center border-l" style={{ borderColor: "#4E4E4E" }}>
              1
            </span>
            <span className="grid h-[26px] w-[58px] place-items-center border-l" style={{ borderColor: "#4E4E4E" }}>
              End
            </span>
            <span className="grid h-[26px] w-[58px] place-items-center border-l" style={{ borderColor: "#4E4E4E" }}>
              240
            </span>
            <button type="button" aria-label="Timeline settings" className="grid h-[26px] w-[26px] place-items-center" style={{ background: "#0C8CE9", color: "#ffffff" }}>
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
