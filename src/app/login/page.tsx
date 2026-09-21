"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Lock, Mail, Moon, RefreshCw, ShieldCheck, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STUDIO_HOME = "/";
const AUTH_THEME_KEY = "Coreforge_auth_theme";

type OAuthProvider = "google" | "github" | "discord";

const socialProviders: Array<{
 id: OAuthProvider;
 label: string;
 icon: JSX.Element;
}> = [
 {
 id: "google",
 label: "Continue with Google",
 icon: <CoreforgeMark compact />,
 },
 {
 id: "github",
 label: "Continue with GitHub",
 icon: (
 <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
 <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.34 1.11 2.91.85.09-.67.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
 </svg>
 ),
 },
 {
 id: "discord",
 label: "Continue with Discord",
 icon: (
 <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
 <path d="M20.32 4.37A19.79 19.79 0 0 0 16.55 3c-.16.29-.35.68-.48.99a18.27 18.27 0 0 0-8.14 0c-.13-.31-.32-.7-.48-.99a19.74 19.74 0 0 0-3.77 1.37C1.29 7.96.61 11.46.93 14.9a19.9 19.9 0 0 0 6 3.05c.48-.65.91-1.34 1.28-2.07-.71-.27-1.4-.6-2.05-1 .17-.13.34-.26.5-.4 3.92 1.82 8.17 1.82 12.04 0 .17.14.33.27.5.4-.65.4-1.34.73-2.05 1 .37.73.8 1.42 1.28 2.07a19.9 19.9 0 0 0 6-3.05c.39-4-.67-7.47-3.11-10.53ZM8.68 12.78c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.95 2.44-2.15 2.44Zm6.64 0c-1.18 0-2.15-1.1-2.15-2.44s.95-2.44 2.15-2.44c1.2 0 2.17 1.1 2.15 2.44 0 1.34-.95 2.44-2.15 2.44Z" />
 </svg>
 ),
 },
];

function CoreforgeMark({ compact = false }: { compact?: boolean } = {}) {
 return (
 <span className={`relative inline-flex ${compact ? "h-4 w-4" : "h-8 w-8"} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#068fff]`} aria-hidden="true">
 <span className="absolute inset-[4px] rounded-full border-[3px] border-[#071014] border-r-white/0 border-t-white/0" />
 <span className="absolute right-[6px] top-[5px] h-2 w-2 rounded-full bg-[#071014]" />
 <span className="absolute left-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#071014]" />
 </span>
 );
}

function useAuthTheme() {
 const [isLight, setIsLight] = useState(false);

 useEffect(() => {
 const storedTheme = window.localStorage.getItem(AUTH_THEME_KEY);
 const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
 const nextIsLight = storedTheme ? storedTheme === "light" : prefersLight;
 setIsLight(nextIsLight);
 document.documentElement.style.colorScheme = nextIsLight ? "light" : "dark";
 }, []);

 const toggleTheme = () => {
 setIsLight((current) => {
 const next = !current;
 window.localStorage.setItem(AUTH_THEME_KEY, next ? "light" : "dark");
 document.documentElement.style.colorScheme = next ? "light" : "dark";
 return next;
 });
 };

 return [isLight, toggleTheme] as const;
}

function Brand() {
 return (
 <Link href="/" className="auth-brand-link inline-flex items-center gap-2.5" aria-label="Go to Crystal homepage" title="Go to homepage">
 <span className="auth-brand-mark inline-flex h-8 w-8 items-center justify-center rounded-lg">
 <img src="/Logopng.png" alt="Crystal homepage" className="h-8 w-8 object-contain" />
 </span>
 <span className="auth-brand text-[1.35rem] font-semibold tracking-[-0.03em]">Crystal</span>
 </Link>
 );
}

