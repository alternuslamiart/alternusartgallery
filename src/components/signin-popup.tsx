"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { X } from "lucide-react";

const POPUP_KEY = "cedium_signin_popup_dismissed";
const STUDIO_HOME = "/ai-assistant";

function CediumMark() {
  return (
    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#38BDF8] shadow-[0_8px_20px_rgba(56,189,248,0.28)]" aria-hidden="true">
      <span className="absolute inset-[5px] rounded-[5px] border border-white/55" />
      <span className="absolute h-2/5 w-2/5 rounded-full bg-white" />
      <span className="absolute bottom-[6px] right-[6px] h-1.5 w-1.5 rounded-full bg-white" />
    </span>
  );
}

export function SignInPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY)) return;
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(POPUP_KEY, "1");
    setVisible(false);
  };

  const handleGoogle = () => {
    dismiss();
    signIn("google", { callbackUrl: STUDIO_HOME });
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    dismiss();
    window.location.href = `/login?email=${encodeURIComponent(email)}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-5 pt-6">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <CediumMark />
          </div>

          {/* Heading */}
          <h2 className="mb-1 text-center text-[15px] font-bold leading-snug text-[#111827]">
            Sign in or create an account
          </h2>
          <p className="mb-5 text-center text-[12px] text-[#6B7280]">
            Save and sync your searches
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="mb-2.5 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#111827] text-[13px] font-semibold text-white transition-colors hover:bg-[#1F2937]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Apple */}
          <button
            onClick={dismiss}
            className="mb-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.15.8 1.21-.24 2.37-.93 3.66-.84 1.56.12 2.73.72 3.5 1.9-3.22 1.86-2.46 5.96.52 7.12-.6 1.57-1.38 3.1-2.83 3.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[11px] text-[#9CA3AF]">or</span>
            </div>
          </div>

          {/* Email */}
          <form onSubmit={handleEmail} className="space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-[#38BDF8]"
            />
            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-[#F3F4F6] text-[13px] font-semibold text-[#374151] transition-colors hover:bg-[#E5E7EB]"
            >
              Continue with email
            </button>
          </form>

          {/* SSO */}
          <p className="mt-3 text-center">
            <Link
              href="/login"
              onClick={dismiss}
              className="text-[11px] text-[#6B7280] underline underline-offset-2 hover:text-[#374151]"
            >
              Single sign-on (SSO)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
