"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export default function LanguageSettingsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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
          <h1 className="text-4xl font-bold mb-2">Language Settings</h1>
          <p className="text-lg text-gray-600">Choose your preferred language</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-sm font-medium text-green-800">Language updated successfully!</p>
            </div>
          </div>
        )}

        <Card className="border border-gray-200">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                🌐
              </div>
              <div>
                <CardTitle>Select Language</CardTitle>
                <CardDescription>Choose the language for your interface</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => setSelectedLanguage(language.code)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    selectedLanguage === language.code
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-3xl">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{language.name}</p>
                    <p className="text-sm text-gray-600">{language.nativeName}</p>
                  </div>
                  {selectedLanguage === language.code && (
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="w-full" size="lg">
                {isSaving ? "Saving..." : "Save Language Preference"}
              </Button>
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
              Language Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Changing your language will update the entire interface</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Some content may still appear in the original language</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>You can change your language at any time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
