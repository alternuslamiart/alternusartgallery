"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function TwoFactorPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleEnable = () => {
    setShowSetup(true);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsEnabled(true);
      setShowSetup(false);
    }, 1500);
  };

  const handleDisable = () => {
    setIsEnabled(false);
    setShowSetup(false);
    setVerificationCode("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Settings
          </Link>
          <h1 className="text-4xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-lg text-gray-600">Add an extra layer of security to your account</p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isEnabled ? 'text-green-600' : 'text-gray-600'}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Status: {isEnabled ? "Enabled" : "Disabled"}</CardTitle>
                  <CardDescription>
                    {isEnabled ? "Your account is protected with 2FA" : "Enable 2FA for better security"}
                  </CardDescription>
                </div>
              </div>
              {isEnabled && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Active
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!isEnabled && !showSetup && (
              <div>
                <p className="text-sm text-gray-600 mb-6">
                  Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Scan QR Code</p>
                      <p className="text-sm text-gray-600">Use your authenticator app to scan the QR code</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Enter Verification Code</p>
                      <p className="text-sm text-gray-600">Enter the 6-digit code from your app</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Save Backup Codes</p>
                      <p className="text-sm text-gray-600">Store backup codes in a safe place</p>
                    </div>
                  </div>
                </div>
                <Button onClick={handleEnable} className="w-full" size="lg">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            )}

            {showSetup && !isEnabled && (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="w-48 h-48 bg-white border-4 border-gray-200 rounded-xl flex items-center justify-center">
                    <div className="w-40 h-40 bg-gray-900 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600 mb-6">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Enter 6-digit verification code
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="h-14 text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? "Verifying..." : "Verify and Enable"}
                  </Button>
                  <Button onClick={() => setShowSetup(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {isEnabled && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 flex-shrink-0 mt-0.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-900 mb-1">2FA is Active</p>
                      <p className="text-sm text-green-700">Your account is protected with two-factor authentication</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  You&apos;ll be asked for a verification code from your authenticator app each time you sign in.
                </p>
                <Button onClick={handleDisable} variant="destructive" className="w-full">
                  Disable Two-Factor Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 border border-gray-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Recommended Authenticator Apps
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Google Authenticator (iOS & Android)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Authy (iOS, Android & Desktop)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Microsoft Authenticator (iOS & Android)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
