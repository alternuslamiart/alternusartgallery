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
  Globe2,
  Grip,
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

const sizeClasses = {
  26: "h-[26px] w-[26px]",
  32: "h-[32px] w-[32px]",
  40: "h-[40px] w-[40px]",
} as const;

const radiusClasses = {
  8: "rounded-[8px]",
  10: "rounded-[10px]",
  15: "rounded-[15px]",
  16: "rounded-[16px]",
} as const;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
  size?: keyof typeof sizeClasses;
  radius?: keyof typeof radiusClasses;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      type="button"
      className={cx(
        "grid place-items-center border",
        sizeClasses[size],
        radiusClasses[radius],
        active ? "border-[#0C8CE9] bg-[#0C8CE9] text-white" : "border-[#4E4E4E] bg-[#323232] text-white",
      )}
    >
      <Icon size={size <= 26 ? 14 : 18} strokeWidth={2} />
    </button>
  );
}

function TopGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div className={cx("absolute top-[82px] flex h-[36px] items-center justify-center gap-[12px] rounded-[8px] border border-[#4E4E4E] bg-[#323232]", className)}>
      {children}
    </div>
  );
}

function ProjectPill({ className, text }: { className: string; text: string }) {
  return (
    <button type="button" className={cx("absolute top-[62px] flex h-[26px] items-center justify-between rounded-[10px] border border-[#4E4E4E] bg-[#323232] px-[10px] text-[12px] text-white", className)}>
      <span>{text}</span>
      <span className="h-[14px] w-[14px] rounded-[4px] bg-[#4E4E4E]" />
    </button>
  );
}

function TimelineCell({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div className={cx("absolute top-[3px] flex h-[26px] items-center justify-center gap-[6px] rounded-[10px] border border-[#4E4E4E] bg-[#323232] text-[12px] text-white", className)}>
      {children}
    </div>
  );
}

