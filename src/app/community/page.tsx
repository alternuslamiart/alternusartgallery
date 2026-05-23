"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
 Bell,
 Bookmark,
 ChevronDown,
 Code2,
 FileCode2,
 Gamepad2,
 GitFork,
 Globe2,
 Home,
 Layers3,
 MessageCircle,
 MessageSquareText,
 Plus,
 Search,
 Sparkles,
 Star,
 ThumbsUp,
 Wand2,
 Workflow,
} from "lucide-react";

const spaces = [
 { name: "showcase", label: "Showcase", count: "320 creations", icon: Sparkles },
 { name: "feedback", label: "Feedback", count: "118 reviews", icon: MessageSquareText },
 { name: "prompts-workflows", label: "Prompts & Workflows", count: "246 workflows", icon: Workflow },
 { name: "code-apps", label: "Code & Apps", count: "174 projects", icon: Code2 },
 { name: "game-environments", label: "Game Environments", count: "89 worlds", icon: Gamepad2 },
];

const feedPosts = [
 {
 id: "cyberpunk-city",
 title: "Built a cyberpunk city environment with AI",
 space: "showcase",
 author: "Dren Gashi",
 time: "18 min ago",
 type: "Game Environment",
 description:
 "Dense neon city block with rain lighting, modular buildings, market props, NPC route notes, and optimization checklist.",
 stack: ["Blender", "AI prompts", "Unreal plan"],
 notes: "Prompt chain includes mood references, asset list, lighting passes, and version notes.",
 comments: 18,
 likes: 142,
 saves: 36,
 forks: 11,
 icon: Gamepad2,
 accent: "from-[#312E81] via-[#6D28D9] to-[#38BDF8]",
 },
 {
 id: "saas-launch-page",
 title: "Generated a React landing page for SaaS",
 space: "feedback",
 author: "Elira Morina",
 time: "42 min ago",
 type: "Website Template",
 description:
 "Looking for critique on hero copy, section order, pricing cards, mobile rhythm, and CTA hierarchy.",
 stack: ["Next.js", "Tailwind", "Copy workflow"],
 notes: "Generation notes cover three hero variants, conversion copy, and responsive component decisions.",
 comments: 24,
 likes: 210,
 saves: 58,
 forks: 19,
 icon: Globe2,
 accent: "from-[#0F766E] via-[#0284C7] to-[#7DD3FC]",
 },
 {
 id: "rust-api-review",
 title: "Can someone improve this Rust backend structure?",
 space: "code-apps",
 author: "Arben Krasniqi",
 time: "1 hr ago",
 type: "Code Structure",
 description:
 "API starter asking for security feedback, endpoint naming, database structure, and performance risks.",
 stack: ["Rust", "Postgres", "API design"],
 notes: "Includes route map, auth questions, schema notes, and AI review output.",
 comments: 31,
 likes: 96,
 saves: 22,
 forks: 7,
 icon: FileCode2,
 accent: "from-[#1E293B] via-[#334155] to-[#38BDF8]",
 },
];

const aiReviewCards = [
 {
 title: "App idea",
 body: "AI can generate feature breakdown, MVP scope, database structure, frontend screens, backend endpoints, risks, and improvements.",
 icon: Layers3,
 },
 {
 title: "Game environment",
 body: "AI can suggest lighting, biome details, asset lists, quest ideas, level design issues, and optimization notes.",
 icon: Gamepad2,
 },
 {
 title: "Code project",
 body: "AI can review architecture, refactors, security notes, performance risks, and implementation tradeoffs.",
 icon: Code2,
 },
];

const remixChain = [
 "Medieval environment",
 "Night lighting fork",
 "NPC village version",
 "Unity asset plan",
];

const reputation = [
 "Project forked",
 "Helpful comment",
 "Prompt reused",
 "Quality feedback",
 "Template published",
 "Project-chain contribution",
];

const marketplaceLater = [
 "Environment packs",
 "Website templates",
 "App starter kits",
 "Prompt packs",
 "Code boilerplates",
 "Premium workflows",
];

function IconTile({
 icon: Icon,
 active = false,
 label,
 onClick,
}: {
 icon: LucideIcon;
 active?: boolean;
 label: string;
 onClick?: () => void;
}) {
 return (
 <button
 type="button"
 aria-label={label}
 onClick={onClick}
 className={`flex h-12 w-12 items-center justify-center rounded-[16px] border transition ${
 active
 ? "border-[#38BDF8] bg-[#38BDF8] text-white shadow-sm"
 : "border-[#DCEAF5] bg-white text-[#64748B] hover:border-[#B7DDF6] hover:text-[#0284C7]"
 }`}
 >
 <Icon className="h-5 w-5" />
 </button>
 );
}

