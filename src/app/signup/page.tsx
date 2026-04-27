"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ArrowLeft, Eye, EyeOff, Check, X, User, Lock, Globe, Phone } from "lucide-react";
import { AlternusLogo } from "@/components/alternus-shell";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const countries = [
    { code: "AL", name: "Albania", phonePlaceholder: "+355" },
    { code: "AD", name: "Andorra", phonePlaceholder: "+376" },
    { code: "AT", name: "Austria", phonePlaceholder: "+43" },
    { code: "BY", name: "Belarus", phonePlaceholder: "+375" },
    { code: "BE", name: "Belgium", phonePlaceholder: "+32" },
    { code: "BA", name: "Bosnia and Herzegovina", phonePlaceholder: "+387" },
    { code: "BG", name: "Bulgaria", phonePlaceholder: "+359" },
    { code: "HR", name: "Croatia", phonePlaceholder: "+385" },
    { code: "CY", name: "Cyprus", phonePlaceholder: "+357" },
    { code: "CZ", name: "Czech Republic", phonePlaceholder: "+420" },
    { code: "DK", name: "Denmark", phonePlaceholder: "+45" },
    { code: "EE", name: "Estonia", phonePlaceholder: "+372" },
    { code: "FI", name: "Finland", phonePlaceholder: "+358" },
    { code: "FR", name: "France", phonePlaceholder: "+33" },
    { code: "DE", name: "Germany", phonePlaceholder: "+49" },
    { code: "GR", name: "Greece", phonePlaceholder: "+30" },
    { code: "HU", name: "Hungary", phonePlaceholder: "+36" },
    { code: "IS", name: "Iceland", phonePlaceholder: "+354" },
    { code: "IE", name: "Ireland", phonePlaceholder: "+353" },
    { code: "IT", name: "Italy", phonePlaceholder: "+39" },
    { code: "XK", name: "Kosovo", phonePlaceholder: "+383" },
    { code: "LV", name: "Latvia", phonePlaceholder: "+371" },
    { code: "LI", name: "Liechtenstein", phonePlaceholder: "+423" },
    { code: "LT", name: "Lithuania", phonePlaceholder: "+370" },
    { code: "LU", name: "Luxembourg", phonePlaceholder: "+352" },
    { code: "MT", name: "Malta", phonePlaceholder: "+356" },
    { code: "MD", name: "Moldova", phonePlaceholder: "+373" },
    { code: "MC", name: "Monaco", phonePlaceholder: "+377" },
    { code: "ME", name: "Montenegro", phonePlaceholder: "+382" },
    { code: "NL", name: "Netherlands", phonePlaceholder: "+31" },
    { code: "MK", name: "North Macedonia", phonePlaceholder: "+389" },
    { code: "NO", name: "Norway", phonePlaceholder: "+47" },
    { code: "PL", name: "Poland", phonePlaceholder: "+48" },
    { code: "PT", name: "Portugal", phonePlaceholder: "+351" },
    { code: "RO", name: "Romania", phonePlaceholder: "+40" },
    { code: "SM", name: "San Marino", phonePlaceholder: "+378" },
    { code: "SK", name: "Slovakia", phonePlaceholder: "+421" },
    { code: "SI", name: "Slovenia", phonePlaceholder: "+386" },
    { code: "ES", name: "Spain", phonePlaceholder: "+34" },
    { code: "SE", name: "Sweden", phonePlaceholder: "+46" },
    { code: "CH", name: "Switzerland", phonePlaceholder: "+41" },
    { code: "TR", name: "Turkey", phonePlaceholder: "+90" },
    { code: "UA", name: "Ukraine", phonePlaceholder: "+380" },
    { code: "GB", name: "United Kingdom", phonePlaceholder: "+44" },
    { code: "VA", name: "Vatican City", phonePlaceholder: "+39" },
    { code: "US", name: "United States", phonePlaceholder: "+1" },
    { code: "CA", name: "Canada", phonePlaceholder: "+1" },
    { code: "AU", name: "Australia", phonePlaceholder: "+61" },
    { code: "NZ", name: "New Zealand", phonePlaceholder: "+64" },
    { code: "JP", name: "Japan", phonePlaceholder: "+81" },
    { code: "KR", name: "South Korea", phonePlaceholder: "+82" },
    { code: "CN", name: "China", phonePlaceholder: "+86" },
    { code: "IN", name: "India", phonePlaceholder: "+91" },
    { code: "BR", name: "Brazil", phonePlaceholder: "+55" },
    { code: "MX", name: "Mexico", phonePlaceholder: "+52" },
    { code: "AR", name: "Argentina", phonePlaceholder: "+54" },
    { code: "ZA", name: "South Africa", phonePlaceholder: "+27" },
    { code: "AE", name: "United Arab Emirates", phonePlaceholder: "+971" },
    { code: "SA", name: "Saudi Arabia", phonePlaceholder: "+966" },
    { code: "PS", name: "Palestine", phonePlaceholder: "+970" },
    { code: "EG", name: "Egypt", phonePlaceholder: "+20" },
    { code: "NG", name: "Nigeria", phonePlaceholder: "+234" },
    { code: "KE", name: "Kenya", phonePlaceholder: "+254" },
    { code: "SG", name: "Singapore", phonePlaceholder: "+65" },
    { code: "MY", name: "Malaysia", phonePlaceholder: "+60" },
    { code: "TH", name: "Thailand", phonePlaceholder: "+66" },
    { code: "ID", name: "Indonesia", phonePlaceholder: "+62" },
    { code: "PH", name: "Philippines", phonePlaceholder: "+63" },
    { code: "VN", name: "Vietnam", phonePlaceholder: "+84" },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOAuthSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(["", "", "", "", "", ""]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_generatedCode, setGeneratedCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVerification && !canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showVerification, canResend, resendTimer]);

  const sendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, action: 'send' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.error || 'Failed to send verification code' });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      setErrors({ email: 'Failed to send verification code. Please try again.' });
      return false;
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        setTimeout(() => handleVerifyCode(fullCode), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || verificationCode.join("");

    if (code.length !== 6) {
      setVerificationError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setVerificationError("");

    try {
      const verifyResponse = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setVerificationError(verifyData.error || "Invalid verification code");
        setIsVerifying(false);
        return;
      }

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          country: formData.country,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setVerificationError(registerData.error || "Failed to create account");
        setIsVerifying(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        window.location.href = '/';
      } else {
        window.location.href = '/login?verified=true';
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationError("An error occurred. Please try again.");
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setCanResend(false);
    setResendTimer(60);
    setVerificationCode(["", "", "", "", "", ""]);
    setVerificationError("");

    const success = await sendVerificationEmail();
    if (success) {
      inputRefs.current[0]?.focus();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is not valid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
      const hasMinLength = formData.password.length >= 8;

      if (!hasMinLength) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!hasUpperCase) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!hasNumber) {
        newErrors.password = "Password must contain at least one number";
      } else if (!hasSymbol) {
        newErrors.password = "Password must contain at least one symbol (!@#$%^&*...)";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted || !privacyAccepted) {
      alert("Please accept Alternus Art Gallery policies to continue.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await sendVerificationEmail();

      if (success) {
        setShowVerification(true);
        setCanResend(false);
        setResendTimer(60);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ ...errors, email: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setVerificationCode(["", "", "", "", "", ""]);
    setVerificationError("");
    setGeneratedCode("");
  };

  const passwordChecks = [
    { label: "8+ characters", met: formData.password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(formData.password) },
    { label: "Number", met: /[0-9]/.test(formData.password) },
    { label: "Symbol", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6fb] text-[#1f1f1f]">
      <div className="pointer-events-none absolute inset-0 opacity-100 [background-image:linear-gradient(rgba(66,132,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(66,132,255,0.08)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_center,black_34%,transparent_88%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(66,132,255,0.14),transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(114,161,255,0.12),transparent_72%)] blur-3xl" />

      <header className="relative z-10 flex items-center justify-between gap-4 px-6 pb-2 pt-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-[#1f1f1f] no-underline">
          <AlternusLogo size={28} radius={8} />
          <span className="text-[15px] font-extrabold tracking-[-0.02em]">ALTERNUS</span>
        </Link>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="hidden sm:inline">Already have an account?</span>
          <Link href="/login" className="font-bold text-[#4284FF] no-underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-[1180px]">
          <div className="mx-auto w-full max-w-[620px] rounded-[2rem] border border-[rgba(66,132,255,0.1)] bg-white/95 p-6 shadow-[0_30px_90px_rgba(66,132,255,0.14)] backdrop-blur-xl sm:p-8">
            <div className="mb-7 text-center">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#4284FF]">
                {showVerification ? "Verify / Workspace" : "Sign up / Workspace"}
              </div>
              <h1 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.05em] text-slate-950">
                {showVerification ? "Check your email." : "Create your account."}
              </h1>
              <p className="mx-auto mt-3 max-w-[30rem] text-sm leading-6 text-slate-500 sm:text-[15px]">
                {showVerification
                  ? "Enter the 6-digit code we sent to continue into Alternus."
                  : "A cleaner account flow with one focused card, centered on the page."}
              </p>
            </div>

            {showVerification ? (
              <div className="space-y-6">
                <div className="rounded-[1.5rem] border border-[rgba(66,132,255,0.12)] bg-[linear-gradient(180deg,rgba(247,250,255,0.96),rgba(255,255,255,0.94))] p-5 text-center sm:p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#4284FF]/10 text-[#4284FF]">
                    <Mail className="h-7 w-7" />
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    We sent a code to <span className="font-semibold text-slate-900">{formData.email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2 sm:gap-3">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`h-14 w-11 rounded-2xl border text-center text-xl font-semibold outline-none transition-all sm:w-12 ${
                        digit
                          ? "border-[#4284FF] bg-[#4284FF]/8 text-[#1f1f1f]"
                          : "border-slate-200 bg-slate-50/70 hover:border-slate-300 focus:border-[#4284FF] focus:bg-[#4284FF]/5"
                      }`}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {verificationError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    {verificationError}
                  </div>
                ) : null}

                <Button
                  onClick={() => handleVerifyCode()}
                  className="h-12 w-full rounded-2xl bg-[#4284FF] text-sm font-bold text-white shadow-[0_18px_34px_rgba(66,132,255,0.22)] hover:bg-[#3273f2]"
                  disabled={isVerifying || verificationCode.join("").length !== 6}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify and create account"
                  )}
                </Button>

                <div className="text-center text-sm text-slate-500">
                  <span>Didn&apos;t receive it? </span>
                  {canResend ? (
                    <button onClick={handleResendCode} className="font-semibold text-[#4284FF] transition-colors hover:text-[#3273f2]">
                      Resend code
                    </button>
                  ) : (
                    <span>
                      Resend in <span className="font-semibold text-slate-900">{resendTimer}s</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleBackToSignup}
                  className="mx-auto flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
                  disabled={isVerifying}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign up
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("google")}
                    className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm font-semibold text-slate-700 transition-all hover:border-[#4284FF]/30 hover:bg-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn("github")}
                    className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm font-semibold text-slate-700 transition-all hover:border-[#4284FF]/30 hover:bg-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    Continue with GitHub
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-slate-400">Or with email</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        First name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={formData.firstName}
                          onChange={(e) => {
                            setFormData({ ...formData, firstName: e.target.value });
                            if (errors.firstName) setErrors({ ...errors, firstName: "" });
                          }}
                          className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 focus:border-[#4284FF] focus:bg-white ${errors.firstName ? "border-red-300 bg-red-50/30" : ""}`}
                        />
                      </div>
                      {errors.firstName ? <p className="text-xs text-red-500">{errors.firstName}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Last name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChange={(e) => {
                            setFormData({ ...formData, lastName: e.target.value });
                            if (errors.lastName) setErrors({ ...errors, lastName: "" });
                          }}
                          className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 focus:border-[#4284FF] focus:bg-white ${errors.lastName ? "border-red-300 bg-red-50/30" : ""}`}
                        />
                      </div>
                      {errors.lastName ? <p className="text-xs text-red-500">{errors.lastName}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 focus:border-[#4284FF] focus:bg-white ${errors.email ? "border-red-300 bg-red-50/30" : ""}`}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email ? <p className="text-xs text-red-500">{errors.email}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Country
                      </Label>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          id="country"
                          value={formData.country}
                          onChange={(e) => {
                            setFormData({ ...formData, country: e.target.value });
                            if (errors.country) setErrors({ ...errors, country: "" });
                          }}
                          className={`flex h-12 w-full appearance-none rounded-2xl border bg-slate-50/70 pl-10 pr-3 text-sm outline-none transition-all focus:border-[#4284FF] focus:bg-white ${
                            errors.country ? "border-red-300 bg-red-50/30" : "border-slate-200"
                          }`}
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.country ? <p className="text-xs text-red-500">{errors.country}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Phone number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={
                            formData.country
                              ? countries.find((c) => c.code === formData.country)?.phonePlaceholder + " ..."
                              : "+355 69 123 4567"
                          }
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                          }}
                          className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 focus:border-[#4284FF] focus:bg-white ${errors.phone ? "border-red-300 bg-red-50/30" : ""}`}
                          autoComplete="tel"
                        />
                      </div>
                      {errors.phone ? <p className="text-xs text-red-500">{errors.phone}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 pr-10 focus:border-[#4284FF] focus:bg-white ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password ? <p className="text-xs text-red-500">{errors.password}</p> : null}
                    {formData.password ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {passwordChecks.map((check) => (
                          <span
                            key={check.label}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                              check.met
                                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                : "border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          >
                            {check.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {check.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                        }}
                        className={`h-12 rounded-2xl border-slate-200 bg-slate-50/70 pl-10 pr-10 focus:border-[#4284FF] focus:bg-white ${errors.confirmPassword ? "border-red-300 bg-red-50/30" : ""}`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword ? <p className="text-xs text-red-500">{errors.confirmPassword}</p> : null}
                    {formData.confirmPassword && formData.password === formData.confirmPassword ? (
                      <p className="flex items-center gap-1 text-xs text-emerald-600">
                        <Check className="h-3 w-3" /> Passwords match
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Policies</p>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-0.5 rounded-[4px] border-slate-300 data-[state=checked]:border-[#4284FF] data-[state=checked]:bg-[#4284FF]"
                      />
                      <label htmlFor="terms" className="cursor-pointer text-xs leading-relaxed text-slate-600">
                        I accept the{" "}
                        <Link href="/terms" className="font-medium text-slate-900 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        for using Alternus.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="privacy"
                        checked={privacyAccepted}
                        onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                        className="mt-0.5 rounded-[4px] border-slate-300 data-[state=checked]:border-[#4284FF] data-[state=checked]:bg-[#4284FF]"
                      />
                      <label htmlFor="privacy" className="cursor-pointer text-xs leading-relaxed text-slate-600">
                        I accept the{" "}
                        <Link href="/privacy" className="font-medium text-slate-900 hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        and agree to account processing.
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-[#4284FF] text-sm font-bold text-white shadow-[0_18px_34px_rgba(66,132,255,0.22)] hover:bg-[#3273f2]"
                    disabled={!termsAccepted || !privacyAccepted || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </div>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500">
                  <span>
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-[#4284FF] hover:underline">
                      Sign in
                    </Link>
                  </span>
                  <span className="text-xs">Secure workspace onboarding</span>
                </div>

                <p className="text-center text-[11px] leading-relaxed text-slate-400">
                  By signing up, you agree to our terms and consent to receive account emails from Alternus.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
