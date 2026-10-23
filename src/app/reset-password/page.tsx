"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Info, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";

const AUTH_THEME_KEY = "Coreforge_auth_theme";

function useAuthTheme() {
 const [isLight, setIsLight] = useState(false);

 useEffect(() => {
  const storedTheme = window.localStorage.getItem(AUTH_THEME_KEY);
  const nextIsLight = storedTheme ? storedTheme === "light" : false;
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

function Message({ children, success = false }: { children: React.ReactNode; success?: boolean }) {
 return (
  <p role={success ? "status" : "alert"} className={`rounded-[10px] border px-3 py-2 text-sm ${success
   ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
   : "border-red-400/20 bg-red-500/10 text-red-200"}`}>
   {children}
  </p>
 );
}

export default function ResetPasswordPage() {
 const searchParams = useSearchParams();
 const token = searchParams.get("token");
 const [isLight, toggleTheme] = useAuthTheme();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);
  setIsSubmitting(true);
  try {
   const response = await fetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
   });
   const data = (await response.json()) as { error?: string };
   if (!response.ok) setError(data.error || "Could not send the reset link.");
   else setSuccess(true);
  } catch {
   setError("Could not send the reset link. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const handleReset = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);
  if (password.length < 8) {
   setError("Password must be at least 8 characters.");
   return;
  }
  if (password !== confirmPassword) {
   setError("Passwords do not match.");
   return;
  }
  setIsSubmitting(true);
  try {
   const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
   });
   const data = (await response.json()) as { error?: string };
   if (!response.ok) setError(data.error || "This reset link is invalid or expired.");
   else setSuccess(true);
  } catch {
   setError("Could not reset your password. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const isResetForm = Boolean(token);
 return (
  <AuthShell isLight={isLight} onToggleTheme={toggleTheme}>
   <div className="auth-soft-form-center">
     <div className="auth-soft-intro" aria-live="polite">
      <h1 className="auth-soft-page-title">{success ? "You're all set" : isResetForm ? "Create new password" : "Forgot password?"}</h1>
      <p className="auth-soft-subtitle">
       {success
        ? isResetForm ? "Your password has been updated. You can now sign in with your new password." : "If an account exists for that email, you will receive a password reset link shortly."
        : isResetForm ? "Choose a strong password to secure your Casynus workspace." : "Enter your email and we’ll send you a secure link to reset your password."}
      </p>
     </div>
    <Card className="auth-card">
     <CardContent className="space-y-5">
      {success ? (
       <div className="space-y-5 text-center">
        <div className="auth-verification-icon mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"><CheckCircle2 className="h-7 w-7" /></div>
        <Button asChild className="auth-reset-return h-11 w-full rounded-lg text-sm font-semibold shadow-none"><Link href="/login">Back to sign in <ArrowRight className="h-4 w-4" /></Link></Button>
       </div>
      ) : (
       <form onSubmit={isResetForm ? handleReset : handleRequest} className="space-y-4">
        {isResetForm ? (
         <>
          <div className="space-y-2">
           <Label htmlFor="password" className="auth-label text-xs font-medium">New password</Label>
           <div className="relative"><Lock className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" autoComplete="new-password" required className="auth-input h-11 rounded-[10px] pl-9 text-sm shadow-none focus-visible:ring-[#068fff]" /></div>
          </div>
          <div className="space-y-2">
           <Label htmlFor="confirmPassword" className="auth-label text-xs font-medium">Confirm new password</Label>
           <div className="relative"><Lock className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required className="auth-input h-11 rounded-[10px] pl-9 text-sm shadow-none focus-visible:ring-[#068fff]" /></div>
          </div>
          <p className="auth-copy flex items-center gap-2 text-xs"><Info className="h-3.5 w-3.5" /> Use at least 8 characters.</p>
         </>
        ) : (
         <div className="space-y-2">
          <Label htmlFor="email" className="auth-label text-xs font-medium">Email</Label>
          <div className="relative"><Mail className="auth-input-icon absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required className="auth-input h-11 rounded-[10px] pl-9 text-sm shadow-none focus-visible:ring-[#068fff]" /></div>
         </div>
        )}
        {error ? <Message>{error}</Message> : null}
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-[10px] bg-[#068fff] text-sm font-semibold text-white shadow-none hover:bg-[#1b9dff]">
         {isSubmitting ? (isResetForm ? "Updating password..." : "Sending reset link...") : (isResetForm ? "Reset password" : "Send reset link")} <ArrowRight className="h-4 w-4" />
        </Button>
       </form>
      )}
      {!success && !isResetForm ? <p className="auth-copy flex items-center justify-center gap-1.5 text-center text-xs"><Check className="h-3.5 w-3.5 text-[#35b8ff]" /> Your account stays protected.</p> : null}
      {!success && <p className="auth-footer-copy text-center text-xs"><Link href="/login" className="auth-footer-link inline-flex items-center gap-1.5 font-semibold"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</Link></p>}
     </CardContent>
    </Card>
   </div>
  </AuthShell>
 );
}