export default function LoginPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { update: updateSession } = useSession();
 const [isLight, toggleTheme] = useAuthTheme();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [verificationCode, setVerificationCode] = useState("");
 const [verificationStep, setVerificationStep] = useState<"credentials" | "code">("credentials");
 const [resendSeconds, setResendSeconds] = useState(0);

 useEffect(() => {
  const registeredEmail = searchParams.get("email");
  if (registeredEmail) setEmail(registeredEmail);
 }, [searchParams]);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const callbackUrl = searchParams.get("callbackUrl") || STUDIO_HOME;
 const registered = searchParams.get("registered") === "1";

 useEffect(() => {
  if (resendSeconds <= 0) return;
  const timer = window.setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
  return () => window.clearInterval(timer);
 }, [resendSeconds]);

 const handleOAuthSignIn = (provider: OAuthProvider) => {
 signIn(provider, { callbackUrl: STUDIO_HOME });
 };

 const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 setError(null);
 setIsSubmitting(true);

 if (verificationStep === "credentials") {
  const response = await fetch("/api/auth/request-login-code", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ email, password }),
  });
  const data = (await response.json()) as { error?: string };
  setIsSubmitting(false);
  if (!response.ok) {
   setError(data.error || "Could not send the verification code.");
   return;
  }
  setVerificationStep("code");
  setResendSeconds(30);
  return;
 }

 const result = await signIn("credentials", { email, password, verificationCode, redirect: false });

 setIsSubmitting(false);

 if (result?.error) {
 setError("That code is invalid or expired. Request a new code and try again.");
 setVerificationCode("");
 return;
 }

 await updateSession();
 router.replace(callbackUrl);
 router.refresh();
 };

 const handleResend = async () => {
  if (resendSeconds > 0 || isSubmitting) return;
  setError(null);
  setIsSubmitting(true);
  const response = await fetch("/api/auth/request-login-code", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ email, password }),
  });
  const data = (await response.json()) as { error?: string };
  setIsSubmitting(false);
  if (!response.ok) {
   setError(data.error || "Could not resend the verification code.");
   return;
  }
  setResendSeconds(30);
  setVerificationCode("");
 };

 return (
 <div className={`auth-page ${isLight ? "auth-light" : "auth-dark"}`}>
 <div className="auth-glow pointer-events-none fixed inset-x-0 top-0 h-[520px]" />
 <header className="absolute inset-x-0 top-0 z-10 mx-auto flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:px-10">
 <Brand />
 <div className="flex items-center gap-3">
 <button
 type="button"
 onClick={toggleTheme}
 className={`auth-theme-toggle inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${isLight ? "is-light" : "is-dark"}`}
 aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
 aria-pressed={isLight}
 title={isLight ? "Switch to dark mode" : "Switch to light mode"}
 >
 {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
 </button>
 <Link href="/signup" className="auth-top-link text-xs font-semibold transition-colors">
 Create account
 </Link>
 </div>
 </header>

 <main className="relative z-10 flex min-h-screen w-full items-center justify-center overflow-y-auto px-5 pb-8 pt-24">
 <Card className="auth-card w-full max-w-md rounded-[24px] border shadow-none backdrop-blur-xl">
 <CardHeader className="space-y-3 p-7 text-center">
 <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fccff]">Crystal Studio workspace</p>
 <h1 className="auth-title text-4xl font-semibold tracking-[-0.05em]">{verificationStep === "credentials" ? "Sign in" : "Check your email"}</h1>
 <p className="auth-copy mx-auto max-w-xs text-sm leading-6">
 {verificationStep === "credentials"
  ? "Open your Crystal workspace for Claude AI, OpenAI Codex, architecture, floor plans, 3D modeling, infrastructure planning, and professional project documentation."
  : <>We sent a 6-digit verification code to <strong className="auth-title font-semibold">{email}</strong>.</>}
 </p>
 </CardHeader>
 <CardContent className="space-y-5 p-7 pt-0">
 {verificationStep === "code" ? (
  <div className="auth-verification-panel space-y-5">
   <div className="auth-verification-icon mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
    <ShieldCheck className="h-7 w-7" />
   </div>
   <div className="space-y-2 text-center">
    <p className="auth-label text-sm font-semibold">Secure verification</p>
    <p className="auth-copy text-xs leading-5">Enter the code from your inbox to continue to Crystal Studio. It expires in 10 minutes.</p>
   </div>
   <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
     <Label htmlFor="verificationCode" className="auth-label text-xs font-medium">Verification code</Label>
     <div className="relative">
      <KeyRound className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input id="verificationCode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" autoComplete="one-time-code" required className="auth-input h-14 rounded-[10px] pl-9 text-center text-xl tracking-[0.35em] shadow-none focus-visible:ring-[#068fff]" />
     </div>
    </div>
    {error ? <p className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
    <Button type="submit" disabled={isSubmitting || verificationCode.length !== 6} className="h-11 w-full rounded-[10px] bg-[#068fff] text-sm font-semibold text-white shadow-none hover:bg-[#1b9dff]">
     {isSubmitting ? "Verifying..." : "Verify and open Studio"} <ArrowRight className="h-4 w-4" />
    </Button>
   </form>
   <div className="flex items-center justify-between text-xs">
    <button type="button" onClick={() => { setVerificationStep("credentials"); setVerificationCode(""); setError(null); }} className="auth-footer-link inline-flex items-center gap-1.5 font-semibold"><ArrowLeft className="h-3.5 w-3.5" /> Change email</button>
    <button type="button" onClick={handleResend} disabled={resendSeconds > 0 || isSubmitting} className="auth-footer-link inline-flex items-center gap-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend code"}</button>
   </div>
   <p className="auth-copy flex items-center justify-center gap-1.5 text-center text-[11px]"><CheckCircle2 className="h-3.5 w-3.5 text-[#35b8ff]" /> Your account stays protected with email verification.</p>
  </div>
 ) : (
 <>
 <div className="grid gap-2.5">
 {socialProviders.map((provider) => (
 <Button
 key={provider.id}
 type="button"
 variant="outline"
 onClick={() => handleOAuthSignIn(provider.id)}
 className="auth-social-button h-11 rounded-[10px] text-sm font-semibold shadow-none"
 >
 {provider.icon}
 {provider.label}
 </Button>
 ))}
 </div>

 <div className="flex items-center gap-3">
 <div className="auth-divider-line h-px flex-1" />
 <span className="auth-divider-label text-[10px] font-semibold uppercase tracking-[0.18em]">or email</span>
 <div className="auth-divider-line h-px flex-1" />
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="email" className="auth-label text-xs font-medium">
 Email
 </Label>
 <div className="relative">
 <Mail className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
 <Input
 id="email"
 type="email"
 value={email}
 onChange={(event) => setEmail(event.target.value)}
 placeholder="you@company.com"
 autoComplete="email"
 required
 className="auth-input h-11 rounded-[10px] pl-9 text-sm shadow-none focus-visible:ring-[#068fff]"
 />
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label htmlFor="password" className="auth-label text-xs font-medium">
 Password
 </Label>
 <Link href="/reset-password" className="auth-accent-link text-xs font-medium">
 Forgot?
 </Link>
 </div>
 <div className="relative">
 <Lock className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
 <Input
 id="password"
 type="password"
 value={password}
 onChange={(event) => setPassword(event.target.value)}
 placeholder="Enter your password"
 autoComplete="current-password"
 required
 className="auth-input h-11 rounded-[10px] pl-9 text-sm shadow-none focus-visible:ring-[#068fff]"
 />
 </div>
 </div>

 {error ? (
 <p className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
 {error}
 </p>
 ) : null}
 {registered ? (
  <p className="rounded-[10px] border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
   Account created. Sign in to receive your email verification code.
  </p>
 ) : null}

 <Button
 type="submit"
 disabled={isSubmitting}
 className="h-11 w-full rounded-[10px] bg-[#068fff] text-sm font-semibold text-white shadow-none hover:bg-[#1b9dff]"
 >
 {isSubmitting ? "Signing in..." : "Sign in to Studio"}
 <ArrowRight className="h-4 w-4" />
 </Button>
 </form>
 </>
 )}

 <p className="auth-footer-copy text-center text-xs">
 New to Crystal Studio?{" "}
 <Link href="/signup" className="auth-footer-link font-semibold">
 Create an account
 </Link>
 </p>
 </CardContent>
 </Card>
 </main>
 </div>
 );
}
