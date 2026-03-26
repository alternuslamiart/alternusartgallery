"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginNotificationsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    newDeviceAlerts: true,
    suspiciousActivityAlerts: true,
    weeklySecurityDigest: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
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
          <h1 className="text-4xl font-bold mb-2">Login Notifications</h1>
          <p className="text-lg text-gray-600">Configure when you receive login alerts</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium text-green-800">Notification settings saved successfully!</p>
            </div>
          </div>
        )}

        <Card className="border border-gray-200">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <div>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about logins</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive login alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* New Device Alerts */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">New Device Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when you sign in from a new device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.newDeviceAlerts}
                    onChange={() => handleToggle('newDeviceAlerts')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Suspicious Activity Alerts */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Suspicious Activity Alerts</p>
                  <p className="text-sm text-gray-600">Immediate alerts for unusual login attempts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.suspiciousActivityAlerts}
                    onChange={() => handleToggle('suspiciousActivityAlerts')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              {/* Weekly Security Digest */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Weekly Security Digest</p>
                  <p className="text-sm text-gray-600">Summary of all login activity sent weekly</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.weeklySecurityDigest}
                    onChange={() => handleToggle('weeklySecurityDigest')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
                {isSaving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Example Notification */}
        <Card className="mt-6 border border-gray-200">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg">Example Notification</CardTitle>
            <CardDescription>What your login alert will look like</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">New login to your account</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Someone just signed in to your account from a new device.
                  </p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>• Device: MacBook Pro</p>
                    <p>• Location: Tirana, Albania</p>
                    <p>• Time: January 5, 2026 at 3:45 PM</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    If this was you, you can safely ignore this email. If not, please secure your account immediately.
                  </p>
                </div>
              </div>
            </div>
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
              Security Recommendations
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Keep email notifications enabled for maximum security</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Always verify login alerts to ensure account safety</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Report suspicious activity immediately</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
