"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Box, CheckCircle2, KeyRound, Layers3, Lock, Mail, Moon, RefreshCw, ShieldCheck, Sparkles, Sun } from "lucide-react";
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
 icon: (
 <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
 </svg>
 ),
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
 const [verificationStep, setVerificationStep] = useState<"credentials" | "code" | "age">("credentials");
 const [age, setAge] = useState("");
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

 if (result?.error) {
 setIsSubmitting(false);
 setError("That code is invalid or expired. Request a new code and try again.");
 setVerificationCode("");
 return;
 }

 try {
 await updateSession();
 const ageResponse = await fetch("/api/auth/age", { cache: "no-store" });
 const ageData = (await ageResponse.json()) as { age?: number | null; error?: string };
 if (!ageResponse.ok) {
  setVerificationStep("age");
  setIsSubmitting(false);
  setError(ageData.error || "Could not check your age. Enter it below to continue.");
  return;
 }
 if (typeof ageData.age === "number") {
  setIsSubmitting(false);
  router.replace(callbackUrl);
  router.refresh();
  return;
 }

 setVerificationStep("age");
 setIsSubmitting(false);
 } catch {
 setVerificationStep("age");
 setIsSubmitting(false);
 setError("Could not check your age. Enter it below to continue.");
 }
 };

 const handleAgeSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);
  setIsSubmitting(true);

  try {
   const response = await fetch("/api/auth/age", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ age: Number(age) }),
   });
   const data = (await response.json()) as { error?: string };
   if (!response.ok) {
    setError(data.error || "Could not save your age.");
    return;
   }

   router.replace(callbackUrl);
   router.refresh();
  } catch {
   setError("Could not save your age. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
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
 <div className={`auth-page auth-login-page ${isLight ? "auth-light" : "auth-dark"}`}>
 <div className="auth-glow pointer-events-none fixed inset-x-0 top-0 h-[520px]" />
 <header className="auth-login-header relative z-10 mx-auto flex h-[76px] w-full items-center justify-between px-5 sm:px-8">
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
 <span className="auth-login-header-label hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:block">AI design workspace</span>
 <Link href="/signup" className="auth-create-link text-xs font-semibold transition-colors">Create account <ArrowRight className="h-3.5 w-3.5" /></Link>
 </div>
 </header>

 <main className="auth-login-main relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)] lg:gap-16 lg:px-12 lg:py-10">
 <section className="auth-showcase relative hidden min-h-[650px] overflow-hidden rounded-[28px] lg:block" aria-label="Crystal AI architecture and CAD studio">
  <Image src="/Section/architectresectionone.png" alt="Contemporary architectural design by Crystal Studio" fill priority sizes="(max-width: 1200px) 50vw, 58vw" className="auth-showcase-image object-cover" />
  <div className="auth-showcase-shade absolute inset-0" />
  <div className="auth-showcase-grid absolute inset-0" />
  <div className="relative flex h-full flex-col justify-between p-9 xl:p-12">
   <div className="flex items-center justify-between">
    <span className="auth-showcase-badge inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]"><Sparkles className="h-3.5 w-3.5" /> AI-powered design</span>
    <span className="auth-showcase-index font-mono text-[11px] tracking-[0.18em]">CRYSTAL / 01</span>
   </div>
   <div className="max-w-[560px]">
    <p className="auth-showcase-kicker mb-4 text-[11px] font-semibold uppercase tracking-[0.24em]">Imagine it. Shape it. Build with clarity.</p>
    <h2 className="auth-showcase-title text-4xl font-semibold leading-[1.04] tracking-[-0.045em] xl:text-[52px]">Your next great space starts with an idea.</h2>
    <p className="auth-showcase-copy mt-5 max-w-[460px] text-sm leading-6">Bring architecture, interiors and CAD into one intelligent studio— from the first sketch to a detailed 3D vision.</p>
    <div className="mt-8 flex flex-wrap gap-2.5">
     <span className="auth-capability-chip"><Layers3 className="h-4 w-4" /> Architecture</span>
     <span className="auth-capability-chip"><Sparkles className="h-4 w-4" /> AI design</span>
     <span className="auth-capability-chip"><Box className="h-4 w-4" /> 3D & CAD</span>
    </div>
   </div>
   <div className="auth-showcase-note flex items-center justify-between gap-4 border-t pt-5">
    <span className="text-xs">A thoughtful workspace for your next project.</span>
    <span className="font-mono text-[10px] tracking-[0.14em]">DESIGN / VISUALIZE / REFINE</span>
   </div>
  </div>
 </section>

 <section className="auth-login-form-wrap mx-auto w-full max-w-[460px]">
 <Card className="auth-card auth-login-card w-full rounded-[24px] border shadow-none backdrop-blur-xl">
 <CardHeader className="space-y-3 px-7 pb-6 pt-8 sm:px-9 sm:pt-10">
 <p className="auth-kicker flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]"><span className="auth-status-dot" /> Crystal Studio / Secure access</p>
 <h1 className="auth-title text-[34px] font-semibold tracking-[-0.05em] sm:text-[38px]">
  {verificationStep === "credentials" ? "Welcome back." : verificationStep === "code" ? "Check your inbox." : "One last detail."}
 </h1>
 <p className="auth-copy text-sm leading-6">
 {verificationStep === "credentials"
  ? "Sign in to continue designing with AI, architecture and 3D tools."
  : verificationStep === "code"
   ? <>We sent a 6-digit verification code to <strong className="auth-title font-semibold">{email}</strong>.</>
   : "Enter your age to finish setting up your Crystal Studio account."}
 </p>
 </CardHeader>
 <CardContent className="space-y-5 px-7 pb-8 sm:px-9 sm:pb-10">
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
 ) : verificationStep === "age" ? (
  <form onSubmit={handleAgeSubmit} className="space-y-4">
   <div className="space-y-2">
    <Label htmlFor="age" className="auth-label text-xs font-medium">Age</Label>
    <Input
     id="age"
     type="number"
     inputMode="numeric"
     min={1}
     max={120}
     step={1}
     value={age}
     onChange={(event) => setAge(event.target.value)}
     placeholder="Enter your age"
     autoComplete="off"
     required
     className="auth-input h-11 rounded-[10px] text-sm shadow-none focus-visible:ring-[#068fff]"
    />
   </div>
   {error ? (
    <p className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
   ) : null}
   <Button
    type="submit"
    disabled={isSubmitting || !age}
    className="h-11 w-full rounded-[10px] bg-[#068fff] text-sm font-semibold text-white shadow-none hover:bg-[#1b9dff]"
   >
    {isSubmitting ? "Saving..." : "Continue to Studio"}
    <ArrowRight className="h-4 w-4" />
   </Button>
  </form>
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
 <p className="auth-login-privacy mt-5 text-center text-[11px] leading-5">Your projects and account details stay protected.</p>
 </section>
 </main>
 </div>
 );
}
