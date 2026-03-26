"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      hasUpperCase,
      hasNumber,
      hasSymbol,
      hasMinLength,
      isValid: hasUpperCase && hasNumber && hasSymbol && hasMinLength,
    };
  };

  const passwordValidation = validatePassword(formData.newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const newErrors: { [key: string]: string } = {};

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordValidation.isValid) {
      newErrors.newPassword = "Password does not meet requirements";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate password change
    setIsSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after success
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Change Password</h1>
          <p className="text-lg text-gray-600">
            Update your password to keep your account secure
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Choose a strong password to protect your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-600"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">
                    Password changed successfully! Redirecting...
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className={`h-12 ${errors.currentPassword ? "border-red-500" : ""}`}
                  placeholder="Enter your current password"
                />
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className={`h-12 ${errors.newPassword ? "border-red-500" : ""}`}
                  placeholder="Enter your new password"
                />
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                )}

                {/* Password Requirements */}
                {formData.newPassword && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Password must contain:
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {passwordValidation.hasMinLength ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            passwordValidation.hasMinLength
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordValidation.hasUpperCase ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            passwordValidation.hasUpperCase
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordValidation.hasNumber ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            passwordValidation.hasNumber
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordValidation.hasSymbol ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            passwordValidation.hasSymbol
                              ? "text-green-700"
                              : "text-gray-600"
                          }
                        >
                          One special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className={`h-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isSubmitting ? "Updating Password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="mt-6 border border-gray-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-600"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Security Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Never share your password with anyone</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Use a unique password for your Alternus account</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Change your password regularly for better security</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
