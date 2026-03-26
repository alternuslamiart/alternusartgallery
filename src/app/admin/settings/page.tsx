"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-lg text-gray-600">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common settings and actions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                >
                  <Link href="/admin/change-password">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                    </svg>
                    Change Password
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                >
                  <Link href="/admin/export-data">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" x2="12" y1="15" y2="3"></line>
                    </svg>
                    Export Data
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                >
                  <Link href="/admin/maintenance">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    System Maintenance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl">Account Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <p className="text-base text-gray-900 mt-1">admin@alternusart.com</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Role</label>
                  <p className="text-base text-gray-900 mt-1">Administrator</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Member Since</label>
                  <p className="text-base text-gray-900 mt-1">January 2025</p>
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/admin/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl">Privacy & Security</CardTitle>
              <CardDescription>Control your security preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/two-factor">Enable</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-gray-900">Login Notifications</p>
                    <p className="text-sm text-gray-600">Get notified of new logins</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/notifications">Configure</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-gray-900">Active Sessions</p>
                    <p className="text-sm text-gray-600">Manage your active sessions</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/sessions">View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-xl">Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-gray-900">Marketing Communications</p>
                    <p className="text-sm text-gray-600">News and special offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-semibold text-gray-900">Language</p>
                    <p className="text-sm text-gray-600">English (US)</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/language">Change</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="mt-6 border border-red-200">
          <CardHeader className="border-b bg-red-50">
            <CardTitle className="text-xl text-red-900">Danger Zone</CardTitle>
            <CardDescription className="text-red-700">
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