function Stat({ label, value }: { label: string; value: string }) {
 return (
 <div>
 <p className="text-sm font-semibold text-[#0F172A]">{value}</p>
 <p className="mt-0.5 text-[11px] text-[#64748B]">{label}</p>
 </div>
 );
}

export default function CommunityPage() {
 const [activeSpace, setActiveSpace] = useState("all");
 const [activeTab, setActiveTab] = useState("overview");
 const [searchQuery, setSearchQuery] = useState("");
 const [isJoined, setIsJoined] = useState(false);
 const [draft, setDraft] = useState("");
 const [draftType, setDraftType] = useState("Project");
 const [publishedDraft, setPublishedDraft] = useState("");
 const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
 const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
 const [forkedPosts, setForkedPosts] = useState<Record<string, boolean>>({});
 const [commentedPosts, setCommentedPosts] = useState<Record<string, boolean>>({});
 const [notice, setNotice] = useState("Buttons are live in this preview. Data is local mock state.");
 const composerRef = useRef<HTMLTextAreaElement>(null);
 const feedRef = useRef<HTMLDivElement>(null);
 const remixRef = useRef<HTMLDivElement>(null);
 const aiReviewRef = useRef<HTMLElement>(null);

 const allPosts = useMemo(() => {
 if (!publishedDraft) return feedPosts;
 return [
 {
 id: "local-draft",
 title: publishedDraft,
 space: draftType === "Ask feedback" ? "feedback" : draftType === "Fork request" ? "prompts-workflows" : "showcase",
 author: "You",
 time: "just now",
 type: draftType,
 description:
 "Local preview post created from the composer. Connect this action to the backend when community posting is ready.",
 stack: ["Community draft", "AI creation", "Preview"],
 notes: "Draft post includes project title, creation type, and a placeholder for prompt history or generation notes.",
 comments: 0,
 likes: 0,
 saves: 0,
 forks: 0,
 icon: Sparkles,
 accent: "from-[#0284C7] via-[#38BDF8] to-[#BAE6FD]",
 },
 ...feedPosts,
 ];
 }, [draftType, publishedDraft]);

 const filteredPosts = useMemo(() => {
 const query = searchQuery.trim().toLowerCase();
 return allPosts.filter((post) => {
 const matchesSpace = activeSpace === "all" || post.space === activeSpace;
 const matchesQuery =
 !query ||
 post.title.toLowerCase().includes(query) ||
 post.description.toLowerCase().includes(query) ||
 post.stack.some((item) => item.toLowerCase().includes(query)) ||
 post.type.toLowerCase().includes(query);
 return matchesSpace && matchesQuery;
 });
 }, [activeSpace, allPosts, searchQuery]);

 const toggleJoined = () => {
 setIsJoined((current) => !current);
 setNotice(isJoined ? "You left the community preview." : "Joined AI Creation Hub. This is local preview state.");
 };

 const scrollToComposer = () => {
 composerRef.current?.focus();
 composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
 setNotice("Composer opened. Write a creation idea and publish a local preview post.");
 };

 const selectSpace = (space: string) => {
 setActiveSpace(space);
 setActiveTab("posts");
 feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 setNotice(space === "all" ? "Showing all creation posts." : `Filtering feed by #${space}.`);
 };

 const selectTab = (tab: string) => {
 setActiveTab(tab);
 if (tab === "remix") remixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 else if (tab === "ai-review") aiReviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 else feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 };

 const publishDraft = () => {
 const cleanDraft = draft.trim();
 if (!cleanDraft) {
 setNotice("Write a project, prompt workflow, code snippet, app idea, or game environment first.");
 composerRef.current?.focus();
 return;
 }
 setPublishedDraft(cleanDraft);
 setDraft("");
 setActiveSpace("all");
 setActiveTab("posts");
 setNotice("Local creation preview published at the top of the feed.");
 feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
 };

 const toggleAction = (
 postId: string,
 action: "comment" | "like" | "save" | "fork",
 ) => {
 const actionMap = {
 comment: [commentedPosts, setCommentedPosts, "Comment thread opened in preview."] as const,
 like: [likedPosts, setLikedPosts, "Like updated."] as const,
 save: [savedPosts, setSavedPosts, "Save updated."] as const,
 fork: [forkedPosts, setForkedPosts, "Fork/remix preview created."] as const,
 };
 const [, setter, message] = actionMap[action];
 setter((current) => ({ ...current, [postId]: !current[postId] }));
 setNotice(message);
 };

 return (
 <main className="min-h-screen bg-[#EEF3F7] font-roboto text-[#111827]">
 <header className="sticky top-0 z-30 border-b border-[#D8E2EA] bg-white/92 backdrop-blur-xl">
 <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 sm:px-4">
 <Link href="/" className="inline-flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]">
 <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#38BDF8] text-white">
 <Sparkles className="h-4 w-4 fill-current" />
 </span>
 Coreforge
 </Link>
 <label className="hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#EEF3F7] px-4 text-sm text-[#64748B] md:flex">
 <Search className="h-4 w-4" />
 <input
 value={searchQuery}
 onChange={(event) => setSearchQuery(event.target.value)}
 placeholder="Search projects, prompts, code, environments"
 className="min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
 />
 </label>
 <Link href="/main" className="hidden h-9 items-center gap-2 rounded-full border border-[#DCEAF5] bg-white px-4 text-sm font-semibold text-[#0F172A] hover:bg-[#F0F9FF] sm:inline-flex">
 Open Studio
 </Link>
 <button type="button" onClick={scrollToComposer} className="inline-flex h-9 items-center gap-2 rounded-full bg-[#38BDF8] px-4 text-sm font-semibold text-white hover:bg-[#0EA5E9]">
 <Plus className="h-4 w-4" />
 Create
 </button>
 <button type="button" onClick={() => setNotice("No new notifications in this local preview.")} aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DCEAF5] bg-white text-[#64748B] hover:bg-[#F0F9FF]">
 <Bell className="h-4 w-4" />
 </button>
 </div>
 </header>

 <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[72px_230px_minmax(0,1fr)_310px]">
 <aside className="hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
 <IconTile icon={Home} active={activeSpace === "all"} label="Home" onClick={() => selectSpace("all")} />
 <IconTile icon={Sparkles} active={activeSpace === "showcase"} label="AI Community" onClick={() => selectSpace("showcase")} />
 <IconTile icon={Gamepad2} active={activeSpace === "game-environments"} label="Game environments" onClick={() => selectSpace("game-environments")} />
 <IconTile icon={Code2} active={activeSpace === "code-apps"} label="Code and apps" onClick={() => selectSpace("code-apps")} />
 <IconTile icon={Workflow} active={activeSpace === "prompts-workflows"} label="Workflows" onClick={() => selectSpace("prompts-workflows")} />
 <IconTile icon={Plus} label="Create new space" onClick={scrollToComposer} />
 </aside>

 <aside className="hidden overflow-hidden rounded-[20px] border border-[#DCEAF5] bg-[#101114] text-white shadow-sm lg:block">
 <div className="bg-gradient-to-br from-[#7C3AED] via-[#38BDF8] to-[#F0F9FF] p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-semibold">AI Creation Hub</p>
 <p className="mt-1 text-xs text-white/75">Projects, remixes, feedback</p>
 </div>
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>
 <div className="p-3">
 <div className="mb-4 rounded-[14px] bg-white/6 p-3">
 <p className="text-xs font-semibold text-white">Creation loop</p>
 <p className="mt-2 text-[11px] leading-5 text-white/62">
 AI tool to project to preview to publish to feedback to remix.
 </p>
 </div>
 <div className="space-y-1">
 <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">Spaces</p>
 {spaces.map(({ name, label, count, icon: Icon }) => (
 <button
 key={name}
 type="button"
 onClick={() => selectSpace(name)}
 className={`group flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-sm transition ${
 activeSpace === name ? "bg-white/12 text-white" : "text-white/72 hover:bg-white/8 hover:text-white"
 }`}
 >
 <Icon className={`h-4 w-4 ${activeSpace === name ? "text-[#7DD3FC]" : "text-white/35 group-hover:text-[#7DD3FC]"}`} />
 <span className="min-w-0 flex-1 truncate">{label}</span>
 <span className="text-[10px] text-white/35">{count.split(" ")[0]}</span>
 </button>
 ))}
 </div>
 </div>
 </aside>

 <section className="min-w-0">
 <div className="overflow-hidden rounded-[20px] border border-[#DCEAF5] bg-white shadow-sm">
 <div className="h-28 bg-gradient-to-br from-[#111827] via-[#1D4ED8] to-[#38BDF8]" />
 <div className="px-5 pb-5">
 <div className="-mt-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex items-end gap-4">
 <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border-4 border-white bg-[#38BDF8] text-white shadow-sm">
 <Wand2 className="h-9 w-9" />
 </div>
 <div className="pb-1">
 <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#0F172A]">AI Community</h1>
 <p className="mt-1 text-sm text-[#64748B]">Creation-first space for AI projects, prompts, code, worlds, and remixes.</p>
 </div>
 </div>
 <div className="flex gap-2">
 <button type="button" onClick={() => selectTab("posts")} className="h-10 rounded-full border border-[#DCEAF5] bg-white px-4 text-sm font-semibold text-[#0F172A] hover:bg-[#F0F9FF]">
 Explore
 </button>
 <button type="button" onClick={toggleJoined} className={`h-10 rounded-full px-4 text-sm font-semibold transition ${isJoined ? "bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]" : "bg-[#38BDF8] text-white hover:bg-[#0EA5E9]"}`}>
 {isJoined ? "Joined" : "Join"}
 </button>
 </div>
 </div>
 <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEF3F7] pt-4 sm:grid-cols-4">
 <Stat label="Projects" value="920" />
 <Stat label="Forks" value="310" />
 <Stat label="Reviews" value="1.8k" />
 <Stat label="Workflows" value="246" />
 </div>
 <div className="mt-5 flex flex-wrap gap-6 border-t border-[#EEF3F7] pt-4 text-sm font-semibold text-[#64748B]">
 {[
 ["overview", "Overview"],
 ["posts", "Posts"],
 ["remix", "Remix chains"],
 ["ai-review", "AI Review"],
 ].map(([key, label]) => (
 <button key={key} type="button" onClick={() => selectTab(key)} className={activeTab === key ? "text-[#0284C7]" : "hover:text-[#0284C7]"}>
 {label}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="mt-4 rounded-[18px] border border-[#DCEAF5] bg-white p-4 shadow-sm">
 <div className="flex gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-sm font-semibold text-[#0369A1]">AL</div>
 <textarea
 ref={composerRef}
 value={draft}
 onChange={(event) => setDraft(event.target.value)}
 rows={2}
 placeholder="Share a project, prompt workflow, code snippet, app idea, or game environment"
 className="min-h-10 flex-1 resize-none rounded-[18px] border border-[#DCEAF5] bg-[#F8FCFF] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#38BDF8] focus:bg-white"
 />
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2 pl-0 sm:pl-[52px]">
 {["Project", "Preview", "Prompt history", "Ask feedback", "Fork request"].map((item) => (
 <button
 key={item}
 type="button"
 onClick={() => setDraftType(item)}
 className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
 draftType === item ? "border-[#38BDF8] bg-[#E0F2FE] text-[#0369A1]" : "border-[#DCEAF5] bg-white text-[#475569] hover:bg-[#F0F9FF]"
 }`}
 >
 {item}
 </button>
 ))}
 <button type="button" onClick={publishDraft} className="ml-auto rounded-full bg-[#38BDF8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0EA5E9]">
 Publish preview
 </button>
 </div>
 <p className="mt-3 pl-0 text-xs text-[#64748B] sm:pl-[52px]">{notice}</p>
 </div>

 <div id="feed" ref={feedRef} className="mt-4 space-y-4 scroll-mt-20">
 {filteredPosts.length === 0 && (
 <div className="rounded-[18px] border border-[#DCEAF5] bg-white p-6 text-sm text-[#64748B] shadow-sm">
 No creation posts match this filter yet.
 </div>
 )}
 {filteredPosts.map(({ id, title, space, author, time, type, description, stack, notes, comments, likes, saves, forks, icon: Icon, accent }) => (
 <article key={title} className="overflow-hidden rounded-[18px] border border-[#DCEAF5] bg-white shadow-sm">
 <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
 <div className={`flex min-h-[190px] items-center justify-center bg-gradient-to-br ${accent} p-5 text-white`}>
 <div className="text-center">
 <Icon className="mx-auto h-10 w-10" />
 <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/75">{type}</p>
 </div>
 </div>
 <div className="p-5">
 <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
 <span className="font-semibold text-[#0284C7]">#{space}</span>
 <span>Posted by {author}</span>
 <span>{time}</span>
 </div>
 <h2 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-[#0F172A]">{title}</h2>
 <p className="mt-3 text-sm leading-6 text-[#475569]">{description}</p>
 <div className="mt-4 flex flex-wrap gap-2">
 {stack.map((item) => (
 <span key={item} className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#475569]">
 {item}
 </span>
 ))}
 </div>
 <div className="mt-4 rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-3 text-xs leading-5 text-[#64748B]">
 <span className="font-semibold text-[#0F172A]">Generation notes:</span> {notes}
 </div>
 <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#64748B]">
 <button
 type="button"
 onClick={() => toggleAction(id, "comment")}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${commentedPosts[id] ? "bg-[#E0F2FE] text-[#0369A1]" : "bg-[#F1F5F9] hover:bg-[#E0F2FE] hover:text-[#0369A1]"}`}
 >
 <MessageCircle className="h-3.5 w-3.5" />
 {comments + (commentedPosts[id] ? 1 : 0)}
 </button>
 <button
 type="button"
 onClick={() => toggleAction(id, "like")}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${likedPosts[id] ? "bg-[#E0F2FE] text-[#0369A1]" : "bg-[#F1F5F9] hover:bg-[#E0F2FE] hover:text-[#0369A1]"}`}
 >
 <ThumbsUp className="h-3.5 w-3.5" />
 {likes + (likedPosts[id] ? 1 : 0)}
 </button>
 <button
 type="button"
 onClick={() => toggleAction(id, "save")}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${savedPosts[id] ? "bg-[#E0F2FE] text-[#0369A1]" : "bg-[#F1F5F9] hover:bg-[#E0F2FE] hover:text-[#0369A1]"}`}
 >
 <Bookmark className="h-3.5 w-3.5" />
 {saves + (savedPosts[id] ? 1 : 0)}
 </button>
 <button
 type="button"
 onClick={() => toggleAction(id, "fork")}
 className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${forkedPosts[id] ? "bg-[#0EA5E9] text-white" : "bg-[#38BDF8] text-white hover:bg-[#0EA5E9]"}`}
 >
 <GitFork className="h-3.5 w-3.5" />
 {forkedPosts[id] ? "Forked" : "Fork"} {forks + (forkedPosts[id] ? 1 : 0)}
 </button>
 </div>
 </div>
 </div>
 </article>
 ))}
 </div>

 <div id="remix" ref={remixRef} className="mt-4 scroll-mt-20 rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-semibold text-[#0284C7]">Remix / Fork system</p>
 <h2 className="mt-2 text-xl font-semibold text-[#0F172A]">Every useful creation can become a project chain.</h2>
 </div>
 <GitFork className="hidden h-6 w-6 text-[#0284C7] sm:block" />
 </div>
 <div className="mt-5 grid gap-3 sm:grid-cols-4">
 {remixChain.map((item, index) => (
 <div key={item} className="rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-4">
 <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#38BDF8] text-xs font-semibold text-white">{index + 1}</span>
 <p className="mt-4 text-sm font-semibold text-[#0F172A]">{item}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <aside className="space-y-4 lg:sticky lg:top-[72px] lg:self-start">
 <section className="rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-base font-semibold text-[#0F172A]">AI Creation Hub</h2>
 <p className="mt-1 text-xs text-[#64748B]">u/ai_creation_hub</p>
 </div>
 <button type="button" onClick={() => setNotice("Community options are a preview menu placeholder.")} aria-label="Community options" className="rounded-full p-2 text-[#64748B] hover:bg-[#F1F5F9]">
 <ChevronDown className="h-4 w-4" />
 </button>
 </div>
 <div className="mt-5 grid grid-cols-3 gap-3 border-y border-[#EEF3F7] py-4">
 <Stat label="Members" value="3,868" />
 <Stat label="Online" value="355" />
 <Stat label="Created" value="2026" />
 </div>
 <button type="button" onClick={toggleJoined} className={`mt-4 h-10 w-full rounded-full text-sm font-semibold transition ${isJoined ? "bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]" : "bg-[#38BDF8] text-white hover:bg-[#0EA5E9]"}`}>
 {isJoined ? "Joined Community" : "Join Community"}
 </button>
 </section>

 <section id="ai-review" ref={aiReviewRef} className="scroll-mt-20 rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">AI inside projects</h2>
 <div className="mt-4 space-y-3">
 {aiReviewCards.map(({ title, body, icon: Icon }) => (
 <div key={title} className="rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-3">
 <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
 <Icon className="h-4 w-4 text-[#0284C7]" />
 {title}
 </div>
 <p className="mt-2 text-xs leading-5 text-[#64748B]">{body}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">Reputation</h2>
 <div className="mt-4 space-y-2">
 {reputation.map((item) => (
 <div key={item} className="flex items-center gap-2 rounded-[12px] bg-[#F8FCFF] px-3 py-2 text-xs font-semibold text-[#475569]">
 <Star className="h-3.5 w-3.5 text-[#0284C7]" />
 {item}
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">Marketplace later</h2>
 <div className="mt-4 flex flex-wrap gap-2">
 {marketplaceLater.map((item) => (
 <span key={item} className="rounded-full bg-[#F0F9FF] px-3 py-1 text-xs font-semibold text-[#0369A1]">
 {item}
 </span>
 ))}
 </div>
 </section>
 </aside>
 </div>
 </main>
 );
}
