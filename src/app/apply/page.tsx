"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    label: "Personal",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Identity",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "Art Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
];

const artStyles = [
  "Abstract", "Contemporary", "Landscape", "Portrait",
  "Still Life", "Urban", "Impressionist", "Realism",
  "Mixed Media", "Photography", "Sculpture", "Drawing",
];

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    passportNumber: "",
    memberType: "" as "" | "seller" | "buyer" | "collector",
    website: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    artStyle: [] as string[],
    yearsExperience: "",
    portfolio: "",
    bio: "",
    whyJoin: "",
  });
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError("Unable to access camera. Please check permissions or use Upload Photo instead.");
      setIsCapturing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        setFaceImage(canvas.toDataURL("image/jpeg", 0.8));
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleStyleToggle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      artStyle: prev.artStyle.includes(style)
        ? prev.artStyle.filter((s) => s !== style)
        : [...prev.artStyle, style],
    }));
  };

  const validateStep = (): boolean => {
    setStepError(null);
    if (step === 0) {
      if (!formData.fullName || !formData.email || !formData.location || !formData.passportNumber) {
        setStepError("Please fill in all required fields.");
        return false;
      }
      if (!formData.memberType) {
        setStepError("Please select your membership type.");
        return false;
      }
    }
    if (step === 1) {
      if (!faceImage) {
        setStepError("Please provide a photo for identity verification.");
        return false;
      }
    }
    if (step === 2) {
      if (formData.artStyle.length === 0) {
        setStepError("Please select at least one art style.");
        return false;
      }
      if (!formData.yearsExperience) {
        setStepError("Please select your years of experience.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.portfolio || !formData.bio || !formData.whyJoin) {
        setStepError("Please fill in all required fields.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStepError(null);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/artists/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, faceImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit application");
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400";

  // ── Shared card wrapper ──────────────────────────────────────────────────────
  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Cerevix Art Gallery</p>
              <p className="text-white/70 text-xs mt-0.5">Join our curated community of artists</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-white px-3 py-1 rounded-full">
            APPLICATION
          </span>
        </div>
        {children}
      </div>
    </div>
  );

  // ── Success screen ───────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <CardWrapper>
        <div className="px-8 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
            Thank you for applying. Our team will review your application and get back to you within 5–7 business days.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <a href="/">Return to Home</a>
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Questions?{" "}
            <a href="mailto:artists@alternusart.com" className="text-blue-500 hover:underline">
              artists@alternusart.com
            </a>
          </p>
        </div>
      </CardWrapper>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <CardWrapper>
      {/* Tab bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex gap-1">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-white border border-gray-200 text-blue-600 shadow-sm"
                  : isDone
                  ? "text-blue-500 hover:bg-white/60 cursor-pointer"
                  : "text-gray-400 cursor-default"
              }`}
            >
              {isDone ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s.icon
              )}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        <div className="px-6 py-6">

          {/* ── Step 0: Personal ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Personal Information</span>
                <span className="text-xs text-gray-400">· Your basic details</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={inputClass}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                    placeholder="+1 555 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className={inputClass}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Passport / ID Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="Enter your passport or national ID number"
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400 mt-1">Required for identity verification</p>
                </div>
              </div>

              {/* Member type — secondary nav style */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  I am a <span className="text-red-400">*</span>
                </p>
                <div className="bg-gray-50 rounded-xl p-1.5 flex gap-1">
                  {(["seller", "buyer", "collector"] as const).map((type) => {
                    const icons: Record<string, React.ReactNode> = {
                      seller: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                      ),
                      buyer: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      ),
                      collector: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                      ),
                    };
                    const subtitles: Record<string, string> = {
                      seller: "Sell artwork",
                      buyer: "Buy artwork",
                      collector: "Collect art",
                    };
                    const isSelected = formData.memberType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, memberType: type })}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-white shadow-sm text-blue-600 border border-gray-200"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <span className={isSelected ? "text-blue-500" : "text-gray-400"}>{icons[type]}</span>
                        <span className="capitalize">{type}</span>
                        <span className="text-gray-400 font-normal">{subtitles[type]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Identity ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Identity Verification</span>
                <span className="text-xs text-gray-400">· Face scan required</span>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                <div className="text-center">
                  {/* Camera active */}
                  {isCapturing && !faceImage && (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-56 h-56 rounded-xl overflow-hidden bg-black">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-36 h-44 border-2 border-white/50 rounded-full" />
                        </div>
                        {!isCameraActive && !cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="animate-spin w-7 h-7 border-2 border-white border-t-transparent rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Position your face within the oval</p>
                      {cameraError && <p className="text-xs text-red-500">{cameraError}</p>}
                      <div className="flex gap-2 justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={stopCamera}>Cancel</Button>
                        <Button type="button" size="sm" onClick={capturePhoto} disabled={!isCameraActive} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Initial state */}
                  {!faceImage && !isCapturing && (
                    <>
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0-6v6" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Face Scan Required <span className="text-red-400">*</span></p>
                      <p className="text-xs text-gray-400 mb-4">Take a clear photo of your face for identity verification</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button type="button" variant="outline" size="sm" onClick={startCamera} className="gap-1.5 text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setFaceImage(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                          Upload Photo
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Photo captured */}
                  {faceImage && (
                    <div className="space-y-3">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-green-400">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={faceImage} alt="Face scan" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-green-600 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <span className="font-medium text-xs">Photo captured successfully</span>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setFaceImage(null)}>
                        Retake Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">Your photo is used only for verification and kept secure per our privacy policy.</p>
            </div>
          )}

          {/* ── Step 2: Art Profile ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                  <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Art Profile</span>
                <span className="text-xs text-gray-400">· Your creative work</span>
              </div>

              {/* Art styles */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Art Styles <span className="text-red-400">*</span>
                  <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {artStyles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleToggle(style)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        formData.artStyle.includes(style)
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Years of Experience <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="0-2">0–2 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="6-10">6–10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Online presence */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Online Presence</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Website</label>
                    <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://your-site.com" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                    <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} placeholder="@username" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                    <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} placeholder="linkedin.com/in/username" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Twitter / X</label>
                    <input type="text" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: e.target.value })} placeholder="@username" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Portfolio ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Portfolio</span>
                <span className="text-xs text-gray-400">· Tell your story</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Portfolio Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://your-portfolio.com"
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 mt-1">Link to your online portfolio or social media gallery</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Artist Bio <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself, your artistic journey, and what inspires your work..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Why do you want to join Cerevix? <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.whyJoin}
                  onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                  rows={3}
                  placeholder="Share your motivations and goals..."
                  className={inputClass}
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Step error */}
          {stepError && (
            <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-xs">
              {stepError}
            </div>
          )}
        </div>

        {/* Footer action bar */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step
                    ? "w-5 h-2 bg-blue-600"
                    : i < step
                    ? "w-2 h-2 bg-blue-300"
                    : "w-2 h-2 bg-gray-200"
                }`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-2">Step {step + 1} of {STEPS.length}</span>
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={handleBack} className="text-xs gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1 px-5">
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </Button>
            ) : (
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5">
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </CardWrapper>
  );
}
