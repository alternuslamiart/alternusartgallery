import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  Globe2,
  Github,
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
import { Card, CardContent } from "@/components/ui/card";

const navLinks = ["Usecases", "Become a partner", "Pricing", "My chatbots", "Account"];

const features = [
  {
    icon: MessageCircle,
    title: "24/7 automated support",
    description: "Resolve common questions instantly with fast, accurate replies trained on your business content.",
  },
  {
    icon: MousePointer2,
    title: "Lead capture and qualification",
    description: "Collect intent, company details, and contact information before a visitor ever leaves your site.",
  },
  {
    icon: Bot,
    title: "Website-trained AI answers",
    description: "Turn your pages, docs, policies, and product data into an always-on assistant for visitors.",
  },
  {
    icon: Globe2,
    title: "Multilingual conversations",
    description: "Support global customers with calm, natural responses across languages and time zones.",
  },
  {
    icon: BarChart3,
    title: "Conversation insights",
    description: "Understand recurring questions, high-value leads, and support gaps from one clean dashboard.",
  },
  {
    icon: Workflow,
    title: "Workflow integrations",
    description: "Route qualified conversations into the tools your sales and support teams already use.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Connect your website or data",
    description: "Add your site, help center, product pages, PDFs, or internal content in minutes.",
  },
  {
    step: "02",
    title: "Train your AI assistant",
    description: "Cerevix structures your knowledge and prepares safe, brand-aligned responses.",
  },
  {
    step: "03",
    title: "Convert visitors into leads",
    description: "Launch a polished chat assistant that answers questions and captures qualified demand.",
  },
];

const trustedLogos = ["Northstar", "Apex Cloud", "Signal Desk", "Blue Ridge", "Orbit Labs"];

function CerevixLogo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Cerevix home">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-[0_12px_26px_rgba(15,23,42,0.18)]">
        <Sparkles className="h-4 w-4 fill-white" />
      </span>
      <span className="text-[15px] font-black tracking-[-0.02em] text-slate-950">Cerevix</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <CerevixLogo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link}
              href={link === "Pricing" ? "/pricing" : "#"}
              className="text-[12px] font-semibold text-slate-600 transition-colors hover:text-blue-600"
            >
              {link}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="h-9 rounded-full bg-blue-600 px-4 text-[12px] font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700">
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-950 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
      Custom ChatGPT trained on your website data
    </div>
  );
}

