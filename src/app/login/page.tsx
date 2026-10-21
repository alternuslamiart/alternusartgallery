"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Activity, ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, KeyRound, Lock, Mail, Moon, RefreshCw, ShieldCheck, Sparkles, Sun, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./login.css";

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
 const [isLight, setIsLight] = useState(true);

 useEffect(() => {
 const storedTheme = window.localStorage.getItem(AUTH_THEME_KEY);
 const nextIsLight = storedTheme ? storedTheme === "light" : true;
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
 <Link href="/" className="auth-brand-link inline-flex items-center gap-2.5" aria-label="Go to Casynus homepage" title="Go to homepage">
 <span className="auth-brand-mark inline-flex h-8 w-8 items-center justify-center rounded-lg">
 <Image src="/Logopng.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
 </span>
 <span className="auth-brand text-[1.35rem] font-semibold tracking-[-0.03em]">Casynus</span>
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
 const requestedCallback = searchParams.get("callbackUrl");
 const callbackUrl = requestedCallback?.startsWith("/") && !requestedCallback.startsWith("//") ? requestedCallback : STUDIO_HOME;
 const registered = searchParams.get("registered") === "1";

 useEffect(() => {
  if (resendSeconds <= 0) return;
  const timer = window.setInterval(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
  return () => window.clearInterval(timer);
 }, [resendSeconds]);

 const handleOAuthSignIn = (provider: OAuthProvider) => {
 signIn(provider, { callbackUrl });
 };

 const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
 event.preventDefault();
 setError(null);
 setIsSubmitting(true);

 if (verificationStep === "credentials") {
  try {
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
  } catch {
   setIsSubmitting(false);
   setError("Could not connect to the sign-in service. Please try again.");
   return;
  }
 }

 try {
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
 } catch {
  setIsSubmitting(false);
  setError("Could not complete sign-in. Please try again.");
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
  try {
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
  } catch {
   setIsSubmitting(false);
   setError("Could not resend the code. Please try again.");
  }
 };

 return (
 <main className={`auth-page auth-login-page auth-soft ${isLight ? "auth-light" : "auth-dark"}`}>
 <div className="auth-soft-shell">
 <section className="auth-soft-form-side" aria-label="Sign in to Casynus">
 <header className="auth-soft-header">
  <Brand />
  <div className="auth-soft-header-actions">
   <button type="button" onClick={toggleTheme} className="auth-theme-toggle auth-soft-theme" aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"} aria-pressed={isLight} title={isLight ? "Switch to dark mode" : "Switch to light mode"}>
    {isLight ? <Moon size={16} /> : <Sun size={16} />}
   </button>
   <Link href="/signup" className="auth-soft-header-link">Create account <ArrowRight size={14} /></Link>
  </div>
 </header>

 <div className="auth-soft-form-center">
 <div className="auth-soft-intro">
  <div className="auth-soft-intro-mark" aria-hidden="true"><Sparkles size={22} strokeWidth={1.8} /></div>
  <p className="auth-soft-eyebrow">CASYNUS STUDIO</p>
  <h1 className="auth-soft-page-title">{verificationStep === "credentials" ? "Welcome back" : verificationStep === "code" ? "Check your inbox" : "One last detail"}</h1>
  <p className="auth-soft-subtitle">{verificationStep === "credentials" ? "Sign in to continue creating in your workspace." : verificationStep === "code" ? <>Enter the code sent to <strong>{email}</strong>.</> : "Complete your account setup to enter the studio."}</p>
 </div>
 <Card className="auth-card auth-login-card auth-soft-card">
 <CardContent className="space-y-5 px-7 pb-8 sm:px-9 sm:pb-10">
 {verificationStep === "code" ? (
  <div className="auth-verification-panel space-y-5">
   <div className="auth-verification-icon mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
    <ShieldCheck className="h-7 w-7" />
   </div>
   <div className="space-y-2 text-center">
    <p className="auth-label text-sm font-semibold">Secure verification</p>
    <p className="auth-copy text-xs leading-5">Enter the code from your inbox to continue to Casynus Studio. It expires in 10 minutes.</p>
   </div>
   <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
     <Label htmlFor="verificationCode" className="auth-label text-xs font-medium">Verification code</Label>
     <div className="relative">
      <KeyRound className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input id="verificationCode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" autoComplete="one-time-code" required className="auth-input h-14 rounded-[10px] pl-9 text-center text-xl tracking-[0.35em] shadow-none focus-visible:ring-[#068fff]" />
     </div>
    </div>
    {error ? <p role="alert" className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
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
    <p role="alert" className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
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
 <p role="alert" className="rounded-[10px] border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
 {error}
 </p>
 ) : null}
 {registered ? (
  <p role="status" className="rounded-[10px] border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
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
 New to Casynus Studio?{" "}
 <Link href="/signup" className="auth-footer-link font-semibold">
 Create an account
 </Link>
 </p>
 </CardContent>
 </Card>
 <p className="auth-login-privacy">Protected access to your projects and account.</p>
 </div>
 <footer className="auth-soft-footer"><span>© {new Date().getFullYear()} Casynus Studio</span><Link href="/privacy">Privacy</Link></footer>
 </section>

 <aside className="auth-soft-showcase" aria-label="Casynus Studio overview">
  <div className="auth-soft-showcase-head"><span className="auth-soft-showcase-label"><span className="auth-soft-showcase-dot" /> THE CREATIVE WORKSPACE</span><Link href="/signup" className="auth-soft-showcase-link">Get started <ArrowRight size={15} /></Link></div>
  <div className="auth-soft-showcase-copy"><span className="auth-soft-overline">IDEAS INTO BUILT FORM</span><h2>Design your next<br />great space.</h2><p>Bring architecture, interiors and 3D concepts together in one calm workspace. Shape an idea, explore options, and keep moving.</p></div>
  <div className="auth-soft-art" aria-hidden="true"><div className="auth-soft-art-shadow" /><div className="auth-soft-art-tile"><div className="auth-soft-art-tile-inner"><Bot size={64} strokeWidth={1.35} /></div></div><div className="auth-soft-art-spark auth-soft-art-spark-one"><Sparkles size={15} /></div><div className="auth-soft-art-spark auth-soft-art-spark-two"><Sparkles size={11} /></div></div>
  <div className="auth-soft-activity" aria-label="Studio capabilities"><div className="auth-soft-activity-row"><span className="auth-soft-activity-icon"><Workflow size={17} /></span><span><strong>Plan a space</strong><small>Move from concept to a working layout</small></span><Check size={16} /></div><div className="auth-soft-activity-row"><span className="auth-soft-activity-icon"><Sparkles size={17} /></span><span><strong>Explore ideas</strong><small>Develop architecture and interior concepts</small></span><Check size={16} /></div><div className="auth-soft-activity-row"><span className="auth-soft-activity-icon"><Activity size={17} /></span><span><strong>Refine the details</strong><small>Keep your creative work in one place</small></span><Check size={16} /></div></div>
  <div className="auth-soft-showcase-foot"><span>ONE SPACE FOR WHAT’S NEXT</span><span>CASYNUS / STUDIO</span></div>
 </aside>
 </div>
 </main>
 );
}
