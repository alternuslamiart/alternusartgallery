"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileChat } from "./mobile-chat";

export function MobileNav() {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/gallery",
      label: "Gallery",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
    },
    {
      href: "/support",
      label: "Support",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
    {
      href: "/login",
      label: "Account",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-gray-500"}>
                  {item.icon}
                </span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Chat Button - Center */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 transition-colors text-gray-500 hover:text-gray-900"
          >
            <span className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            </span>
            <span className="text-xs mt-1 font-medium">Chat</span>
          </button>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-gray-500"}>
                  {item.icon}
                </span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area padding for iPhone notch */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>

      {/* Mobile Chat Window */}
      <MobileChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
