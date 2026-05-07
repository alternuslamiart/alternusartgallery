import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Database,
  Github,
  Globe2,
  Layers3,
  Linkedin,
  Menu,
  MessageCircle,
  MousePointer2,
  Send,
  ShieldCheck,
  Sparkles,
  Twitter,
  Workflow,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Use cases", href: "#use-cases" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Account", href: "/account" },
];

const features = [
  {
    icon: MessageCircle,
    title: "24/7 AI support",
    description: "Resolve repetitive customer questions instantly with grounded answers trained on your business content.",
  },
  {
    icon: Database,
    title: "Website-trained responses",
    description: "Turn pages, docs, policies, and product data into a reliable assistant for every visitor.",
  },
  {
    icon: MousePointer2,
    title: "Lead capture",
    description: "Qualify intent, collect contact details, and route high-value conversations before visitors leave.",
  },
  {
    icon: Globe2,
    title: "Multilingual conversations",
    description: "Support customers across markets with clear responses that feel natural and brand-safe.",
  },
  {
    icon: BarChart3,
    title: "Visitor insights",
    description: "See recurring questions, missed content, conversion signals, and support demand from one dashboard.",
  },
  {
    icon: Workflow,
    title: "Smart workflows",
    description: "Prepare handoffs, summarize conversations, and keep sales and support teams aligned.",
  },
];

const steps = [
  {
    label: "01",
    title: "Connect your website",
    description: "Import your website, help center, PDFs, product pages, and support content.",
  },
  {
    label: "02",
    title: "Train Cerevix AI",
    description: "Cerevix structures your knowledge and prepares source-aware, brand-aligned responses.",
  },
  {
    label: "03",
    title: "Convert visitors",
    description: "Answer questions, capture qualified leads, and surface insights for your team.",
  },
];

const useCases = ["SaaS support", "Agencies", "Ecommerce", "B2B sales", "Service businesses"];

const footerColumns = [
  { title: "Product", links: ["Features", "Use cases", "Pricing", "Integrations"] },
  { title: "Company", links: ["About", "Contact", "Partners", "Blog"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Notice", "Security"] },
];

function CerevixLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Cerevix AI home">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#4284FF] text-white shadow-[0_16px_34px_rgba(66,132,255,0.28)]">
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),transparent_48%)]" />
        <Sparkles className="relative h-4 w-4 fill-white" />
      </span>
      <span className="text-[15px] font-black tracking-[-0.02em] text-[#F4F4F1]">Cerevix AI</span>
    </Link>
  );
}

function GlassShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <GlassShell className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-[1.35rem] px-4 sm:px-5 lg:px-6">
        <CerevixLogo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[12px] font-semibold text-[#C1C2BF]/72 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="h-10 rounded-full bg-[#4284FF] px-5 text-[12px] font-black text-white shadow-[0_18px_36px_rgba(66,132,255,0.30)] hover:bg-[#3273F2]"
          >
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-[#C1C2BF] hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </GlassShell>
    </header>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.065] px-3.5 py-2 text-[11px] font-bold text-[#C1C2BF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4284FF] shadow-[0_0_16px_rgba(66,132,255,0.85)]" />
      Website-trained AI support and lead capture
    </div>
  );
}