function DashboardMockup() {
  const sidebar = ["Inbox", "Live chats", "Knowledge", "Leads", "Settings"];
  const conversations = [
    { name: "Mila", text: "Can you explain the enterprise plan?", active: true },
    { name: "Arben", text: "Do you support Albanian and English?", active: false },
    { name: "Nora", text: "I want pricing for my team.", active: false },
  ];

  return (
    <div className="relative mx-auto mt-16 w-full max-w-4xl px-3 sm:px-6">
      <div className="absolute -left-10 top-16 hidden h-44 w-44 rounded-full bg-blue-200/35 blur-3xl md:block" />
      <div className="absolute -right-8 bottom-2 hidden h-52 w-52 rounded-full bg-cyan-200/40 blur-3xl md:block" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/86 p-3 shadow-[0_42px_110px_rgba(30,64,175,0.20)] backdrop-blur-xl">
        <div className="rounded-[1.45rem] border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500 sm:flex">
              <ShieldCheck className="h-3 w-3 text-blue-500" />
              AI assistant online
            </div>
          </div>

          <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-[160px_1fr_190px]">
            <aside className="hidden border-r border-slate-100 bg-slate-50/70 p-4 md:block">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-3.5 w-3.5 fill-white" />
                </div>
                <span className="text-[12px] font-black text-slate-900">Cerevix</span>
              </div>
              <div className="space-y-1.5">
                {sidebar.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${
                      index === 1 ? "bg-slate-950 text-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>

            <section className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Support inbox</p>
                  <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-slate-950">Website visitors</h3>
                </div>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">12 live now</div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-2">
                  {conversations.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-2xl border p-3 ${
                        item.active ? "border-blue-200 bg-blue-50/70" : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-slate-900">{item.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">2m</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-3">
                  <div className="flex items-center gap-2 border-b border-slate-200/70 pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[11px] font-black text-white">
                      M
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-slate-900">Mila from Berlin</p>
                      <p className="text-[10px] font-semibold text-slate-400">Lead score 92</p>
                    </div>
                  </div>
                  <div className="space-y-3 py-4">
                    <div className="max-w-[82%] rounded-2xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600 shadow-sm">
                      How does Cerevix learn our support docs?
                    </div>
                    <div className="ml-auto max-w-[86%] rounded-2xl bg-blue-600 px-3 py-2 text-[11px] leading-5 text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)]">
                      Upload your website, help center, or files. Cerevix turns them into grounded answers with source-aware response rules.
                    </div>
                    <div className="max-w-[78%] rounded-2xl bg-white px-3 py-2 text-[11px] leading-5 text-slate-600 shadow-sm">
                      Great. Can I book a demo?
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                    <span className="flex-1 text-[11px] text-slate-400">Ask Cerevix to reply...</span>
                    <Send className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="hidden border-l border-slate-100 bg-white p-4 md:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Visitor summary</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Intent", "Enterprise trial"],
                  ["Language", "English"],
                  ["Source", "Pricing page"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                    <p className="mt-1 text-[12px] font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-5 h-9 w-full rounded-full bg-slate-950 text-[11px] font-bold text-white hover:bg-blue-700">
                Create lead
              </Button>
            </aside>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[54%] -z-10 h-[360px] w-[780px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.20),rgba(219,234,254,0.14)_42%,transparent_70%)]" />

      <FloatingChatWidget />
    </div>
  );
}

function FloatingChatWidget() {
  return (
    <div className="absolute -bottom-8 right-2 z-20 hidden w-[330px] items-center gap-3 rounded-full border border-white/80 bg-white px-3 py-2.5 shadow-[0_22px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:flex lg:right-0">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-500">How can we help you today?</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Send className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_52%,#f8fbff_100%)] px-4 pb-28 pt-32 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[360px] overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[520px] w-[980px] -translate-x-1/2 rounded-[50%] border border-blue-100 bg-[linear-gradient(135deg,rgba(219,234,254,0.60),rgba(255,255,255,0.12))] shadow-[inset_0_22px_80px_rgba(59,130,246,0.11)]" />
        <div className="absolute left-[58%] top-8 h-[430px] w-[650px] -translate-x-1/2 rotate-[-12deg] rounded-[48%] border border-blue-100/80 bg-[linear-gradient(135deg,rgba(147,197,253,0.20),rgba(255,255,255,0.06))]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <HeroBadge />
        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5.65rem)] font-black leading-[0.91] tracking-[-0.065em] text-slate-950">
          Your 24/7 AI Support Assistant
          <span className="block">that helps you grow your business.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
          Cerevix is an AI-powered chatbot that handles lead generation and customer support for your business, reducing support workload while delivering fast, personalized replies.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-full bg-blue-600 px-6 text-[13px] font-bold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] hover:bg-blue-700">
            <Link href="/signup">
              Try Cerevix <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-slate-200 bg-white/80 px-6 text-[13px] font-bold text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>

      <DashboardMockup />
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Features</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Built for support, sales, and growth teams.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Cerevix gives visitors clear answers and gives your team cleaner data, better context, and fewer repetitive tickets.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">How it works</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Launch a trained AI assistant without slowing down your team.
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            From content ingestion to live conversations, Cerevix keeps the setup simple and the customer experience polished.
          </p>
          <Button asChild className="mt-7 h-11 rounded-full bg-slate-950 px-6 text-[13px] font-bold text-white hover:bg-blue-700">
            <Link href="/signup">
              Start setup <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {processSteps.map((item) => (
            <div key={item.step} className="flex gap-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                {item.step}
              </div>
              <div>
                <h3 className="text-lg font-black tracking-[-0.03em] text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustedSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.05)]">
        <p className="text-center text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Trusted by modern businesses</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {trustedLogos.map((logo) => (
            <div key={logo} className="flex h-16 items-center justify-center rounded-2xl border border-slate-100 bg-white text-sm font-black tracking-[-0.02em] text-slate-500">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.2rem] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_58%,#38bdf8_100%)] px-6 py-14 text-center shadow-[0_34px_90px_rgba(30,64,175,0.24)] sm:px-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white ring-1 ring-white/20">
          <Zap className="h-6 w-6" />
        </div>
        <h2 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
          Start automating support with Cerevix.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-50/86">
          Give every visitor an instant, helpful answer while your team focuses on the conversations that need a human touch.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-full bg-white px-6 text-[13px] font-black text-blue-700 hover:bg-blue-50">
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-white/28 bg-white/10 px-6 text-[13px] font-bold text-white hover:bg-white/18 hover:text-white">
            <Link href="/contact">Book a Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Integrations", "Usecases"],
    },
    {
      title: "Company",
      links: ["About", "Become a partner", "Contact", "Blog"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookies"],
    },
  ];

  return (
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <CerevixLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Cerevix helps businesses automate support, capture leads, and answer website visitors with trained AI assistants.
            </p>
            <div className="mt-5 flex items-center gap-3 text-slate-500">
              <Link href="#" aria-label="Cerevix on X" className="rounded-full border border-slate-200 bg-white p-2 hover:text-blue-600">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Cerevix on LinkedIn" className="rounded-full border border-slate-200 bg-white p-2 hover:text-blue-600">
                <Linkedin className="h-4 w-4" />
              </Link>
              <Link href="#" aria-label="Cerevix on GitHub" className="rounded-full border border-slate-200 bg-white p-2 hover:text-blue-600">
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-slate-900">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Cerevix. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-600">Terms</Link>
            <Link href="/cookie-notice" className="hover:text-blue-600">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-950">
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustedSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
