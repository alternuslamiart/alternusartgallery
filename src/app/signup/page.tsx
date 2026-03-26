"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, ArrowLeft, Eye, EyeOff, Check, X, User, Lock, Globe, Phone, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex">
      {/* Left Side - Decorative Panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
        {/* Soft overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-block group">
              <h1 className="text-2xl font-bold tracking-[0.2em] group-hover:tracking-[0.25em] transition-all duration-500">ALTERNUS</h1>
              <p className="text-xs tracking-[0.3em] text-white/50 mt-1">ART GALLERY</p>
            </Link>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="text-4xl font-light leading-tight">
                Begin Your<br />
                <span className="font-semibold">Artistic Journey</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-sm">
                Join a community of passionate artists and collectors. Discover, create, and share extraordinary art.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                "Showcase your artwork to a global audience",
                "Connect with collectors and art enthusiasts",
                "Secure transactions and artist protection",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white/70" />
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="border-t border-white/10 pt-6">
            <p className="text-sm text-white/40 italic">
              &ldquo;Every artist was first an amateur.&rdquo;
            </p>
            <p className="text-xs text-white/30 mt-1">Ralph Waldo Emerson</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 px-6 py-10">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold tracking-[0.2em]">ALTERNUS</h1>
              <p className="text-[10px] tracking-[0.3em] text-muted-foreground mt-0.5">ART GALLERY</p>
            </Link>
          </div>

          {showVerification ? (
            /* Verification Screen */
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-violet-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Check Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit verification code to<br />
                  <span className="font-medium text-gray-900">{formData.email}</span>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                {/* Code Inputs */}
                <div className="flex justify-center gap-3">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 outline-none transition-all duration-200 ${
                        digit
                          ? "border-violet-400 bg-violet-50/50 text-violet-700"
                          : "border-gray-200 bg-gray-50/50 hover:border-gray-300 focus:border-violet-400 focus:bg-violet-50/30"
                      }`}
                      disabled={isVerifying}
                    />
                  ))}
                </div>

                {verificationError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 text-center">
                    {verificationError}
                  </div>
                )}

                <Button
                  onClick={() => handleVerifyCode()}
                  className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all duration-200"
                  disabled={isVerifying || verificationCode.join("").length !== 6}
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Didn&apos;t receive it? </span>
                  {canResend ? (
                    <button
                      onClick={handleResendCode}
                      className="text-violet-600 hover:text-violet-700 font-medium hover:underline transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span className="text-muted-foreground">
                      Resend in <span className="font-medium text-gray-700">{resendTimer}s</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleBackToSignup}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-gray-900 transition-colors mx-auto"
                disabled={isVerifying}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign Up
              </button>
            </div>
          ) : (
            /* Signup Form */
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Create Your Account</h2>
                <p className="text-sm text-muted-foreground">Start your artistic journey with Alternus</p>
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
                  <span className="bg-gradient-to-br from-gray-50/80 via-white to-gray-50/50 px-4 text-xs text-muted-foreground uppercase tracking-wider">or continue with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-medium text-gray-600">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={(e) => {
                          setFormData({ ...formData, firstName: e.target.value });
                          if (errors.firstName) setErrors({ ...errors, firstName: "" });
                        }}
                        className={`pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.firstName ? "border-red-300 bg-red-50/30" : ""}`}
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-medium text-gray-600">Last Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={(e) => {
                          setFormData({ ...formData, lastName: e.target.value });
                          if (errors.lastName) setErrors({ ...errors, lastName: "" });
                        }}
                        className={`pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.lastName ? "border-red-300 bg-red-50/30" : ""}`}
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

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

                {/* Country and Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-medium text-gray-600">Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                      <select
                        id="country"
                        value={formData.country}
                        onChange={(e) => {
                          setFormData({ ...formData, country: e.target.value });
                          if (errors.country) setErrors({ ...errors, country: "" });
                        }}
                        className={`flex h-11 w-full rounded-xl border bg-gray-50/50 pl-10 pr-3 py-2 text-sm transition-all duration-200 outline-none focus:bg-white focus:border-gray-400 appearance-none cursor-pointer ${
                          errors.country ? "border-red-300 bg-red-50/30" : "border-gray-200"
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
                    {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-medium text-gray-600">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                        className={`pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.phone ? "border-red-300 bg-red-50/30" : ""}`}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-600">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.password ? "border-red-300 bg-red-50/30" : ""}`}
                      autoComplete="new-password"
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
                  {formData.password && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {passwordChecks.map((check, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-200 ${
                            check.met
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}
                        >
                          {check.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {check.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-600">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      className={`pl-10 pr-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 transition-all duration-200 ${errors.confirmPassword ? "border-red-300 bg-red-50/30" : ""}`}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Policies */}
                <div className="bg-gray-50/80 rounded-xl p-4 space-y-3 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gallery Policies</p>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-0.5 rounded-[4px] border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                    />
                    <label htmlFor="terms" className="text-xs leading-relaxed text-gray-600 cursor-pointer">
                      I accept the{" "}
                      <Link href="/terms" className="text-gray-900 hover:underline font-medium">
                        Terms of Service
                      </Link>{" "}
                      and agree that my artworks will be displayed on Alternus Art Gallery
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={privacyAccepted}
                      onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
                      className="mt-0.5 rounded-[4px] border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                    />
                    <label htmlFor="privacy" className="text-xs leading-relaxed text-gray-600 cursor-pointer">
                      I accept the{" "}
                      <Link href="/privacy" className="text-gray-900 hover:underline font-medium">
                        Privacy Policy
                      </Link>{" "}
                      and agree that my data will be processed according to the gallery&apos;s policies
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                  disabled={!termsAccepted || !privacyAccepted || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-gray-900 hover:underline font-medium">
                  Sign In
                </Link>
              </p>

              {/* Footer */}
              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                By signing up, you agree to our terms and consent to<br />receive emails from Alternus Art Gallery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