function DashboardMockup() {
  const sidebar = ["Inbox", "Live chats", "Knowledge", "Leads", "Insights"];
  const conversations = [
    { name: "Mila", text: "Can you explain the enterprise plan?", score: "92", active: true },
    { name: "Arben", text: "Do you support Albanian and English?", score: "78", active: false },
    { name: "Nora", text: "I want pricing for my team.", score: "84", active: false },
  ];
  const metrics = [
    ["Qualified", "38"],
    ["Resolved", "91%"],
    ["Avg reply", "1.4s"],
  ];

  return (
    <div className="relative mx-auto mt-16 w-full max-w-6xl">
      <div className="absolute -left-10 top-12 hidden h-72 w-72 rounded-full bg-[#4284FF]/18 blur-3xl lg:block" />
      <div className="absolute -right-8 bottom-10 hidden h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl lg:block" />

      <GlassShell className="relative overflow-hidden rounded-[2.15rem] p-2.5 sm:p-3">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="overflow-hidden rounded-[1.65rem] border border-white/10 bg-[#111111]/82">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A7A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#F7CF5B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#66DBA2]" />
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[10px] font-bold text-[#C1C2BF] sm:flex">
              <ShieldCheck className="h-3 w-3 text-[#4284FF]" />
              AI assistant online
            </div>
          </div>

          <div className="grid min-h-[430px] grid-cols-1 lg:grid-cols-[178px_1fr_230px]">
            <aside className="hidden border-r border-white/10 bg-white/[0.035] p-4 lg:block">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4284FF] text-white shadow-[0_12px_28px_rgba(66,132,255,0.24)]">
                  <Sparkles className="h-4 w-4 fill-white" />
                </div>
                <span className="text-[12px] font-black text-white">Cerevix</span>
              </div>
              <div className="space-y-1.5">
                {sidebar.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                      index === 1
                        ? "bg-[#4284FF] text-white shadow-[0_12px_26px_rgba(66,132,255,0.28)]"
                        : "text-[#C1C2BF]/68 hover:bg-white/[0.055]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <section className="p-4 sm:p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4284FF]">Support inbox</p>
                  <h3 className="mt-1 text-xl font-black tracking-[-0.04em] text-white">Website visitors</h3>
                </div>
                <div className="rounded-full border border-[#4284FF]/25 bg-[#4284FF]/12 px-3 py-1.5 text-[11px] font-bold text-[#8DB5FF]">
                  12 live now
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-[0.82fr_1.18fr]">
                <div className="space-y-2.5">
                  {conversations.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        item.active
                          ? "border-[#4284FF]/45 bg-[#4284FF]/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/[0.045]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-semibold text-[#C1C2BF]/55">2m</span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[#C1C2BF]/72">{item.text}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-[#4284FF]" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4284FF,#77C8FF)] text-[11px] font-black text-white">
                      M
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-white">Mila from Berlin</p>
                      <p className="text-[10px] font-semibold text-[#C1C2BF]/55">Lead score 92 - Pricing page</p>
                    </div>
                  </div>
                  <div className="space-y-3 py-4">
                    <div className="max-w-[82%] rounded-2xl border border-white/10 bg-[#0F0F0F]/86 px-3 py-2.5 text-[11px] leading-5 text-[#C1C2BF]">
                      How does Cerevix learn our support docs?
                    </div>
                    <div className="ml-auto max-w-[88%] rounded-2xl bg-[#4284FF] px-3 py-2.5 text-[11px] leading-5 text-white shadow-[0_16px_34px_rgba(66,132,255,0.22)]">
                      Upload your website, help center, or files. Cerevix creates grounded answers with source-aware response rules.
                    </div>
                    <div className="max-w-[76%] rounded-2xl border border-white/10 bg-[#0F0F0F]/86 px-3 py-2.5 text-[11px] leading-5 text-[#C1C2BF]">
                      Great. Can I book a demo?
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0F0F0F]/90 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-[#C1C2BF]/55">Ask Cerevix to reply...</span>
                    <Send className="h-3.5 w-3.5 text-[#4284FF]" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="hidden border-l border-white/10 bg-white/[0.035] p-4 lg:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C1C2BF]/52">Visitor summary</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Intent", "Enterprise trial"],
                  ["Language", "English"],
                  ["Source", "Pricing page"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-[#0F0F0F]/70 px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-[#C1C2BF]/50">{label}</p>
                    <p className="mt-1 text-[12px] font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {metrics.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2">
                    <span className="text-[10px] font-semibold text-[#C1C2BF]/58">{label}</span>
                    <span className="text-[12px] font-black text-white">{value}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-5 h-10 w-full rounded-full bg-[#4284FF] text-[11px] font-black text-white hover:bg-[#3273F2]">
                Create lead
              </Button>
            </aside>
          </div>
        </div>
      </GlassShell>

      <FloatingChatWidget />
    </div>
  );
}

function FloatingChatWidget() {
  return (
    <GlassShell className="absolute -bottom-7 left-1/2 z-20 hidden w-[min(520px,calc(100%-32px))] -translate-x-1/2 items-center gap-3 rounded-full px-3 py-2.5 sm:flex">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#4284FF] text-white shadow-[0_14px_28px_rgba(66,132,255,0.26)]">
        <Bot className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#C1C2BF]">Ask Cerevix AI how it can qualify leads...</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4284FF]/15 text-[#77A8FF]">
        <Send className="h-4 w-4" />
      </span>
    </GlassShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-32 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-6 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(66,132,255,0.20),rgba(66,132,255,0.08)_36%,transparent_68%)] blur-2xl" />
      <div className="absolute right-[-12%] top-28 h-80 w-80 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="relative mx-auto max-w-5xl text-center">
        <HeroBadge />
        <h1 className="mx-auto mt-6 max-w-4xl text-balance text-[clamp(2.8rem,7vw,6.2rem)] font-black leading-[0.88] tracking-[-0.068em] text-white">
          AI customer support that turns visitors into revenue.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-[15px] leading-7 text-[#C1C2BF] sm:text-base sm:leading-8">
          Cerevix AI answers customer questions, captures qualified leads, and learns from your website knowledge so your team can move faster without losing the human touch.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 rounded-full bg-[#4284FF] px-7 text-[13px] font-black text-white shadow-[0_22px_46px_rgba(66,132,255,0.34)] hover:bg-[#3273F2]"
          >
            <Link href="/signup">
              Try Cerevix <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-white/10 bg-white/[0.055] px-7 text-[13px] font-bold text-[#C1C2BF] shadow-none backdrop-blur-xl hover:bg-white/[0.09] hover:text-white"
          >
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>

      <DashboardMockup />
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#4284FF]">Features</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Built for modern support and growth teams.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#C1C2BF]">
            A polished AI front desk for answering questions, understanding demand, and helping visitors take the next step.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassShell
                key={feature.title}
                className="group rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4284FF]/35 hover:bg-white/[0.075]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4284FF]/18 bg-[#4284FF]/12 text-[#7EAEFF] transition-colors group-hover:bg-[#4284FF] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#C1C2BF]">{feature.description}</p>
              </GlassShell>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-[#4284FF]/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#4284FF]">How it works</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Launch a trained assistant without a heavy setup cycle.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#C1C2BF]">
            Cerevix keeps the setup simple: connect content, train the assistant, and start converting conversations into qualified opportunities.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {useCases.map((useCase) => (
              <span key={useCase} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-bold text-[#C1C2BF]">
                {useCase}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <GlassShell key={step.label} className="rounded-[1.5rem] p-5">
              <div className="flex gap-5">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#4284FF] text-sm font-black text-white shadow-[0_14px_30px_rgba(66,132,255,0.28)]">
                  {step.label}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#C1C2BF]">{step.description}</p>
                </div>
              </div>
            </GlassShell>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <GlassShell className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#4284FF]">Why Cerevix AI</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Support automation that still feels premium.</h2>
          <p className="mt-5 text-sm leading-7 text-[#C1C2BF]">
            The experience is designed for high-trust customer interactions: clear answers, measured tone, visible context, and clean handoffs.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Source-aware answers", "Ground responses in your own business knowledge."],
            ["Lead intelligence", "Spot intent, urgency, and conversion signals."],
            ["Human handoff ready", "Summaries keep your team in control."],
            ["Premium visitor UX", "Fast, polished chat that feels native to your brand."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#0F0F0F]/62 p-4">
              <CheckCircle2 className="h-4 w-4 text-[#4284FF]" />
              <h3 className="mt-4 text-sm font-black text-white">{title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[#C1C2BF]">{description}</p>
            </div>
          ))}
        </div>
      </GlassShell>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#4284FF]/25 bg-[linear-gradient(135deg,rgba(66,132,255,0.22),rgba(255,255,255,0.06)_48%,rgba(15,15,15,0.92))] px-6 py-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:px-12">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#4284FF]/24 blur-3xl" />
        <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
          <Zap className="h-6 w-6" />
        </div>
        <h2 className="relative mx-auto mt-6 max-w-3xl text-balance text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl">
          Make every website visit feel handled.
        </h2>
        <p className="relative mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#D9DBD6]">
          Start with instant answers, lead capture, and clear handoffs for the conversations that need your team.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full bg-white px-7 text-[13px] font-black text-[#1B1B1B] hover:bg-[#EDEFEB]">
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full border-white/16 bg-white/8 px-7 text-[13px] font-bold text-white shadow-none hover:bg-white/12 hover:text-white">
            <Link href="/contact">Book a Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socials = [
    { label: "X", icon: Twitter },
    { label: "GitHub", icon: Github },
    { label: "LinkedIn", icon: Linkedin },
    { label: "Layers", icon: Layers3 },
  ];

  return (
    <footer className="border-t border-white/10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <CerevixLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#C1C2BF]">
              Cerevix AI helps businesses automate support, capture leads, and answer visitors with trained AI assistants.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, icon: Icon }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-[#C1C2BF] transition-colors hover:border-[#4284FF]/40 hover:text-[#4284FF]"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-white">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm font-medium text-[#C1C2BF] transition-colors hover:text-[#4284FF]">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[#C1C2BF]/70 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Cerevix AI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-[#4284FF]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#4284FF]">Terms</Link>
            <Link href="/cookie-notice" className="hover:text-[#4284FF]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#090A0D] font-sans text-[#C1C2BF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(66,132,255,0.14),transparent_34%),linear-gradient(180deg,#111318_0%,#090A0D_42%,#0D0D10_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="relative">
        <Header />
        <main>
          <Hero />
          <FeaturesSection />
          <HowItWorksSection />
          <WhySection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
