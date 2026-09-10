"use client";

export function LayoutShell({ children }: { children: React.ReactNode }) {
 return <main className="flex min-h-0 w-full max-w-none flex-1 self-stretch overflow-x-hidden">{children}</main>;
}