export function CrystalAssistantPage() {
  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-[#222222]">
      <div className="relative h-[1080px] w-[1920px] origin-top-left overflow-hidden bg-[#222222] font-roboto [transform:scale(min(calc(100vw/1920),calc(100vh/1080)))]">
        <div className="absolute left-[6px] top-0 h-[32px] w-[1909px] rounded-[12px] border border-[#323232] bg-[#222222]">
          <div className="absolute left-[10px] top-0 flex h-[32px] items-center gap-[10px]">
            <Home size={16} color="#ffffff" strokeWidth={2} />
            <span className="text-[16px] font-medium leading-none text-white">Crystal</span>
          </div>
          <div className="absolute right-[16px] top-0 flex h-[32px] items-center gap-[26px] text-[#4E4E4E]">
            <Minus size={16} />
            <Plus size={16} />
            <Square size={14} />
          </div>
        </div>

        <div className="absolute left-[6px] top-[34px] h-[32px] w-[1909px] rounded-[12px] border border-[#323232] bg-[#222222]">
          <nav className="absolute left-[48px] top-0 flex h-[32px] items-center gap-[28px] text-[12px] text-white">
            {menuItems.map((item) => (
              <button key={item} type="button" className={cx("h-[24px] rounded-[4px] px-[8px] text-[12px]", item === "Layout" && "bg-[#323232]")}>
                {item}
              </button>
            ))}
          </nav>
          <div className="absolute right-[94px] top-[3px] flex h-[26px] w-[116px] items-center gap-[6px] rounded-[10px] border border-[#4E4E4E] bg-[#323232] px-[10px]">
            <Search size={14} color="#ffffff" />
            <span className="text-[12px] text-white">Search</span>
          </div>
        </div>

        <ProjectPill className="left-[10px] w-[177px]" text="Air Plane Motor V2.7" />
        <ProjectPill className="left-[200px] w-[118px]" text="New Design" />

        <div className="absolute left-[24px] top-[78px] h-[970px] w-[1872px] overflow-hidden bg-[#222222] bg-[linear-gradient(#4E4E4E_1px,transparent_1px),linear-gradient(90deg,#4E4E4E_1px,transparent_1px)] bg-[length:76px_64px] bg-[position:0_0]">
          <div className="absolute left-[936px] top-0 h-full w-px bg-[#0C8CE9]" />
          <div className="absolute left-0 top-[485px] h-px w-full bg-[#4E4E4E]" />
        </div>

        <div className="absolute left-[24px] top-[78px] h-[45px] w-[94px] rounded-[12px] border border-[#4E4E4E] bg-[#323232]">
          <div className="absolute left-[8px] top-[6px]">
            <IconButton icon={Shuffle} label="Link" />
          </div>
          <div className="absolute left-[48px] top-[6px]">
            <IconButton icon={FileCode2} label="Active script" active />
          </div>
        </div>

        <div className="absolute left-[450px] top-[82px]">
          <IconButton icon={Settings} label="Settings" />
        </div>
        <button type="button" className="absolute left-[488px] top-[82px] flex h-[36px] w-[117px] items-center justify-between rounded-[8px] border border-[#4E4E4E] bg-[#323232] px-[12px] text-[12px] text-white">
          <span>Object Mode</span>
          <ChevronDown size={16} />
        </button>

        <TopGroup className="left-[626px] w-[110px]">
          {centerTools.map((Icon, index) => (
            <Icon key={index} size={18} color={index === 0 ? "#0C8CE9" : "#ffffff"} strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup className="left-[760px] w-[110px]">
          {transformTools.slice(0, 5).map((Icon, index) => (
            <Icon key={index} size={18} color="#ffffff" strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup className="left-[884px] w-[64px]">
          {modeTools.map((Icon, index) => (
            <Icon key={index} size={18} color={index === 1 ? "#0C8CE9" : "#ffffff"} strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup className="left-[982px] w-[36px]">
          <Wand2 size={18} color="#ffffff" strokeWidth={2} />
        </TopGroup>
        <TopGroup className="left-[1032px] w-[64px]">
          <Save size={18} color="#ffffff" strokeWidth={2} />
          <Download size={18} color="#ffffff" strokeWidth={2} />
        </TopGroup>
        <TopGroup className="left-[1120px] w-[110px]">
          {editTools.slice(0, 5).map((Icon, index) => (
            <Icon key={index} size={18} color="#ffffff" strokeWidth={2} />
          ))}
        </TopGroup>
        <TopGroup className="left-[1244px] w-[36px]">
          <Layers size={18} color="#ffffff" strokeWidth={2} />
        </TopGroup>

        <div className="absolute left-[1798px] top-[78px] h-[45px] w-[94px] rounded-[12px] border border-[#4E4E4E] bg-[#323232]">
          <div className="absolute left-[8px] top-[6px]">
            <IconButton icon={ChevronDown} label="Open options" />
          </div>
          <div className="absolute left-[54px] top-[6px]">
            <IconButton icon={Play} label="Run" active />
          </div>
        </div>

        <section className="absolute left-[716px] top-[826px] h-[120px] w-[487px] overflow-hidden rounded-[15px] border border-[#323232] bg-[#222222] shadow-[0_16px_42px_rgba(0,0,0,0.32)]">
          <div className="absolute left-0 top-0 h-[66px] w-[487px] px-[18px] pt-[14px]">
            <div className="text-[12px] leading-none text-[#4E4E4E]">Create script or 3D Model</div>
            <div className="absolute bottom-[10px] left-[18px] flex h-[32px] w-[32px] items-center justify-center rounded-[10px] border border-[#4E4E4E] bg-[#323232] text-white">
              <RotateCcw size={16} />
            </div>
            <div className="absolute bottom-[10px] left-[60px] flex h-[32px] w-[108px] items-center justify-center rounded-[10px] border border-[#4E4E4E] bg-[#323232] text-[12px] text-white">
              GPT- Hight
            </div>
            <button type="button" aria-label="Send" title="Send" className="absolute bottom-[10px] right-[10px] grid h-[32px] w-[32px] place-items-center rounded-[15px] border border-[#0C8CE9] bg-[#0C8CE9] text-white">
              <Play size={15} fill="currentColor" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 flex h-[54px] w-[487px] items-center justify-center gap-[8px] rounded-[15px] border-t border-[#323232] bg-[#323232]">
            {promptTools.map((Icon, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Prompt tool ${index + 1}`}
                title={`Prompt tool ${index + 1}`}
                className={cx(
                  "grid h-[40px] w-[40px] place-items-center rounded-[10px] border text-white",
                  index === 6 ? "border-[#0C8CE9] bg-[#0C8CE9]" : "border-[#4E4E4E] bg-[#323232]",
                )}
              >
                <Icon size={18} strokeWidth={2} />
              </button>
            ))}
          </div>
        </section>

        <div className="absolute bottom-[72px] right-[28px] flex gap-[12px]">
          <IconButton icon={Globe2} label="World" radius={16} />
          <IconButton icon={Sparkles} label="Assistant" radius={16} />
        </div>

        <div className="absolute left-[6px] top-[1048px] h-[32px] w-[1909px] rounded-[12px] border border-[#323232] bg-[#222222]">
          <div className="absolute left-[8px] top-[3px] flex h-[26px] w-[170px] items-center gap-[8px]">
            {footerTools.map((Icon, index) => (
              <IconButton key={index} icon={Icon} label={`Footer ${index + 1}`} size={26} radius={10} active={index === 4} />
            ))}
          </div>
          <TimelineCell className="left-[810px] w-[57px]">
            <Upload size={14} color="#ffffff" />
            <ChevronDown size={14} color="#ffffff" />
          </TimelineCell>
          <TimelineCell className="left-[874px] w-[177px]">
            {playbackTools.map((Icon, index) => (
              <button key={index} type="button" aria-label={`Playback ${index + 1}`} title={`Playback ${index + 1}`} className="grid h-[22px] w-[22px] place-items-center text-white">
                <Icon size={15} fill={Icon === Play ? "currentColor" : "none"} />
              </button>
            ))}
          </TimelineCell>
          <div className="absolute right-[42px] top-[3px] flex h-[26px] items-center overflow-hidden rounded-[10px] border border-[#4E4E4E] bg-[#323232] text-[12px] text-white">
            <span className="grid h-[26px] w-[76px] place-items-center">Start</span>
            <span className="grid h-[26px] w-[48px] place-items-center border-l border-[#4E4E4E]">1</span>
            <span className="grid h-[26px] w-[58px] place-items-center border-l border-[#4E4E4E]">End</span>
            <span className="grid h-[26px] w-[58px] place-items-center border-l border-[#4E4E4E]">240</span>
            <button type="button" aria-label="Timeline settings" className="grid h-[26px] w-[26px] place-items-center bg-[#0C8CE9] text-white">
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
