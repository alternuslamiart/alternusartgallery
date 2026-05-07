import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Github,
  Linkedin,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = ["Usecases", "Become a partner", "Pricing", "My chatbots", "Account"];

function CerevixLogo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Cerevix home">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4284FF] text-white">
        <Sparkles className="h-4 w-4 fill-white" />
      </span>
      <span className="text-[15px] font-black tracking-[-0.02em] text-[#F4F4F1]">Cerevix</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#262626] bg-[#1B1B1B]/86 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <CerevixLogo />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link}
              href={link === "Pricing" ? "/pricing" : "#"}
              className="text-[12px] font-semibold text-[#C1C2BF]/72 transition-colors hover:text-[#4284FF]"
            >
              {link}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="h-9 rounded-full bg-[#4284FF] px-4 text-[12px] font-bold text-white shadow-none hover:bg-[#3273F2]">
            <Link href="/signup">Try Cerevix</Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-[#C1C2BF] hover:bg-[#262626] hover:text-[#4284FF] md:hidden" aria-label="Open navigation">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#262626] bg-[#262626] px-3 py-1.5 text-[11px] font-bold text-[#C1C2BF]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#4284FF]" />
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
      <div className="absolute -left-10 top-16 hidden h-44 w-44 rounded-full bg-[#4284FF]/18 blur-3xl md:block" />
      <div className="absolute -right-8 bottom-2 hidden h-52 w-52 rounded-full bg-[#4284FF]/12 blur-3xl md:block" />

      <div className="relative overflow-hidden rounded-[2rem] border border-[#333333] bg-[#262626]/84 p-3 shadow-none backdrop-blur-xl">
        <div className="rounded-[1.45rem] border border-[#333333] bg-[#1B1B1B]">
          <div className="flex items-center justify-between border-b border-[#333333] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-[#262626] px-3 py-1 text-[10px] font-bold text-[#C1C2BF]/72 sm:flex">
              <ShieldCheck className="h-3 w-3 text-[#4284FF]" />
              AI assistant online
            </div>
          </div>

          <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-[160px_1fr_190px]">
            <aside className="hidden border-r border-[#333333] bg-[#262626] p-4 md:block">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4284FF] text-white">
                  <Sparkles className="h-3.5 w-3.5 fill-white" />
                </div>
                <span className="text-[12px] font-black text-[#F4F4F1]">Cerevix</span>
              </div>
              <div className="space-y-1.5">
                {sidebar.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${
                      index === 1 ? "bg-[#4284FF] text-white" : "text-[#C1C2BF]/68"
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4284FF]">Support inbox</p>
                  <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[#F4F4F1]">Website visitors</h3>
                </div>
                <div className="rounded-full bg-[#4284FF]/14 px-3 py-1 text-[11px] font-bold text-[#4284FF]">12 live now</div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-2">
                  {conversations.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-2xl border p-3 ${
                        item.active ? "border-[#4284FF]/50 bg-[#4284FF]/12" : "border-[#333333] bg-[#262626]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#F4F4F1]">{item.name}</span>
                        <span className="text-[10px] font-semibold text-[#C1C2BF]/55">2m</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#C1C2BF]/70">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-[#333333] bg-[#262626] p-3">
                  <div className="flex items-center gap-2 border-b border-[#333333] pb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4284FF] text-[11px] font-black text-white">
                      M
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-[#F4F4F1]">Mila from Berlin</p>
                      <p className="text-[10px] font-semibold text-[#C1C2BF]/55">Lead score 92</p>
                    </div>
                  </div>
                  <div className="space-y-3 py-4">
                    <div className="max-w-[82%] rounded-2xl bg-[#1B1B1B] px-3 py-2 text-[11px] leading-5 text-[#C1C2BF]">
                      How does Cerevix learn our support docs?
                    </div>
                    <div className="ml-auto max-w-[86%] rounded-2xl bg-[#4284FF] px-3 py-2 text-[11px] leading-5 text-white">
                      Upload your website, help center, or files. Cerevix turns them into grounded answers with source-aware response rules.
                    </div>
                    <div className="max-w-[78%] rounded-2xl bg-[#1B1B1B] px-3 py-2 text-[11px] leading-5 text-[#C1C2BF]">
                      Great. Can I book a demo?
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#333333] bg-[#1B1B1B] px-3 py-2">
                    <span className="flex-1 text-[11px] text-[#C1C2BF]/55">Ask Cerevix to reply...</span>
                    <Send className="h-3.5 w-3.5 text-[#4284FF]" />
                  </div>
                </div>
              </div>
            </section>

            <aside className="hidden border-l border-[#333333] bg-[#262626] p-4 md:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#C1C2BF]/55">Visitor summary</p>
              <div className="mt-4 space-y-3">
                {[
                  ["Intent", "Enterprise trial"],
                  ["Language", "English"],
                  ["Source", "Pricing page"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#333333] bg-[#1B1B1B] px-3 py-2">
                    <p className="text-[10px] font-semibold text-[#C1C2BF]/55">{label}</p>
                    <p className="mt-1 text-[12px] font-bold text-[#F4F4F1]">{value}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-5 h-9 w-full rounded-full bg-[#4284FF] text-[11px] font-bold text-white hover:bg-[#3273F2]">
                Create lead
              </Button>
            </aside>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[54%] -z-10 h-[360px] w-[780px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle_at_center,rgba(66,132,255,0.18),rgba(66,132,255,0.08)_42%,transparent_70%)]" />

      <FloatingChatWidget />
    </div>
  );
}

function FloatingChatWidget() {
  return (
    <div className="absolute -bottom-8 right-2 z-20 hidden w-[330px] items-center gap-3 rounded-full border border-[#333333] bg-[#262626] px-3 py-2.5 shadow-none backdrop-blur-xl sm:flex lg:right-0">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4284FF] text-white">
        <Bot className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#C1C2BF]">How can we help you today?</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4284FF]/14 text-[#4284FF]">
        <Send className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1B1B1B] px-4 pb-28 pt-32 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#4284FF]/16 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-[360px] overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[520px] w-[980px] -translate-x-1/2 rounded-[50%] border border-[#262626] bg-[linear-gradient(135deg,rgba(66,132,255,0.14),rgba(38,38,38,0.10))]" />
        <div className="absolute left-[58%] top-8 h-[430px] w-[650px] -translate-x-1/2 rotate-[-12deg] rounded-[48%] border border-[#262626] bg-[linear-gradient(135deg,rgba(66,132,255,0.10),rgba(38,38,38,0.06))]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <HeroBadge />
        <h1 className="mx-auto mt-5 max-w-4xl text-balance text-[clamp(2.5rem,7vw,5.65rem)] font-black leading-[0.91] tracking-[-0.065em] text-[#F4F4F1]">
          Your 24/7 AI Support Assistant
          <span className="block">that helps you grow your business.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-6 text-[#C1C2BF] sm:text-base sm:leading-7">
          Cerevix is an AI-powered chatbot that handles lead generation and customer support for your business, reducing support workload while delivering fast, personalized replies.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-11 rounded-full bg-[#4284FF] px-6 text-[13px] font-bold text-white shadow-none hover:bg-[#3273F2]">
            <Link href="/signup">
              Try Cerevix <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-[#333333] bg-[#262626] px-6 text-[13px] font-bold text-[#C1C2BF] shadow-none hover:border-[#4284FF] hover:bg-[#262626] hover:text-[#4284FF]">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>

      <DashboardMockup />
    </section>
  );
}

function Footer() {
  const columns = [
    {
      title: "Platform",
      links: ["Overview", "Bridges", "Agent SDK", "API Reference", "Changelog", "Status"],
    },
    {
      title: "Creative",
      links: ["Launch Studio", "Edit", "Media library", "FX & 3D", "Boards", "Voice & sound"],
    },
    {
      title: "Company",
      links: ["About", "Manifesto", "Careers", "Press Kit", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Use", "Cookie Notice", "Security", "Pricing"],
    },
  ];
  const socials = [
    { label: "X", icon: Twitter },
    { label: "GitHub", icon: Github },
    { label: "LinkedIn", icon: Linkedin },
    { label: "YouTube", icon: MessageCircle },
    { label: "RSS", icon: Send },
  ];

  return (
    <footer className="border-t border-[#333333] bg-[#262626] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-12">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-medium tracking-[-0.005em] text-[#C1C2BF]/62">{column.title}</h3>
              <ul className="mt-7 space-y-5">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-[14.5px] font-medium tracking-[-0.005em] text-[#C1C2BF] hover:text-[#4284FF]">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-[#333333] pt-7 text-[11.5px] text-[#C1C2BF]/70 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {socials.map(({ label, icon: Icon }) => (
              <Link key={label} href="#" aria-label={label} className="text-[#C1C2BF]/62 hover:text-[#4284FF]">
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 font-extrabold text-[#F4F4F1]">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[#4284FF] text-white">
                <Sparkles className="h-3 w-3 fill-white" />
              </span>
              Cerevix
            </span>
            <span>&copy; 2026</span>
            <Link href="/cookie-notice" className="border-b border-dashed border-[#C1C2BF]/30 pb-0.5 hover:text-[#4284FF]">
              Manage Cookies
            </Link>
          </div>
          <div className="inline-flex h-9 items-center gap-2 self-start rounded-full border border-[#333333] bg-[#1B1B1B] px-4 font-medium text-[#C1C2BF] md:self-auto">
            English <span className="text-[#C1C2BF]/55">Albania</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1B1B1B] font-sans text-[#C1C2BF]">
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
