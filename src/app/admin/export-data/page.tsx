"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExport = (_dataType: string) => {
    setIsExporting(true);
    setExportComplete(false);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setExportComplete(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/settings"
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
            Back to Settings
          </Link>
          <h1 className="text-4xl font-bold mb-2">Export Data</h1>
          <p className="text-lg text-gray-600">
            Download your data in various formats
          </p>
        </div>

        {exportComplete && (
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
                Export started! Check your downloads folder.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Account Data */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-600"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your profile and account details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Includes your email, name, role, and account settings.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExport("account-json")}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  {isExporting ? "Exporting..." : "Export as JSON"}
                </Button>
                <Button
                  onClick={() => handleExport("account-csv")}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1"
                >
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-purple-600"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>All your purchase records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Complete history of your orders, payments, and deliveries.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExport("orders-json")}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  {isExporting ? "Exporting..." : "Export as JSON"}
                </Button>
                <Button
                  onClick={() => handleExport("orders-csv")}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1"
                >
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-green-600"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Your account activity history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Login history, settings changes, and other account activities.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExport("activity-json")}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  {isExporting ? "Exporting..." : "Export as JSON"}
                </Button>
                <Button
                  onClick={() => handleExport("activity-csv")}
                  disabled={isExporting}
                  variant="outline"
                  className="flex-1"
                >
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complete Archive */}
          <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="border-b bg-white/50">
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
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Complete Data Archive</CardTitle>
                  <CardDescription>Everything in one download</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Download all your data in a single compressed file. Includes account info, orders, activity logs, and more.
              </p>
              <Button
                onClick={() => handleExport("complete-archive")}
                disabled={isExporting}
                className="w-full"
                size="lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                {isExporting ? "Creating Archive..." : "Download Complete Archive (.zip)"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
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
              Data Export Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Exports are processed immediately and downloaded to your device</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>All data is encrypted during transfer</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>You can export your data as many times as needed</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
