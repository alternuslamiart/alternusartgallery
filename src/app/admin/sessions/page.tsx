"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface Session {
  id: string;
  device: string;
  location: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "MacBook Pro",
      location: "Tirana, Albania",
      browser: "Chrome 120",
      ip: "192.168.1.100",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "2",
      device: "iPhone 14 Pro",
      location: "Tirana, Albania",
      browser: "Safari Mobile",
      ip: "192.168.1.101",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Windows Desktop",
      location: "Durres, Albania",
      browser: "Firefox 121",
      ip: "192.168.1.102",
      lastActive: "1 day ago",
      isCurrent: false,
    },
  ]);

  const [isTerminating, setIsTerminating] = useState<string | null>(null);

  const handleTerminate = (sessionId: string) => {
    setIsTerminating(sessionId);
    setTimeout(() => {
      setSessions(sessions.filter(s => s.id !== sessionId));
      setIsTerminating(null);
    }, 1000);
  };

  const handleTerminateAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes("MacBook") || device.includes("Windows")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    }
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
          <h1 className="text-4xl font-bold mb-2">Active Sessions</h1>
          <p className="text-lg text-gray-600">Manage devices that are signed into your account</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            You have {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
          </p>
          {sessions.filter(s => !s.isCurrent).length > 0 && (
            <Button onClick={handleTerminateAll} variant="outline" size="sm">
              Terminate All Other Sessions
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className={`border border-gray-200 ${session.isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${session.isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <div className={session.isCurrent ? 'text-blue-600' : 'text-gray-600'}>
                        {getDeviceIcon(session.device)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{session.device}</h3>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {session.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {session.lastActive}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span>{session.browser}</span>
                          <span>•</span>
                          <span>{session.ip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      onClick={() => handleTerminate(session.id)}
                      disabled={isTerminating === session.id}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isTerminating === session.id ? "Terminating..." : "Terminate"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border border-gray-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Security Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Terminating a session will sign out that device immediately</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>If you see an unfamiliar session, terminate it and change your password</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Sessions expire after 30 days of inactivity</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
