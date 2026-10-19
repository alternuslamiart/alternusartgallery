import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSecurityHeaders, globalCyberDefense } from "@/lib/security/cyber-shield.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminCheck = await verifyAdminRequest();

  const baseStatus = {
    status: "active",
    engine: "Casynus Cyber-Shield v2",
    layers: {
      waf: {
        enabled: true,
        protections: [
          "SQL_INJECTION",
          "XSS_ATTACK",
          "PATH_TRAVERSAL",
          "COMMAND_INJECTION",
          "SSRF_PROBE",
          "XXE_INJECTION",
          "PROTOTYPE_POLLUTION",
          "NULL_BYTE_INJECTION",
          "SENSITIVE_PATH_PROBE",
          "MALICIOUS_SCANNER_UA",
        ],
      },
      csrfOriginGuard: {
        enabled: true,
        enforcedMethods: ["POST", "PUT", "PATCH", "DELETE"],
      },
      rateLimiting: {
        enabled: true,
        tiers: {
          auth: "8 req/min + exponential brute-force lockout",
          ai: "25 req/min",
          payment: "20 req/min",
          support: "6 req/min",
          generalApi: "100 req/min",
        },
      },
      ipReputation: {
        enabled: true,
        autoBanOnRepeatedStrikes: true,
      },
      edgeHmacAdminVerification: {
        enabled: true,
        algorithm: "HMAC-SHA256 (Web Crypto API constant-time)",
      },
      payloadSanitization: {
        enabled: true,
        protections: ["Prototype Pollution", "NoSQL Operators", "Null Bytes", "JSON Depth/Key Caps"],
      },
      securityHeaders: Object.keys(getSecurityHeaders()),
    },
  };

  if (adminCheck.authorized) {
    return NextResponse.json({
      ...baseStatus,
      telemetry: globalCyberDefense.getSnapshot(),
    });
  }

  return NextResponse.json(baseStatus);
}
