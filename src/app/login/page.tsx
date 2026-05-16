"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Lock, Mail, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STUDIO_HOME = "/ai-assistant";
const AUTH_THEME_KEY = "Cedium_auth_theme";

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

function CediumMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#068fff]" aria-hidden="true">
      <span className="absolute inset-[4px] rounded-full border-[3px] border-[#071014] border-r-white/0 border-t-white/0" />
      <span className="absolute right-[6px] top-[5px] h-2 w-2 rounded-full bg-[#071014]" />
      <span className="absolute left-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#071014]" />
    </span>
  );
}

function useAuthTheme() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(window.localStorage.getItem(AUTH_THEME_KEY) === "light");
  }, []);

  const toggleTheme = () => {
    setIsLight((current) => {
      const next = !current;
      window.localStorage.setItem(AUTH_THEME_KEY, next ? "light" : "dark");
      return next;
    });
  };

  return [isLight, toggleTheme] as const;
}

function Brand() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Cedium home">
      <CediumMark />
      <span className="auth-brand text-[1.35rem] font-semibold tracking-[-0.03em]">Cedium</span>
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLight, toggleTheme] = useAuthTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackUrl = searchParams.get("callbackUrl") || STUDIO_HOME;

  const handleOAuthSignIn = (provider: OAuthProvider) => {
    signIn(provider, { callbackUrl: STUDIO_HOME });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Email or password is incorrect.");
      return;
    }

    router.replace(callbackUrl);
  };

  return (
    <div className={`auth-page ${isLight ? "auth-light" : "auth-dark"}`}>
      <div className="auth-glow pointer-events-none fixed inset-x-0 top-0 h-[520px]" />
      <header className="relative z-10 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Brand />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="auth-theme-toggle inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link href="/signup" className="auth-top-link text-xs font-semibold transition-colors">
            Create account
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pb-16 pt-8">
        <Card className="auth-card w-full max-w-md rounded-[24px] border shadow-none backdrop-blur-xl">
          <CardHeader className="space-y-3 p-7 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fccff]">Cedium workspace</p>
            <h1 className="auth-title text-4xl font-semibold tracking-[-0.05em]">Sign in</h1>
            <p className="auth-copy mx-auto max-w-xs text-sm leading-6">
              Open your AI platform studio for code, 3D, and technical workflows.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-7 pt-0">
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-[10px] bg-[#068fff] text-sm font-semibold text-white shadow-none hover:bg-[#1b9dff]"
              >
                {isSubmitting ? "Signing in..." : "Sign in to Studio"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="auth-footer-copy text-center text-xs">
              New to Cedium?{" "}
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
