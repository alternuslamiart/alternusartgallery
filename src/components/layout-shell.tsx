"use client";

export function LayoutShell({ children }: { children: React.ReactNode }) {
 return <main className="flex-1 overflow-x-hidden">{children}</main>;
}
