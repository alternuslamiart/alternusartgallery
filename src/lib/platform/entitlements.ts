import type { WorkspacePlan } from "@prisma/client";

export type BillingPlan = "BASIC" | "PRO" | "TEAM" | "STUDIO";

export type WorkspaceEntitlements = {
 billingPlan: BillingPlan;
 workspaces: number | "unlimited";
 monthlyAgentRuns: number | "unlimited";
 knowledgeGb: number;
 voiceMode: boolean;
 codeStudio: "read-only" | "full" | "enhanced";
 sharedKnowledge: boolean;
 agentSdk: boolean;
 ssoScim: boolean;
 auditLogDays: number | "export";
 roleBasedPermissions: boolean;
 unityTools: boolean;
 support: "community" | "priority" | "studio";
};

const ENTITLEMENTS: Record<BillingPlan, WorkspaceEntitlements> = {
 BASIC: {
 billingPlan: "BASIC",
 workspaces: 1,
 monthlyAgentRuns: 200,
 knowledgeGb: 5,
 voiceMode: false,
 codeStudio: "read-only",
 sharedKnowledge: false,
 agentSdk: false,
 ssoScim: false,
 auditLogDays: 7,
 roleBasedPermissions: false,
 unityTools: false,
 support: "community",
 },
 PRO: {
 billingPlan: "PRO",
 workspaces: "unlimited",
 monthlyAgentRuns: "unlimited",
 knowledgeGb: 100,
 voiceMode: true,
 codeStudio: "full",
 sharedKnowledge: false,
 agentSdk: true,
 ssoScim: false,
 auditLogDays: 30,
 roleBasedPermissions: false,
 unityTools: false,
 support: "priority",
 },
 TEAM: {
 billingPlan: "TEAM",
 workspaces: "unlimited",
 monthlyAgentRuns: "unlimited",
 knowledgeGb: 500,
 voiceMode: true,
 codeStudio: "full",
 sharedKnowledge: true,
 agentSdk: true,
 ssoScim: true,
 auditLogDays: "export",
 roleBasedPermissions: true,
 unityTools: false,
 support: "priority",
 },
 STUDIO: {
 billingPlan: "STUDIO",
 workspaces: "unlimited",
 monthlyAgentRuns: "unlimited",
 knowledgeGb: 1024,
 voiceMode: true,
 codeStudio: "enhanced",
 sharedKnowledge: true,
 agentSdk: true,
 ssoScim: true,
 auditLogDays: "export",
 roleBasedPermissions: true,
 unityTools: true,
 support: "studio",
 },
};

export function getEntitlements(plan: WorkspacePlan): WorkspaceEntitlements {
 if (plan === "PRO") return ENTITLEMENTS.PRO;
 if (plan === "TEAM") return ENTITLEMENTS.TEAM;
 return ENTITLEMENTS.BASIC;
}

export function isBillingPlan(value: unknown): value is BillingPlan {
 return value === "BASIC" || value === "PRO" || value === "TEAM" || value === "STUDIO";
}
