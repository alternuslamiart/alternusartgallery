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
 Moon,
 MessageCircle,
 MessageSquareText,
 Plus,
 Search,
 Sparkles,
 Star,
 Sun,
 ThumbsUp,
 Wand2,
 Workflow,
} from "lucide-react";

const languages = [
 { code: "en", label: "English" },
 { code: "de", label: "German" },
 { code: "fr", label: "French" },
 { code: "it", label: "Italian" },
 { code: "zh", label: "Chinese" },
 { code: "ja", label: "Japanese" },
 { code: "ar", label: "Arabic" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

const translations: Record<LanguageCode, Record<string, string>> = {
 en: {
  community: "Architecture Community", description: "A focused space for architecture, homes, interiors, infrastructure, and design studies.",
  explore: "Explore", join: "Join", joined: "Joined", projects: "Projects", forks: "Forks", reviews: "Reviews", workflows: "Workflows",
  overview: "Overview", posts: "Posts", remix: "Remix chains", aiReview: "AI Review", spaces: "Spaces", creationLoop: "Creation loop",
  concept: "Concept to model to visualize to present to refine.", publish: "Publish preview", notes: "Generation notes:",
  share: "Share an architecture concept, house model, interior design, or infrastructure plan", architecture: "Architecture",
  house: "House Modeling", interior: "Interior Design", infrastructure: "Infrastructure", joinCommunity: "Join Community",
  aiInside: "AI inside projects", reputation: "Reputation", marketplace: "Marketplace later",
 },
 de: {
  community: "Architektur-Community", description: "Ein fokussierter Raum für Architektur, Häuser, Innenräume, Infrastruktur und Designstudien.",
  explore: "Entdecken", join: "Beitreten", joined: "Beigetreten", projects: "Projekte", forks: "Forks", reviews: "Bewertungen", workflows: "Workflows",
  overview: "Übersicht", posts: "Beiträge", remix: "Remix-Ketten", aiReview: "KI-Review", spaces: "Bereiche", creationLoop: "Erstellungsprozess",
  concept: "Vom Konzept zum Modell, zur Visualisierung und zur Verfeinerung.", publish: "Vorschau veröffentlichen", notes: "Generierungsnotizen:",
  share: "Teile ein Architekturkonzept, Hausmodell, Interior-Design oder Infrastrukturprojekt", architecture: "Architektur",
  house: "Hausmodellierung", interior: "Innenarchitektur", infrastructure: "Infrastruktur", joinCommunity: "Community beitreten",
  aiInside: "KI in Projekten", reputation: "Reputation", marketplace: "Marktplatz später",
 },
 fr: {
  community: "Communauté d’architecture", description: "Un espace dédié à l’architecture, aux maisons, aux intérieurs, aux infrastructures et aux études de design.",
  explore: "Explorer", join: "Rejoindre", joined: "Membre", projects: "Projets", forks: "Forks", reviews: "Avis", workflows: "Workflows",
  overview: "Aperçu", posts: "Publications", remix: "Chaînes de remix", aiReview: "Avis IA", spaces: "Espaces", creationLoop: "Processus de création",
  concept: "Du concept au modèle, à la visualisation et au perfectionnement.", publish: "Publier l’aperçu", notes: "Notes de génération :",
  share: "Partagez un concept architectural, un modèle de maison, un intérieur ou un plan d’infrastructure", architecture: "Architecture",
  house: "Modélisation de maison", interior: "Design intérieur", infrastructure: "Infrastructure", joinCommunity: "Rejoindre la communauté",
  aiInside: "IA dans les projets", reputation: "Réputation", marketplace: "Marketplace bientôt",
 },
 it: {
  community: "Community di architettura", description: "Uno spazio dedicato ad architettura, case, interni, infrastrutture e studi di design.",
  explore: "Esplora", join: "Unisciti", joined: "Iscritto", projects: "Progetti", forks: "Fork", reviews: "Recensioni", workflows: "Workflow",
  overview: "Panoramica", posts: "Post", remix: "Catene remix", aiReview: "Revisione IA", spaces: "Spazi", creationLoop: "Processo creativo",
  concept: "Dal concept al modello, alla visualizzazione e al perfezionamento.", publish: "Pubblica anteprima", notes: "Note di generazione:",
  share: "Condividi un concept architettonico, un modello di casa, un interior design o un piano infrastrutturale", architecture: "Architettura",
  house: "Modellazione case", interior: "Interior design", infrastructure: "Infrastrutture", joinCommunity: "Unisciti alla community",
  aiInside: "IA nei progetti", reputation: "Reputazione", marketplace: "Marketplace in arrivo",
 },
 zh: {
  community: "建筑社区", description: "专注于建筑、住宅、室内设计、基础设施和设计研究的空间。",
  explore: "探索", join: "加入", joined: "已加入", projects: "项目", forks: "分支", reviews: "评价", workflows: "工作流",
  overview: "概览", posts: "帖子", remix: "创作链", aiReview: "AI 评审", spaces: "空间", creationLoop: "创作流程",
  concept: "从概念到模型，再到可视化、展示和完善。", publish: "发布预览", notes: "生成说明：",
  share: "分享建筑概念、住宅模型、室内设计或基础设施方案", architecture: "建筑", house: "住宅建模", interior: "室内设计", infrastructure: "基础设施",
  joinCommunity: "加入社区", aiInside: "项目中的 AI", reputation: "声誉", marketplace: "市场即将推出",
 },
 ja: {
  community: "建築コミュニティ", description: "建築、住宅、インテリア、インフラ、デザイン研究のためのスペースです。",
  explore: "探索", join: "参加", joined: "参加済み", projects: "プロジェクト", forks: "フォーク", reviews: "レビュー", workflows: "ワークフロー",
  overview: "概要", posts: "投稿", remix: "リミックスチェーン", aiReview: "AIレビュー", spaces: "スペース", creationLoop: "制作の流れ",
  concept: "コンセプトからモデル、可視化、発表、改善まで。", publish: "プレビューを公開", notes: "生成ノート：",
  share: "建築コンセプト、住宅モデル、インテリア、インフラ計画を共有", architecture: "建築", house: "住宅モデリング", interior: "インテリアデザイン", infrastructure: "インフラ",
  joinCommunity: "コミュニティに参加", aiInside: "プロジェクトの AI", reputation: "評価", marketplace: "マーケットプレイス準備中",
 },
 ar: {
  community: "مجتمع الهندسة المعمارية", description: "مساحة متخصصة للهندسة المعمارية والمنازل والتصميم الداخلي والبنية التحتية ودراسات التصميم.",
  explore: "استكشف", join: "انضمام", joined: "منضم", projects: "مشاريع", forks: "تفرعات", reviews: "مراجعات", workflows: "سير العمل",
  overview: "نظرة عامة", posts: "منشورات", remix: "سلاسل إعادة المزج", aiReview: "مراجعة الذكاء الاصطناعي", spaces: "المساحات", creationLoop: "دورة الإنشاء",
  concept: "من الفكرة إلى النموذج والتصور والعرض والتحسين.", publish: "نشر المعاينة", notes: "ملاحظات التوليد:",
  share: "شارك فكرة معمارية أو نموذج منزل أو تصميم داخلي أو خطة بنية تحتية", architecture: "الهندسة المعمارية", house: "نمذجة المنازل", interior: "التصميم الداخلي", infrastructure: "البنية التحتية",
  joinCommunity: "انضم إلى المجتمع", aiInside: "الذكاء الاصطناعي في المشاريع", reputation: "السمعة", marketplace: "السوق قريباً",
 },
};

const spaces = [
 { name: "architecture", label: "Architecture", count: "320 projects", icon: Layers3 },
 { name: "house-modeling", label: "House Modeling", count: "118 models", icon: Home },
 { name: "interior-design", label: "Interior Design", count: "246 designs", icon: Wand2 },
 { name: "infrastructure", label: "Infrastructure", count: "174 plans", icon: Workflow },
];

const feedPosts = [
 {
 id: "modern-house",
 title: "Modern house concept with architectural modeling",
 space: "architecture",
 author: "Dren Gashi",
 time: "18 min ago",
 type: "Architecture",
 description:
 "A contemporary residential concept with clean volumes, natural lighting, floor planning, facade studies, and material exploration.",
 stack: ["Floor plan", "3D modeling", "Facade study"],
 notes: "Includes site orientation, room program, facade references, and a first-pass architectural visualization.",
 comments: 18,
 likes: 142,
 saves: 36,
 forks: 11,
 icon: Layers3,
 image: "/Section/architectresectionone.png",
 accent: "from-[#312E81] via-[#6D28D9] to-[#38BDF8]",
 },
 {
 id: "warm-interior",
 title: "Warm interior design for a compact living space",
 space: "interior-design",
 author: "Elira Morina",
 time: "42 min ago",
 type: "Interior Design",
 description:
 "Looking for feedback on furniture layout, lighting layers, textures, color balance, and the relationship between living and dining areas.",
 stack: ["Space planning", "Materials", "Lighting"],
 notes: "Design notes include mood references, furniture dimensions, lighting zones, and a balanced neutral palette.",
 comments: 24,
 likes: 210,
 saves: 58,
 forks: 19,
 icon: Wand2,
 image: "/Section/Planarch.png",
 accent: "from-[#0F766E] via-[#0284C7] to-[#7DD3FC]",
 },
 {
 id: "urban-infrastructure",
 title: "Infrastructure plan for a growing urban district",
 space: "infrastructure",
 author: "Arben Krasniqi",
 time: "1 hr ago",
 type: "Infrastructure",
 description:
 "A coordinated plan for roads, pedestrian routes, public space, utilities, drainage, and future development phases.",
 stack: ["Site planning", "Road network", "Utilities"],
 notes: "Includes zoning assumptions, circulation studies, infrastructure phases, and key site constraints.",
 comments: 31,
 likes: 96,
 saves: 22,
 forks: 7,
 icon: Workflow,
 image: "/Section/Infra.png",
 accent: "from-[#1E293B] via-[#334155] to-[#38BDF8]",
 },
];

const aiReviewCards = [
 {
title: "Architecture",
body: "AI can help develop concepts, floor plans, facade directions, material palettes, site responses, and presentation-ready design notes.",
 icon: Layers3,
 },
 {
title: "House modeling",
body: "AI can suggest room programs, massing studies, furniture layouts, elevations, dimensions, and modeling workflows.",
icon: Home,
 },
 {
title: "Interior & infrastructure",
body: "AI can review lighting, materials, circulation, utilities, roads, public space, and development tradeoffs.",
icon: Workflow,
 },
];

const remixChain = [
 "House concept",
 "Facade variation",
 "Interior layout study",
 "Infrastructure context plan",
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
 "Architecture templates",
 "House model libraries",
 "Interior material boards",
 "Infrastructure plans",
 "CAD block collections",
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
 const [isDark, setIsDark] = useState(false);
 const [language, setLanguage] = useState<LanguageCode>("en");
 const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
 const t = (key: string) => translations[language][key] ?? translations.en[key] ?? key;
 const spaceLabel = (name: string) =>
  name === "architecture" ? t("architecture") :
  name === "house-modeling" ? t("house") :
  name === "interior-design" ? t("interior") : t("infrastructure");
 const [activeSpace, setActiveSpace] = useState("all");
 const [activeTab, setActiveTab] = useState("overview");
 const [searchQuery, setSearchQuery] = useState("");
 const [isJoined, setIsJoined] = useState(false);
 const [draft, setDraft] = useState("");
 const [draftType, setDraftType] = useState("Architecture");
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
 space: draftType === "Interior Design"
 ? "interior-design"
 : draftType === "Infrastructure"
 ? "infrastructure"
 : draftType === "House Modeling"
 ? "house-modeling"
 : "architecture",
 author: "You",
 time: "just now",
 type: draftType,
 description:
 "Local preview post created from the composer. Connect this action to the backend when community posting is ready.",
 stack: ["Community draft", "Design study", "Preview"],
 notes: "Draft post includes the design category, project title, modeling notes, and a placeholder for project development details.",
 comments: 0,
 likes: 0,
 saves: 0,
 forks: 0,
 icon: Sparkles,
 image: undefined,
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
 setNotice(isJoined ? "You left the design community preview." : "Joined Architecture & Design Community. This is local preview state.");
 };

 const scrollToComposer = () => {
 composerRef.current?.focus();
 composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
 setNotice("Composer opened. Share an architecture, house modeling, interior, or infrastructure idea.");
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
 setNotice("Write an architecture, house modeling, interior design, or infrastructure idea first.");
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
 <main dir={language === "ar" ? "rtl" : "ltr"} className={`community-page w-full min-h-screen font-roboto ${isDark ? "community-dark" : "community-light"}`}>
 <style>{`
   .community-page { width:100vw; max-width:none; min-height:100vh; margin:0; background:#f3f6f8; color:#111827; }
   .community-page .community-soft { background:#F8FCFF; border-color:#DCEAF5; color:#475569; }
   .community-page.community-dark { background:#111315; color:#f4f7fa; }
   .community-page.community-dark header { background:rgba(17,19,21,.92); border-color:#2a3035; }
   .community-page.community-dark .community-surface { background:#1a1d20; border-color:#30363d; color:#f4f7fa; }
   .community-page.community-dark .community-soft { background:#22272b; border-color:#343b42; color:#dce3e9; }
   .community-page.community-dark .community-muted { color:#98a5b2; }
   .community-page.community-dark .community-border { border-color:#30363d; }
   .community-page.community-dark h1,.community-page.community-dark h2,.community-page.community-dark h3 { color:#f4f7fa; }
   .community-page.community-dark p,.community-page.community-dark label { color:#aab6c1; }
   .community-page.community-dark .bg-white { background:#1a1d20; }
   .community-page.community-dark .border-[#DCEAF5],.community-page.community-dark .border-[#EEF3F7] { border-color:#30363d; }
   .community-page.community-dark .text-[#0F172A],.community-page.community-dark .text-[#111827] { color:#f4f7fa; }
   .community-page.community-dark .text-[#64748B],.community-page.community-dark .text-[#475569] { color:#98a5b2; }
   .community-page.community-dark input, .community-page.community-dark textarea { background:#1d2125; border-color:#343b42; color:#f4f7fa; }
   .community-page.community-dark .community-nav { color:#c6d0d9; }
   .community-page .community-hub-nav { color:#0F172A; }
   .community-page .community-hub-nav .hub-muted { color:#64748B; }
   .community-page .community-hub-nav .hub-label { color:#475569; }
   .community-page .community-hub-nav .hub-count { color:#94A3B8; }
   .community-page .community-hub-nav .hub-item:hover { background:#F1F5F9; color:#0F172A; }
   .community-page .community-hub-nav .hub-item.is-active { background:#E0F2FE; color:#0369A1; }
   .community-page.community-dark .community-hub-nav { color:#F4F7FA; }
   .community-page.community-dark .community-hub-nav .hub-muted { color:#AAB6C1; }
   .community-page.community-dark .community-hub-nav .hub-label { color:#DCE3E9; }
   .community-page.community-dark .community-hub-nav .hub-count { color:#98A5B2; }
   .community-page.community-dark .community-hub-nav .hub-item:hover { background:#22272B; color:#F4F7FA; }
   .community-page.community-dark .community-hub-nav .hub-item.is-active { background:#263B4A; color:#7DD3FC; }
   @media (min-width:1024px) {
     .community-page { height:100vh; overflow:hidden; }
     .community-page > header { position:fixed; top:0; right:0; left:0; }
     .community-page > div {
       height:calc(100vh - 56px);
       margin-top:56px;
       align-items:start;
       overflow:hidden;
     }
     .community-page > div > aside { position:sticky; top:0; max-height:calc(100vh - 72px); }
     .community-page > div > section {
       height:100%;
       min-height:0;
       overflow-y:auto;
       overscroll-behavior:contain;
       scrollbar-width:thin;
     }
     .community-page > div > section::-webkit-scrollbar { width:8px; }
     .community-page > div > section::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:999px; }
     .community-page.community-dark > div > section::-webkit-scrollbar-thumb { background:#46515B; }
   }
   @media (max-width:1023px) {
     .community-page > header { display:none; }
     .community-page > div { display:block; max-width:640px; margin:0 auto; padding:16px; }
     .community-page > div > aside { display:none; }
     .community-page > div > section { width:100%; }
     .community-page > div > section > .community-surface:first-child { margin-top:0; }
   }
 `}</style>
 <header className="sticky top-0 z-30 w-full border-b border-[#D8E2EA] bg-white/92 backdrop-blur-xl">
 <div className="relative mx-auto grid h-14 w-full max-w-[1180px] grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-3 sm:px-4">
 <Link href="/" className="inline-flex items-center gap-2 rounded-[12px] px-2 py-1.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]">
 <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#38BDF8] text-white">
 <Sparkles className="h-4 w-4 fill-current" />
 </span>
 Crystal Studio
 </Link>
 <label className="hidden h-9 min-w-0 max-w-[430px] items-center gap-2 rounded-full bg-[#EEF3F7] px-4 text-sm text-[#64748B] md:flex">
 <Search className="h-4 w-4" />
 <input
 value={searchQuery}
 onChange={(event) => setSearchQuery(event.target.value)}
 placeholder="Search projects, prompts, code, environments"
 className="min-w-0 flex-1 bg-transparent text-sm text-[#0F172A] outline-none placeholder:text-[#64748B]"
 />
 </label>
 <div className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-2">
 <button type="button" onClick={() => setIsDark((value) => !value)} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={isDark} className="community-nav inline-flex h-9 items-center gap-2 rounded-full border border-[#DCEAF5] bg-white px-3 text-xs font-semibold shadow-sm transition hover:bg-[#F0F9FF]">
 {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDark ? "Light" : "Dark"}
 </button>
 </div>
 <div className="flex items-center justify-end gap-2">
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
 <div className="relative">
  <button type="button" onClick={() => setLanguageMenuOpen((value) => !value)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#DCEAF5] bg-white px-3 text-xs font-semibold text-[#0F172A] shadow-sm">
   <Globe2 className="h-4 w-4" /> {languages.find((item) => item.code === language)?.label}
  </button>
  {languageMenuOpen && (
   <div className="absolute right-0 top-11 z-40 w-36 rounded-[14px] border border-[#DCEAF5] bg-white p-1.5 shadow-xl">
    {languages.map((item) => (
     <button key={item.code} type="button" onClick={() => { setLanguage(item.code); setLanguageMenuOpen(false); }} className={`block w-full rounded-[9px] px-3 py-2 text-left text-xs font-semibold ${language === item.code ? "bg-[#E0F2FE] text-[#0369A1]" : "text-[#475569] hover:bg-[#F1F5F9]"}`}>
      {item.label}
     </button>
    ))}
   </div>
  )}
 </div>
 </div>
 </div>
 </header>

 <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-4 px-3 py-5 sm:px-4 lg:grid-cols-[56px_200px_minmax(0,1fr)_240px] lg:justify-center">
 <aside className="hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
 <IconTile icon={Home} active={activeSpace === "all"} label="Home" onClick={() => selectSpace("all")} />
 <IconTile icon={Layers3} active={activeSpace === "architecture"} label="Architecture" onClick={() => selectSpace("architecture")} />
 <IconTile icon={Home} active={activeSpace === "house-modeling"} label="House modeling" onClick={() => selectSpace("house-modeling")} />
 <IconTile icon={Wand2} active={activeSpace === "interior-design"} label="Interior design" onClick={() => selectSpace("interior-design")} />
 <IconTile icon={Workflow} active={activeSpace === "infrastructure"} label="Infrastructure" onClick={() => selectSpace("infrastructure")} />
 <IconTile icon={Plus} label="Create new space" onClick={scrollToComposer} />
 </aside>

 <aside className="community-surface community-hub-nav hidden overflow-hidden rounded-[20px] border border-[#DCEAF5] bg-white shadow-sm lg:block">
 <div className="bg-gradient-to-br from-[#7C3AED] via-[#38BDF8] to-[#F0F9FF] p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-semibold">{t("community")}</p>
 <p className="hub-muted mt-1 text-xs text-white/75">Homes, interiors, infrastructure</p>
 </div>
 <ChevronDown className="h-4 w-4" />
 </div>
 </div>
 <div className="p-3">
 <div className="community-soft mb-4 rounded-[14px] p-3">
 <p className="text-xs font-semibold">{t("creationLoop")}</p>
 <p className="hub-muted mt-2 text-[11px] leading-5 text-white/62">
 {t("concept")}
 </p>
 </div>
 <div className="space-y-1">
 <p className="hub-muted mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">{t("spaces")}</p>
 {spaces.map(({ name, label, count, icon: Icon }) => (
 <button
 key={name}
 type="button"
 onClick={() => selectSpace(name)}
 className={`hub-item group flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-sm transition ${
 activeSpace === name ? "is-active" : "hub-label"
 }`}
 >
 <Icon className={`h-4 w-4 ${activeSpace === name ? "text-[#0284C7]" : "text-[#94A3B8] group-hover:text-[#0284C7]"}`} />
 <span className="min-w-0 flex-1 truncate">{spaceLabel(name)}</span>
 <span className="hub-count text-[10px] text-white/35">{count.split(" ")[0]}</span>
 </button>
 ))}
 </div>
 </div>
 </aside>

 <section className="min-w-0">
 <div className="community-surface overflow-hidden rounded-[20px] border border-[#DCEAF5] bg-white shadow-sm">
 <div className="h-28 bg-gradient-to-br from-[#111827] via-[#1D4ED8] to-[#38BDF8]" />
 <div className="px-5 pb-5">
 <div className="-mt-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex items-end gap-4">
 <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border-4 border-white bg-[#38BDF8] text-white shadow-sm">
 <Wand2 className="h-9 w-9" />
 </div>
 <div className="pb-1">
 <h1 className="text-2xl font-semibold tracking-[-0.01em] text-[#0F172A]">{t("community")}</h1>
 <p className="mt-1 text-sm text-[#64748B]">{t("description")}</p>
 </div>
 </div>
 <div className="flex gap-2">
 <button type="button" onClick={() => selectTab("posts")} className="h-10 rounded-full border border-[#DCEAF5] bg-white px-4 text-sm font-semibold text-[#0F172A] hover:bg-[#F0F9FF]">
 {t("explore")}
 </button>
 <button type="button" onClick={toggleJoined} className={`h-10 rounded-full px-4 text-sm font-semibold transition ${isJoined ? "bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD]" : "bg-[#38BDF8] text-white hover:bg-[#0EA5E9]"}`}>
 {isJoined ? t("joined") : t("join")}
 </button>
 </div>
 </div>
 <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EEF3F7] pt-4 sm:grid-cols-4">
 <Stat label={t("projects")} value="920" />
 <Stat label={t("forks")} value="310" />
 <Stat label={t("reviews")} value="1.8k" />
 <Stat label={t("workflows")} value="246" />
 </div>
 <div className="mt-5 flex flex-wrap gap-6 border-t border-[#EEF3F7] pt-4 text-sm font-semibold text-[#64748B]">
 {[
 ["overview", t("overview")],
 ["posts", t("posts")],
 ["remix", t("remix")],
 ["ai-review", t("aiReview")],
 ].map(([key, label]) => (
 <button key={key} type="button" onClick={() => selectTab(key)} className={activeTab === key ? "text-[#0284C7]" : "hover:text-[#0284C7]"}>
 {label}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="community-surface mt-4 rounded-[18px] border border-[#DCEAF5] bg-white p-4 shadow-sm">
 <div className="flex gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-sm font-semibold text-[#0369A1]">AL</div>
 <textarea
 ref={composerRef}
 value={draft}
 onChange={(event) => setDraft(event.target.value)}
 rows={2}
 placeholder={t("share")}
 className="min-h-10 flex-1 resize-none rounded-[18px] border border-[#DCEAF5] bg-[#F8FCFF] px-4 py-3 text-sm text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#38BDF8] focus:bg-white"
 />
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2 pl-0 sm:pl-[52px]">
 {[["Architecture", "architecture"], ["House Modeling", "house"], ["Interior Design", "interior"], ["Infrastructure", "infrastructure"]].map(([item, key]) => (
 <button
 key={item}
 type="button"
 onClick={() => setDraftType(item)}
 className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
 draftType === item ? "border-[#38BDF8] bg-[#E0F2FE] text-[#0369A1]" : "border-[#DCEAF5] bg-white text-[#475569] hover:bg-[#F0F9FF]"
 }`}
 >
 {t(key)}
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
 {filteredPosts.map(({ id, title, space, author, time, type, description, stack, notes, comments, likes, saves, forks, icon: Icon, image, accent }) => (
 <article key={title} className="community-surface overflow-hidden rounded-[18px] border border-[#DCEAF5] bg-white shadow-sm">
 <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
 <div className={`relative flex min-h-[190px] items-center justify-center overflow-hidden bg-gradient-to-br ${accent} p-5 text-white`}>
 <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
 <div className="absolute inset-0 bg-black/25" />
 <div className="relative z-10 text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]">
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
 <span className="font-semibold text-[#0F172A]">{t("notes")}</span> {notes}
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

 <div id="remix" ref={remixRef} className="community-surface mt-4 scroll-mt-20 rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm font-semibold text-[#0284C7]">Remix / Fork system</p>
 <h2 className="mt-2 text-xl font-semibold text-[#0F172A]">Every design can become a refined project chain.</h2>
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

 <aside className="hidden space-y-4 lg:sticky lg:top-[72px] lg:block lg:self-start">
 <section className="community-surface rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-base font-semibold text-[#0F172A]">{t("community")}</h2>
 <p className="mt-1 text-xs text-[#64748B]">u/architecture_community</p>
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
 {isJoined ? t("joined") : t("joinCommunity")}
 </button>
 </section>

 <section id="ai-review" ref={aiReviewRef} className="community-surface scroll-mt-20 rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">{t("aiInside")}</h2>
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

 <section className="community-surface rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">{t("reputation")}</h2>
 <div className="mt-4 space-y-2">
 {reputation.map((item) => (
 <div key={item} className="flex items-center gap-2 rounded-[12px] bg-[#F8FCFF] px-3 py-2 text-xs font-semibold text-[#475569]">
 <Star className="h-3.5 w-3.5 text-[#0284C7]" />
 {item}
 </div>
 ))}
 </div>
 </section>

 <section className="community-surface rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748B]">{t("marketplace")}</h2>
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
