"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, CircleEllipsis, Pause, Play, Settings, Video } from "lucide-react";

type Props = { start: number; end: number; current: number; playing: boolean; alternateTheme: boolean; onStartChange: (value: number) => void; onEndChange: (value: number) => void; onCurrentChange: (value: number) => void; onPlayingChange: (value: boolean) => void; onThemeToggle: () => void };

export function Timeline(props: Props) {
  return (
    <footer className="col-span-full flex h-10 items-center border-t border-[#303030] bg-[#202020] px-2 text-zinc-100">
      <div className="flex items-center gap-1"><button aria-label="Application menu" className="grid h-7 w-7 place-items-center rounded-full bg-[#303030]"><CircleEllipsis size={17} /></button><button aria-label="Application settings" className="grid h-7 w-7 place-items-center rounded-full bg-[#303030]"><Settings size={16} /></button><button aria-label="Toggle accent theme" aria-pressed={props.alternateTheme} onClick={props.onThemeToggle} className={`h-7 w-7 rounded-full border-4 border-[#303030] bg-[conic-gradient(#1687f7,#ffe65b,#f45858,#1687f7)] transition ${props.alternateTheme ? "rotate-180" : ""}`} /></div>
      <input aria-label="Timeline frame" type="range" min={props.start} max={Math.max(props.end, props.start + 1)} value={props.current} onChange={(event) => props.onCurrentChange(Number(event.target.value))} className="mx-5 min-w-0 flex-1 accent-[#1687f7]" />
      <div className="flex items-center gap-1 rounded-full bg-[#303030] p-0.5"><Video size={15} className="mx-2" /><button aria-label="First frame" onClick={() => props.onCurrentChange(props.start)}><ChevronFirst size={18} /></button><button aria-label="Previous frame" onClick={() => props.onCurrentChange(Math.max(props.start, props.current - 1))}><ChevronLeft size={18} /></button><button aria-label={props.playing ? "Pause" : "Play"} onClick={() => props.onPlayingChange(!props.playing)} className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-[#202020]">{props.playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><button aria-label="Next frame" onClick={() => props.onCurrentChange(Math.min(props.end, props.current + 1))}><ChevronRight size={18} /></button><button aria-label="Last frame" onClick={() => props.onCurrentChange(props.end)}><ChevronLast size={18} /></button></div>
      <div className="ml-auto flex h-7 items-center overflow-hidden rounded-full bg-[#303030] text-[11px]"><label className="flex items-center px-3">Start<input aria-label="Start frame" type="number" value={props.start} onChange={(event) => props.onStartChange(Number(event.target.value))} className="ml-2 w-9 bg-transparent text-center outline-none" /></label><label className="flex items-center border-l border-[#454545] px-3">End<input aria-label="End frame" type="number" value={props.end} onChange={(event) => props.onEndChange(Number(event.target.value))} className="ml-2 w-10 bg-transparent text-center outline-none" /></label><Settings size={15} className="box-content bg-[#1687f7] p-2" /></div>
    </footer>
  );
}
