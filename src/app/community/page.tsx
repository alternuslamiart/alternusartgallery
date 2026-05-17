import type { Metadata } from "next";
import Link from "next/link";
import {
 ArrowRight,
 BadgeCheck,
 Bot,
 Code2,
 FileCode2,
 Gamepad2,
 GitFork,
 Globe2,
 History,
 Layers3,
 MessageSquareText,
 Rocket,
 Sparkles,
 Store,
 ThumbsUp,
 Wand2,
 Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
 title: "AI Community",
 description:
 "A creation-first AI community for publishing projects, sharing workflows, collecting feedback, and remixing practical AI work.",
};

const spaces = [
 {
 title: "Showcase",
 description: "Publish finished creations: websites, app concepts, game scenes, prompt workflows, and asset packs.",
 activity: "320 creations",
 icon: Sparkles,
 },
 {
 title: "Feedback",
 description: "Ask for useful critique on UI, code structure, environment design, prompts, and product direction.",
 activity: "118 active reviews",
 icon: MessageSquareText,
 },
 {
 title: "Prompts & Workflows",
 description: "Share repeatable AI processes for research, content, automation, coding, and daily work.",
 activity: "246 workflows",
 icon: Workflow,
 },
 {
 title: "Code & Apps",
 description: "Discuss AI-assisted apps, agents, backend structure, debugging, architecture, and implementation.",
 activity: "174 projects",
 icon: Code2,
 },
 {
 title: "Game Environments",
 description: "Post maps, worlds, scenes, asset plans, biomes, lighting studies, and level design experiments.",
 activity: "89 worlds",
 icon: Gamepad2,
 },
];

const creations = [
 {
 title: "Cyberpunk City Environment",
 type: "Game Environment",
 author: "Dren Gashi",
 description:
 "A dense neon city block with street markets, rain lighting, modular buildings, and NPC route notes.",
 stack: ["Blender", "AI prompts", "Unreal plan"],
 stats: { comments: 18, likes: 142, saves: 36, forks: 11 },
 notes: "Prompt chain includes mood references, asset list, lighting passes, and optimization notes.",
 version: "v3 night lighting",
 icon: Gamepad2,
 },
 {
 title: "SaaS Launch Page Kit",
 type: "Website Template",
 author: "Elira Morina",
 description:
 "A polished React landing page direction with sections, conversion copy, feature cards, and pricing layout.",
 stack: ["Next.js", "Tailwind", "Copy workflow"],
 stats: { comments: 24, likes: 210, saves: 58, forks: 19 },
 notes: "Generation notes cover hero variants, CTA tests, component hierarchy, and responsive decisions.",
 version: "v2 pricing pass",
 icon: Globe2,
 },
 {
 title: "Rust API Starter Review",
 type: "Code Structure",
 author: "Arben Krasniqi",
 description:
 "A backend folder structure asking for security feedback, endpoint naming, and performance risks.",
 stack: ["Rust", "Postgres", "API design"],
 stats: { comments: 31, likes: 96, saves: 22, forks: 7 },
 notes: "Includes route map, auth questions, database notes, and AI review output.",
 version: "v1 review draft",
 icon: FileCode2,
 },
];

const feedItems = [
 {
 title: "Built a medieval game environment with AI",
 label: "Showcase",
 detail: "Includes biome notes, asset list, lighting pass, and a fork request for a night version.",
 icon: Gamepad2,
 },
 {
 title: "Generated a React landing page for SaaS",
 label: "Website",
 detail: "Looking for feedback on section order, hero copy, pricing cards, and mobile spacing.",
 icon: Globe2,
 },
 {
 title: "Fork this prompt and make it better",
 label: "Prompt Workflow",
 detail: "A repeatable prompt chain for app UI, product requirements, and frontend screens.",
 icon: GitFork,
 },
 {
 title: "Can someone improve this backend structure?",
 label: "Code Review",
 detail: "Requesting architecture comments, security notes, database feedback, and refactor ideas.",
 icon: Code2,
 },
];

const aiProjectHelp = [
 {
 title: "App ideas",
 items: ["Feature breakdown", "MVP scope", "Database structure", "Frontend screens", "Backend endpoints"],
 icon: Rocket,
 },
 {
 title: "Game environments",
 items: ["Lighting improvements", "Biome details", "Asset list", "Quest ideas", "Optimization notes"],
 icon: Gamepad2,
 },
 {
 title: "Code projects",
 items: ["Review", "Refactor suggestions", "Security notes", "Architecture comments", "Performance risks"],
 icon: Code2,
 },
];

