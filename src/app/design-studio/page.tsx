"use client";

import { useRouter } from "next/navigation";
import { DesignDashboard } from "@/components/crystal-studio/DesignDashboard";

export default function DesignStudioPage() {
 const router = useRouter();
 return <DesignDashboard onOpenStudio={() => router.push("/crystal")} />;
}
