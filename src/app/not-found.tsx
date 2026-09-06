import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
 return (
 <div className="flex min-h-screen items-center justify-center bg-[#F6F8FB] px-4 text-[#111827]">
 <div className="w-full max-w-xl rounded-2xl border border-[#E5EAF0] bg-white p-8 text-center ">
 <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7DD3FC] via-[#38BDF8] to-[#6366F1] text-white">
 404
 </div>
 <h1 className="text-2xl font-semibold tracking-[-0.02em]">Workspace not found</h1>
 <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6B7280]">
 This route is no longer part of the Crystal Studio platform surface.
 </p>
 <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
 <Button asChild>
 <Link href="/design-studio">Open Design Studio</Link>
 </Button>
 <Button asChild variant="outline">
 <Link href="/help-center">Help Center</Link>
 </Button>
 </div>
 </div>
 </div>
 );
}