const remixChain = [
 "User A creates a medieval game environment.",
 "User B forks it and builds a night version.",
 "User C adds an NPC village and quest structure.",
 "User D turns the chain into a Unity asset plan.",
];

const reputationActions = [
 "Project was forked",
 "Comment marked helpful",
 "Prompt reused by others",
 "Quality feedback given",
 "Project template published",
 "Contribution added to a project chain",
];

const marketplaceItems = [
 "AI-generated environment packs",
 "Website templates",
 "App starter kits",
 "Prompt packs",
 "Code boilerplates",
 "Game asset concepts",
 "Premium workflows",
 "Creator services",
];

function SectionHeading({
 eyebrow,
 title,
 description,
}: {
 eyebrow: string;
 title: string;
 description: string;
}) {
 return (
 <div className="max-w-3xl">
 <p className="text-sm font-semibold text-[#0284C7]">{eyebrow}</p>
 <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#0F172A] sm:text-4xl">
 {title}
 </h2>
 <p className="mt-4 text-sm leading-6 text-[#475569] sm:text-base">
 {description}
 </p>
 </div>
 );
}

function PreviewPanel({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
 return (
 <div className="overflow-hidden rounded-[18px] border border-[#DCEAF5] bg-[#F8FCFF]">
 <div className="flex items-center gap-2 border-b border-[#DCEAF5] bg-white px-3 py-2">
 <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" />
 <span className="h-2.5 w-2.5 rounded-full bg-[#DCEAF5]" />
 <span className="h-2.5 w-2.5 rounded-full bg-[#DCEAF5]" />
 <span className="ml-2 text-[10px] font-semibold text-[#94A3B8]">project preview</span>
 </div>
 <div className="p-4">
 <div className="flex h-32 items-center justify-center rounded-[14px] border border-[#DCEAF5] bg-white">
 <div className="text-center">
 <Icon className="mx-auto h-7 w-7 text-[#0284C7]" />
 <p className="mt-3 text-xs font-semibold text-[#475569]">{title}</p>
 </div>
 </div>
 </div>
 </div>
 );
}

export default function CommunityPage() {
 return (
 <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#F8FCFF_0%,#FFFFFF_44%,#F6FBFF_100%)] font-roboto text-[#0F172A]">
 <section className="px-5 pb-12 pt-12 sm:px-8 sm:pt-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="rounded-[28px] border border-[#DCEAF5] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
 <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
 <div>
 <Link
 href="/"
 className="inline-flex items-center gap-2 rounded-full border border-[#DCEAF5] bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-[#0369A1] transition-colors hover:bg-[#F0F9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
 >
 <ArrowRight className="h-3.5 w-3.5 rotate-180" />
 Back to Cedium
 </Link>
 <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] text-[#0F172A] sm:text-6xl">
 AI Community
 </h1>
 <p className="mt-6 max-w-2xl text-base leading-7 text-[#475569] sm:text-lg">
 A creation-first AI community where every post is connected to a project, asset, prompt, code structure, environment, website, or app idea.
 </p>
 <div className="mt-8 flex flex-col gap-3 sm:flex-row">
 <Button asChild className="h-11 rounded-[10px] bg-[#38BDF8] px-5 text-sm font-semibold text-white hover:bg-[#0EA5E9]">
 <a href="#creations">
 Publish a Creation
 <ArrowRight className="h-4 w-4" />
 </a>
 </Button>
 <Button
 asChild
 variant="outline"
 className="h-11 rounded-[10px] border-[#DCEAF5] bg-white/80 px-5 text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 <a href="#feed">Explore Feed</a>
 </Button>
 </div>
 </div>

 <div className="rounded-[24px] border border-[#DCEAF5] bg-[#F8FCFF] p-5">
 <div className="grid gap-4 sm:grid-cols-2">
 {[
 { label: "Project posts", value: "920", icon: Layers3 },
 { label: "Forks/remixes", value: "310", icon: GitFork },
 { label: "Helpful reviews", value: "1.8k", icon: BadgeCheck },
 { label: "Prompt workflows", value: "246", icon: Workflow },
 ].map(({ label, value, icon: Icon }) => (
 <div key={label} className="rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <Icon className="h-5 w-5 text-[#0284C7]" />
 <p className="mt-6 text-3xl font-semibold text-[#0F172A]">{value}</p>
 <p className="mt-1 text-sm text-[#64748B]">{label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 <section id="spaces" className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <SectionHeading
 eyebrow="Spaces"
 title="Keep the community focused around creation."
 description="Start with a few active spaces instead of a large empty forum. Each space is tied to work people can publish, review, fork, or improve."
 />
 <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {spaces.map(({ title, description, activity, icon: Icon }) => (
 <article
 key={title}
 className="rounded-[18px] border border-[#DCEAF5] bg-white p-6 shadow-sm transition hover:border-[#B7DDF6] hover:shadow-md"
 >
 <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-[#0284C7]">
 <Icon className="h-5 w-5" />
 </div>
 <h3 className="mt-6 text-base font-semibold text-[#0F172A]">{title}</h3>
 <p className="mt-3 text-sm leading-6 text-[#475569]">{description}</p>
 <p className="mt-5 inline-flex rounded-full bg-[#F0F9FF] px-3 py-1 text-xs font-semibold text-[#0369A1]">
 {activity}
 </p>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section id="creations" className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <SectionHeading
 eyebrow="Projects / Creations"
 title="Better than ordinary posts: every item is a reusable project."
 description="Each creation can include title, description, preview, tech stack, prompt history, files, comments, likes, saves, forks, and version history."
 />
 <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
 {creations.map(({ title, type, author, description, stack, stats, notes, version, icon: Icon }) => (
 <article key={title} className="flex flex-col rounded-[22px] border border-[#DCEAF5] bg-white p-5 shadow-sm transition hover:border-[#B7DDF6] hover:shadow-md">
 <PreviewPanel icon={Icon} title={type} />
 <div className="mt-5 flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-semibold text-[#0284C7]">{type}</p>
 <h3 className="mt-2 text-lg font-semibold leading-tight text-[#0F172A]">{title}</h3>
 <p className="mt-1 text-xs text-[#64748B]">by {author}</p>
 </div>
 <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-semibold text-[#475569]">
 {version}
 </span>
 </div>
 <p className="mt-4 text-sm leading-6 text-[#475569]">{description}</p>
 <div className="mt-4 flex flex-wrap gap-2">
 {stack.map((item) => (
 <span key={item} className="rounded-full bg-[#F0F9FF] px-3 py-1 text-xs font-semibold text-[#0369A1]">
 {item}
 </span>
 ))}
 </div>
 <div className="mt-5 rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-4">
 <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
 <History className="h-3.5 w-3.5 text-[#0284C7]" />
 Prompt history / generation notes
 </div>
 <p className="mt-2 text-xs leading-5 text-[#64748B]">{notes}</p>
 </div>
 <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs text-[#64748B]">
 <span>{stats.comments} comments</span>
 <span>{stats.likes} likes</span>
 <span>{stats.saves} saves</span>
 <span>{stats.forks} forks</span>
 </div>
 <div className="mt-auto flex gap-2 pt-5">
 <Button
 type="button"
 variant="outline"
 className="h-10 flex-1 rounded-[10px] border-[#DCEAF5] bg-white text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 View Project
 </Button>
 <Button type="button" className="h-10 flex-1 rounded-[10px] bg-[#38BDF8] text-sm font-semibold text-white hover:bg-[#0EA5E9]">
 <GitFork className="h-4 w-4" />
 Fork / Remix
 </Button>
 </div>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section id="feed" className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
 <SectionHeading
 eyebrow="Creation feed"
 title="The feed is not just text. It is a stream of useful work."
 description="People publish projects, ask for feedback, share AI workflows, request code reviews, and invite others to fork better versions."
 />
 <div className="grid gap-4">
 {feedItems.map(({ title, label, detail, icon: Icon }) => (
 <article key={title} className="rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm">
 <div className="flex items-start gap-4">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-[#0284C7]">
 <Icon className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-semibold text-[#0284C7]">{label}</p>
 <h3 className="mt-1 text-base font-semibold text-[#0F172A]">{title}</h3>
 <p className="mt-2 text-sm leading-6 text-[#475569]">{detail}</p>
 </div>
 </div>
 </article>
 ))}
 </div>
 </div>
 </div>
 </section>

 <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="rounded-[24px] border border-[#DCEAF5] bg-white/80 p-6 shadow-sm sm:p-8">
 <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
 <SectionHeading
 eyebrow="Remix / Fork system"
 title="Make every useful creation easier to improve."
 description="The strongest loop is project publishing followed by feedback, forked variations, version chains, and practical reuse."
 />
 <div className="grid gap-3">
 {remixChain.map((step, index) => (
 <div key={step} className="flex gap-4 rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-4">
 <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#38BDF8] text-sm font-semibold text-white">
 {index + 1}
 </span>
 <p className="text-sm leading-6 text-[#334155]">{step}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <SectionHeading
 eyebrow="AI inside every project"
 title="The community becomes more valuable when AI reviews the work."
 description="AI is not a separate chatbot tab. It sits inside projects and helps creators improve app ideas, game environments, code, prompts, and product systems."
 />
 <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
 {aiProjectHelp.map(({ title, items, icon: Icon }) => (
 <article key={title} className="rounded-[18px] border border-[#DCEAF5] bg-white p-6 shadow-sm">
 <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-[#0284C7]">
 <Icon className="h-5 w-5" />
 </div>
 <h3 className="mt-6 text-base font-semibold text-[#0F172A]">{title}</h3>
 <div className="mt-4 space-y-3">
 {items.map((item) => (
 <div key={item} className="flex items-center gap-3 text-sm text-[#475569]">
 <Bot className="h-4 w-4 text-[#0284C7]" />
 {item}
 </div>
 ))}
 </div>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_1fr]">
 <div className="rounded-[24px] border border-[#DCEAF5] bg-white p-6 shadow-sm sm:p-8">
 <SectionHeading
 eyebrow="Reputation"
 title="Reward contribution, not noise."
 description="Reputation should come from helpful activity: forks, useful comments, reused prompts, templates, and meaningful project-chain contributions."
 />
 <div className="mt-8 grid gap-3 sm:grid-cols-2">
 {reputationActions.map((action) => (
 <div key={action} className="flex items-center gap-3 rounded-[14px] border border-[#DCEAF5] bg-[#F8FCFF] p-3 text-sm font-medium text-[#334155]">
 <ThumbsUp className="h-4 w-4 text-[#0284C7]" />
 {action}
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-[24px] border border-[#DCEAF5] bg-white p-6 shadow-sm sm:p-8">
 <SectionHeading
 eyebrow="Marketplace later"
 title="Monetize after the creation loop is active."
 description="Marketplace should come after people are already publishing, remixing, and trusting creator quality."
 />
 <div className="mt-8 flex flex-wrap gap-2">
 {marketplaceItems.map((item) => (
 <span key={item} className="inline-flex items-center gap-2 rounded-full bg-[#F0F9FF] px-3 py-1.5 text-xs font-semibold text-[#0369A1]">
 <Store className="h-3.5 w-3.5" />
 {item}
 </span>
 ))}
 </div>
 </div>
 </div>
 </section>

 <section className="px-5 py-12 pb-20 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="rounded-[24px] border border-[#DCEAF5] bg-white/80 p-6 text-center shadow-sm sm:p-8">
 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#E0F2FE] text-[#0284C7]">
 <Wand2 className="h-6 w-6" />
 </div>
 <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-tight text-[#0F172A] sm:text-4xl">
 AI tool to project creation to preview to publish to feedback to remix to reputation to marketplace.
 </h2>
 <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#475569] sm:text-base">
 This is the product loop: not a Discord clone, but a practical AI creation community where work improves through collaboration.
 </p>
 <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
 <Button asChild className="h-11 rounded-[10px] bg-[#38BDF8] px-5 text-sm font-semibold text-white hover:bg-[#0EA5E9]">
 <Link href="/main">
 Start Creating
 <ArrowRight className="h-4 w-4" />
 </Link>
 </Button>
 <Button
 asChild
 variant="outline"
 className="h-11 rounded-[10px] border-[#DCEAF5] bg-white/80 px-5 text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 <a href="#creations">View Creation Model</a>
 </Button>
 </div>
 </div>
 </div>
 </section>
 </main>
 );
}
