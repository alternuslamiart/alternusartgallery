"use client";

export function LayoutShell({ children }: { children: React.ReactNode }) {
 return <main className="flex min-h-0 w-full flex-1 overflow-x-hidden">{children}</main>;
}
