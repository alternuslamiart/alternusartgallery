"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is not valid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const inputEmail = formData.email.trim().toLowerCase();
    const inputPassword = formData.password;

    try {
      const result = await signIn("credentials", {
        email: inputEmail,
        password: inputPassword,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        setErrors({ password: "Invalid email or password" });
        setIsSubmitting(false);
        return;
      }

      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ password: "Invalid email or password" });
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      return;
    }

    setTimeout(() => {
      console.log("Password reset email sent to:", forgotEmail);
      setResetEmailSent(true);
    }, 1000);
  };

  const closeForgotPasswordDialog = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setResetEmailSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 px-6 py-10">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold tracking-[0.2em]">ALTERNUS</h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground mt-0.5">ART GALLERY</p>
            </Link>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
              <p className="text-sm text-muted-foreground">Welcome back to Alternus Art Gallery</p>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("github")}
                className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 px-4 text-xs text-muted-foreground uppercase tracking-wider">or sign in with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-gray-600">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-600">Password *</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2.5">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-[4px] border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-gray-600 cursor-pointer"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-gray-900 hover:underline font-medium">
                Create Account
              </Link>
            </p>

            {/* Footer */}
            <p className="text-center text-[11px] text-gray-400 leading-relaxed">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </p>
          </div>
        </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={closeForgotPasswordDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl">
          {!resetEmailSent ? (
            <>
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <DialogTitle className="text-center">Reset Password</DialogTitle>
                <DialogDescription className="text-center">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-email" className="text-xs font-medium text-gray-600">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForgotPasswordDialog}
                    className="flex-1 h-11 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-11 rounded-xl bg-gray-900 hover:bg-gray-800">
                    Send Reset Link
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <DialogTitle className="text-center">Email Sent!</DialogTitle>
                <DialogDescription className="text-center">
                  We&apos;ve sent a password reset link to <strong className="text-gray-900">{forgotEmail}</strong>. Please check your inbox and follow the instructions.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={closeForgotPasswordDialog} className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800">
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
