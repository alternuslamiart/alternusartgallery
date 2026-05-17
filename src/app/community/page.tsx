import type { Metadata } from "next";
import Link from "next/link";
import {
 ArrowRight,
 BadgeCheck,
 BriefcaseBusiness,
 Code2,
 MessageSquareText,
 Share2,
 Sparkles,
 Star,
 UsersRound,
 Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
 title: "AI Community",
 description:
 "Discover builders, creators, marketers, and operators using AI to create better workflows, tools, and businesses.",
};

const categories = [
 {
 title: "AI Workflows",
 description:
 "Share repeatable AI workflows for research, content, automation, operations, and productivity.",
 activity: "128 discussions",
 icon: Workflow,
 },
 {
 title: "Prompt Library",
 description:
 "Discover and publish useful prompts for design, coding, business, marketing, and daily work.",
 activity: "42 workflows shared",
 icon: MessageSquareText,
 },
 {
 title: "AI Coding",
 description:
 "Discuss AI-assisted software engineering, agents, code generation, debugging, and architecture.",
 activity: "96 builder threads",
 icon: Code2,
 },
 {
 title: "AI Business / Marketing",
 description:
 "Explore how AI is used for campaigns, landing pages, sales systems, content engines, and growth.",
 activity: "74 growth ideas",
 icon: BriefcaseBusiness,
 },
 {
 title: "Tool Reviews",
 description:
 "Review AI tools, compare use cases, share pricing insights, and recommend better alternatives.",
 activity: "53 reviews posted",
 icon: Star,
 },
];

const profiles = [
 {
 name: "Arben Krasniqi",
 initials: "AK",
 role: "AI Workflow Designer",
 bio: "Builds practical AI workflows for operations, research, and productivity.",
 interests: ["Automation", "Workflows", "AI Agents"],
 },
 {
 name: "Nora Berisha",
 initials: "NB",
 role: "Prompt Engineer",
 bio: "Creates reusable prompts for design teams, coding tasks, and business systems.",
 interests: ["Prompting", "Prompt Library", "Research"],
 },
 {
 name: "Dren Gashi",
 initials: "DG",
 role: "AI Coding Builder",
 bio: "Experiments with coding agents, debugging workflows, and architecture patterns.",
 interests: ["Coding Agents", "Architecture", "Debugging"],
 },
 {
 name: "Elira Morina",
 initials: "EM",
 role: "AI Marketing Strategist",
 bio: "Designs AI content systems for campaigns, sales pages, and growth operations.",
 interests: ["Marketing AI", "Content Systems", "Growth"],
 },
 {
 name: "Leon Hoxha",
 initials: "LH",
 role: "AI Tool Reviewer",
 bio: "Compares AI products, pricing models, use cases, and better alternatives.",
 interests: ["Tool Reviews", "Use Cases", "Pricing"],
 },
];

