"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function SystemMaintenancePage() {
  const [clearingCache, setClearingCache] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [success, setSuccess] = useState("");

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      setSuccess("Cache cleared successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }, 1500);
  };

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setSuccess("Database optimized successfully!");
      setTimeout(() => setSuccess(""), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-4xl font-bold mb-2">System Maintenance</h1>
          <p className="text-lg text-gray-600">Optimize and maintain your system</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Clear Cache</CardTitle>
                  <CardDescription>Remove temporary files and data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Clear cached data to free up space and resolve potential issues. This won&apos;t affect your saved data.
              </p>
              <Button onClick={handleClearCache} disabled={clearingCache} className="w-full">
                {clearingCache ? "Clearing Cache..." : "Clear All Cache"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="16 12 12 8 8 12" />
                    <line x1="12" y1="16" x2="12" y2="8" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Optimize Database</CardTitle>
                  <CardDescription>Improve system performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Optimize database tables and indexes for better performance. Recommended monthly.
              </p>
              <Button onClick={handleOptimize} disabled={optimizing} className="w-full">
                {optimizing ? "Optimizing..." : "Run Optimization"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-gray-600">2.4 GB / 10 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: "24%"}}></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium">System Status</span>
                  <span className="text-sm text-green-600 font-semibold">Healthy</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium">Last Maintenance</span>
                  <span className="text-sm text-gray-600">2 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
