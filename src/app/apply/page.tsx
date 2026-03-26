"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function ApplyPage() {
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
    } catch (err) {
      console.error("Camera error:", err);
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
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setFaceImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const artStyles = [
    "Abstract",
    "Contemporary",
    "Landscape",
    "Portrait",
    "Still Life",
    "Urban",
    "Impressionist",
    "Realism",
    "Mixed Media",
    "Photography",
    "Sculpture",
    "Drawing",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleStyleToggle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      artStyle: prev.artStyle.includes(style)
        ? prev.artStyle.filter((s) => s !== style)
        : [...prev.artStyle, style],
    }));
  };

  if (isSubmitted) {
    return (
      <div className="py-16 min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Thank you for applying to join Alternus Art Gallery. Our team will review your application and get back to you within 5-7 business days.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href="/">Return to Home</a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Questions? Contact us at <a href="mailto:artists@alternusart.com" className="text-primary hover:underline">artists@alternusart.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Artist Application" }]} />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Alternus</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Become part of our curated community of talented artists. Share your work with art lovers worldwide and grow your career.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Global Reach</h3>
            <p className="text-sm text-muted-foreground">Access to art collectors and enthusiasts from around the world</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Professional Support</h3>
            <p className="text-sm text-muted-foreground">Dedicated team to help market and promote your artwork</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Fair Commission</h3>
            <p className="text-sm text-muted-foreground">Competitive rates with transparent pricing and timely payments</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Application Form</h2>

          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Passport / ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="Enter your passport or national ID number"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Required for identity verification</p>
                </div>
              </div>

              {/* Member Type Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-3">
                  I am a <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, memberType: "seller" })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.memberType === "seller"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      formData.memberType === "seller" ? "bg-primary/10" : "bg-gray-100"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={formData.memberType === "seller" ? "text-primary" : "text-gray-500"}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <p className={`font-medium ${formData.memberType === "seller" ? "text-primary" : ""}`}>Seller</p>
                    <p className="text-xs text-muted-foreground mt-1">I want to sell my artwork</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, memberType: "buyer" })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.memberType === "buyer"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      formData.memberType === "buyer" ? "bg-primary/10" : "bg-gray-100"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={formData.memberType === "buyer" ? "text-primary" : "text-gray-500"}>
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </div>
                    <p className={`font-medium ${formData.memberType === "buyer" ? "text-primary" : ""}`}>Buyer</p>
                    <p className="text-xs text-muted-foreground mt-1">I want to buy artwork</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, memberType: "collector" })}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      formData.memberType === "collector"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      formData.memberType === "collector" ? "bg-primary/10" : "bg-gray-100"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={formData.memberType === "collector" ? "text-primary" : "text-gray-500"}>
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <p className={`font-medium ${formData.memberType === "collector" ? "text-primary" : ""}`}>Collector</p>
                    <p className="text-xs text-muted-foreground mt-1">I want to collect art</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Identity Verification - Face Scan */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                <div className="text-center">
                  {/* Camera View */}
                  {isCapturing && !faceImage && (
                    <div className="space-y-4">
                      <div className="relative mx-auto w-64 h-64 rounded-xl overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {/* Face guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-40 h-48 border-2 border-white/50 rounded-full" />
                        </div>
                        {!isCameraActive && !cameraError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Position your face within the oval and look at the camera
                      </p>
                      {cameraError && (
                        <p className="text-sm text-red-500">{cameraError}</p>
                      )}
                      <div className="flex gap-3 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={stopCamera}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={capturePhoto}
                          disabled={!isCameraActive}
                          className="gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                          Capture
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Initial State - No image, no camera */}
                  {!faceImage && !isCapturing && (
                    <>
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0-6v6" />
                          <circle cx="12" cy="10" r="3" />
                          <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
                        </svg>
                      </div>
                      <h4 className="font-medium mb-2">Face Scan Required <span className="text-red-500">*</span></h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Take a clear photo of your face for identity verification
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFaceImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          className="gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" x2="12" y1="3" y2="15" />
                          </svg>
                          Upload Photo
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Image captured */}
                  {faceImage && (
                    <div className="space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-green-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={faceImage} alt="Face scan" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="font-medium">Photo captured successfully</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFaceImage(null)}
                      >
                        Retake Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your photo will be used only for verification purposes and kept secure according to our privacy policy.
              </p>
            </div>

            {/* Online Presence */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Online Presence</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://your-website.com"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter / X</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      placeholder="@username"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Art Styles */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Art Styles <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {artStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleStyleToggle(style)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm ${
                      formData.artStyle.includes(style)
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.yearsExperience}
                onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select...</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Portfolio Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                placeholder="https://your-portfolio.com or link to gallery"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Please provide a link to your online portfolio or social media gallery</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Artist Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell us about yourself, your artistic journey, and what inspires your work..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Why Join */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Why do you want to join Alternus? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.whyJoin}
                onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
                rows={4}
                placeholder="Share your motivations and goals..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto px-12">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                By submitting this application, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