const collaborations = [
 {
 title: "Share Workflows",
 description: "Post your best AI process and help others reuse it in real work.",
 icon: Share2,
 },
 {
 title: "Publish Prompts",
 description:
 "Contribute prompts that solve specific problems across design, coding, business, and research.",
 icon: Sparkles,
 },
 {
 title: "Find Collaborators",
 description:
 "Connect with people building similar AI systems, products, or marketing engines.",
 icon: UsersRound,
 },
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

export default function CommunityPage() {
 return (
 <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#F8FCFF_0%,#FFFFFF_44%,#F6FBFF_100%)] font-roboto text-[#0F172A]">
 <section className="px-5 pb-12 pt-12 sm:px-8 sm:pt-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="rounded-[28px] border border-[#DCEAF5] bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8 lg:p-10">
 <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
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
 Discover builders, creators, marketers, and operators using AI to create better workflows, tools, and businesses.
 </p>
 <div className="mt-8 flex flex-col gap-3 sm:flex-row">
 <Button asChild className="h-11 rounded-[10px] bg-[#38BDF8] px-5 text-sm font-semibold text-white hover:bg-[#0EA5E9]">
 <a href="#members">
 Join the Community
 <ArrowRight className="h-4 w-4" />
 </a>
 </Button>
 <Button
 asChild
 variant="outline"
 className="h-11 rounded-[10px] border-[#DCEAF5] bg-white/80 px-5 text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 <a href="#topics">Explore Topics</a>
 </Button>
 </div>
 </div>

 <div className="rounded-[24px] border border-[#DCEAF5] bg-[#F8FCFF] p-5">
 <div className="grid gap-4 sm:grid-cols-2">
 {[
 { label: "Active builders", value: "1.2k", icon: UsersRound },
 { label: "Shared workflows", value: "420", icon: Workflow },
 { label: "Prompt threads", value: "860", icon: MessageSquareText },
 { label: "Tool reviews", value: "210", icon: BadgeCheck },
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

 <section id="topics" className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <SectionHeading
 eyebrow="Community topics"
 title="Find focused conversations around practical AI work."
 description="Browse lightweight spaces for workflows, prompts, coding, business systems, marketing, and tool research."
 />
 <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {categories.map(({ title, description, activity, icon: Icon }) => (
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

 <section id="members" className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
 <SectionHeading
 eyebrow="Member profiles"
 title="Meet people building useful AI systems."
 description="Clean profile cards help members discover expertise, interests, and collaboration fit without turning the space into a noisy feed."
 />
 <Button
 asChild
 variant="outline"
 className="h-10 w-fit rounded-[10px] border-[#DCEAF5] bg-white/80 px-4 text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 <Link href="/main">Open Studio</Link>
 </Button>
 </div>

 <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {profiles.map(({ name, initials, role, bio, interests }) => (
 <article key={name} className="flex min-h-[260px] flex-col rounded-[18px] border border-[#DCEAF5] bg-white p-5 shadow-sm transition hover:border-[#B7DDF6] hover:shadow-md">
 <div className="flex items-start gap-4">
 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E0F2FE] text-sm font-semibold text-[#0369A1]">
 {initials}
 </div>
 <div className="min-w-0">
 <h3 className="text-base font-semibold text-[#0F172A]">{name}</h3>
 <p className="mt-1 text-sm text-[#64748B]">{role}</p>
 </div>
 </div>
 <p className="mt-5 text-sm leading-6 text-[#475569]">{bio}</p>
 <div className="mt-5 flex flex-wrap gap-2">
 {interests.map((interest) => (
 <span key={interest} className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-medium text-[#475569]">
 {interest}
 </span>
 ))}
 </div>
 <div className="mt-auto pt-6">
 <Button
 type="button"
 variant="outline"
 className="h-10 w-full rounded-[10px] border-[#DCEAF5] bg-white text-sm font-semibold text-[#0F172A] shadow-none hover:bg-[#F0F9FF]"
 >
 Connect
 </Button>
 </div>
 </article>
 ))}
 </div>
 </div>
 </section>

 <section className="px-5 py-12 pb-20 sm:px-8 sm:py-16 lg:px-10">
 <div className="mx-auto max-w-7xl">
 <div className="rounded-[24px] border border-[#DCEAF5] bg-white/80 p-6 shadow-sm sm:p-8">
 <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
 <SectionHeading
 eyebrow="Collaboration"
 title="Share what works and find people building nearby."
 description="The community is organized around practical contribution: reusable workflows, specific prompts, and real collaboration needs."
 />
 <div className="grid gap-4 md:grid-cols-3">
 {collaborations.map(({ title, description, icon: Icon }) => (
 <article key={title} className="rounded-[18px] border border-[#DCEAF5] bg-[#F8FCFF] p-5">
 <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-[#0284C7] shadow-sm">
 <Icon className="h-5 w-5" />
 </div>
 <h3 className="mt-6 text-base font-semibold text-[#0F172A]">{title}</h3>
 <p className="mt-3 text-sm leading-6 text-[#475569]">{description}</p>
 </article>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>
 </main>
 );
}
