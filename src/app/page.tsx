"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Github,
  Linkedin,
  LogIn,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const footerColumns = [
  { title: "Product", links: ["Features", "Pricing", "Use cases"] },
  { title: "Company", links: ["About", "Contact", "Partners"] },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
];

function CerevixLogo({ isDark }: { isDark: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Cerevix AI home">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-[#4284FF] text-white shadow-[0_16px_32px_rgba(66,132,255,0.26)]">
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34),transparent_52%)]" />
        <Sparkles className="relative h-4 w-4 fill-white" />
      </span>
      <span className={`text-[15px] font-black tracking-[-0.02em] ${isDark ? "text-white" : "text-[#171717]"}`}>
        Cerevix AI
      </span>
    </Link>
  );
}

function Surface({
  children,
  isDark,
  className = "",
}: {
  children: ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={`border backdrop-blur-2xl ${
        isDark
          ? "border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
          : "border-[#DCE3EE] bg-white/78 shadow-[0_24px_80px_rgba(31,43,77,0.10)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function Header({ isDark, setIsDark }: { isDark: boolean; setIsDark: (value: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <Surface isDark={isDark} className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-[1.35rem] px-4 sm:px-5">
        <CerevixLogo isDark={isDark} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition-colors ${
              isDark
                ? "border-white/10 bg-white/[0.055] text-[#C1C2BF] hover:bg-white/[0.09] hover:text-white"
                : "border-[#DCE3EE] bg-white text-[#4B5563] hover:border-[#4284FF]/40 hover:text-[#4284FF]"
            }`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </button>
          <Button
            asChild
            variant="outline"
            className={`h-10 rounded-full px-4 text-[12px] font-bold shadow-none ${
              isDark
                ? "border-white/10 bg-white/[0.055] text-white hover:bg-white/[0.09] hover:text-white"
                : "border-[#DCE3EE] bg-white text-[#171717] hover:border-[#4284FF]/40 hover:bg-white hover:text-[#4284FF]"
            }`}
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </Surface>
    </header>
  );
}

function CTASection({ isDark }: { isDark: boolean }) {
  return (
    <main className="flex min-h-screen items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <Surface isDark={isDark} className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-16">
          <div
            className={`absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${
              isDark ? "bg-[#4284FF]/24" : "bg-[#4284FF]/18"
            }`}
          />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#4284FF]/24 bg-[#4284FF]/14 text-[#4284FF]">
            <Sparkles className="h-7 w-7 fill-[#4284FF]" />
          </div>
          <div
            className={`relative mx-auto mt-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-black ${
              isDark
                ? "border-white/10 bg-white/[0.055] text-[#C1C2BF]"
                : "border-[#DCE3EE] bg-white/80 text-[#4B5563]"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#4284FF]" />
            AI support and lead capture for modern websites
          </div>
          <h1
            className={`relative mx-auto mt-6 max-w-4xl text-balance text-[clamp(2.8rem,7vw,6.4rem)] font-black leading-[0.88] tracking-[-0.07em] ${
              isDark ? "text-white" : "text-[#111827]"
            }`}
          >
            Convert visitors with a trained AI assistant.
          </h1>
          <p className={`relative mx-auto mt-6 max-w-2xl text-balance text-[15px] leading-7 sm:text-base sm:leading-8 ${isDark ? "text-[#C1C2BF]" : "text-[#5E6673]"}`}>
            Cerevix AI answers questions, captures qualified leads, and gives your team clean handoffs without adding support workload.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-full bg-[#4284FF] px-7 text-[13px] font-black text-white shadow-[0_22px_46px_rgba(66,132,255,0.32)] hover:bg-[#3273F2]"
            >
              <Link href="/signup">
                Try Cerevix <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className={`h-12 rounded-full px-7 text-[13px] font-bold shadow-none ${
                isDark
                  ? "border-white/10 bg-white/[0.055] text-white hover:bg-white/[0.09] hover:text-white"
                  : "border-[#DCE3EE] bg-white text-[#171717] hover:border-[#4284FF]/40 hover:bg-white hover:text-[#4284FF]"
              }`}
            >
              <Link href="/contact">Book a Demo</Link>
            </Button>
          </div>
        </Surface>
      </section>
    </main>
  );
}

function Footer({ isDark }: { isDark: boolean }) {
  const socials = [
    { label: "X", icon: Twitter },
    { label: "GitHub", icon: Github },
    { label: "LinkedIn", icon: Linkedin },
  ];

  return (
    <footer className={`border-t px-4 py-14 sm:px-6 lg:px-8 ${isDark ? "border-white/10" : "border-[#DCE3EE]"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <CerevixLogo isDark={isDark} />
            <p className={`mt-4 max-w-sm text-sm leading-6 ${isDark ? "text-[#C1C2BF]" : "text-[#5E6673]"}`}>
              Cerevix AI helps businesses automate support, capture leads, and answer website visitors with trained AI assistants.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, icon: Icon }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/[0.055] text-[#C1C2BF] hover:border-[#4284FF]/40 hover:text-[#4284FF]"
                      : "border-[#DCE3EE] bg-white text-[#5E6673] hover:border-[#4284FF]/40 hover:text-[#4284FF]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className={`text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? "text-white" : "text-[#171717]"}`}>
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className={`text-sm font-medium transition-colors ${isDark ? "text-[#C1C2BF]" : "text-[#5E6673]"} hover:text-[#4284FF]`}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className={`mt-12 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-white/10 text-[#C1C2BF]/70" : "border-[#DCE3EE] text-[#5E6673]"}`}>
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
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className={`min-h-screen overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? "bg-[#090A0D] text-[#C1C2BF]" : "bg-[#F5F7FB] text-[#171717]"
      }`}
    >
      <div
        className={`pointer-events-none fixed inset-0 transition-opacity duration-300 ${
          isDark
            ? "bg-[radial-gradient(circle_at_50%_0%,rgba(66,132,255,0.16),transparent_34%),linear-gradient(180deg,#111318_0%,#090A0D_52%,#0D0D10_100%)]"
            : "bg-[radial-gradient(circle_at_50%_0%,rgba(66,132,255,0.16),transparent_34%),linear-gradient(180deg,#FFFFFF_0%,#F5F7FB_58%,#EEF3F9_100%)]"
        }`}
      />
      <div className="relative">
        <Header isDark={isDark} setIsDark={setIsDark} />
        <CTASection isDark={isDark} />
        <Footer isDark={isDark} />
      </div>
    </div>
  );
}
