import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export class ValidationError extends Error {
 details: Record<string, unknown>;

 constructor(message: string, details: Record<string, unknown> = {}) {
 super(message);
 this.details = details;
 }
}

export function asString(body: Record<string, unknown>, key: string, options: { required: true; max?: number }): string;
export function asString(body: Record<string, unknown>, key: string, options?: { required?: false; max?: number }): string | undefined;
export function asString(body: Record<string, unknown>, key: string, options: { required?: boolean; max?: number } = {}) {
 const value = body[key];
 if (value == null || value === "") {
 if (options.required) throw new ValidationError(`${key} is required.`, { key });
 return undefined;
 }
 if (typeof value !== "string") throw new ValidationError(`${key} must be a string.`, { key });
 const trimmed = value.trim();
 if (options.required && !trimmed) throw new ValidationError(`${key} is required.`, { key });
 if (options.max && trimmed.length > options.max) {
 throw new ValidationError(`${key} must be ${options.max} characters or less.`, { key, max: options.max });
 }
 return trimmed;
}

export function asEnum<T extends string>(body: Record<string, unknown>, key: string, allowed: readonly T[], fallback: T): T;
export function asEnum<T extends string>(body: Record<string, unknown>, key: string, allowed: readonly T[]): T | undefined;
export function asEnum<T extends string>(body: Record<string, unknown>, key: string, allowed: readonly T[], fallback?: T): T | undefined {
 const value = body[key];
 if (value == null || value === "") return fallback;
 if (typeof value !== "string" || !allowed.includes(value as T)) {
 throw new ValidationError(`${key} has an unsupported value.`, { key, allowed });
 }
 return value as T;
}

export function asJsonArray(body: Record<string, unknown>, key: string) {
 const value = body[key];
 if (value == null) return undefined;
 if (!Array.isArray(value)) throw new ValidationError(`${key} must be an array.`, { key });
 return value as Prisma.InputJsonArray;
}

export function asJsonObject(body: Record<string, unknown>, key: string) {
 const value = body[key];
 if (value == null) return undefined;
 if (typeof value !== "object" || Array.isArray(value)) throw new ValidationError(`${key} must be an object.`, { key });
 return value as Prisma.InputJsonObject;
}

export function parseListQuery(request: NextRequest, options: { defaultLimit?: number; maxLimit?: number } = {}) {
 const { searchParams } = new URL(request.url);
 const maxLimit = options.maxLimit ?? 100;
 const rawLimit = Number(searchParams.get("limit") ?? options.defaultLimit ?? 20);
 const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), maxLimit) : 20;
 return {
 search: searchParams.get("search")?.trim() || undefined,
 type: searchParams.get("type")?.trim() || undefined,
 status: searchParams.get("status")?.trim() || undefined,
 quality: searchParams.get("quality")?.trim() || undefined,
 tab: searchParams.get("tab")?.trim() || undefined,
 sort: searchParams.get("sort")?.trim() || "recent",
 projectId: searchParams.get("projectId")?.trim() || undefined,
 tag: searchParams.get("tag")?.trim() || undefined,
 entityType: searchParams.get("entityType")?.trim() || undefined,
 entityId: searchParams.get("entityId")?.trim() || undefined,
 cursor: searchParams.get("cursor")?.trim() || undefined,
 limit,
 };
}

export function sortToOrderBy(sort: string | undefined) {
 if (sort === "oldest") return { createdAt: "asc" as const };
 if (sort === "name_asc") return { name: "asc" as const };
 if (sort === "name_desc") return { name: "desc" as const };
 if (sort === "largest") return { sizeBytes: "desc" as const };
 if (sort === "smallest") return { sizeBytes: "asc" as const };
 if (sort === "last_used") return { lastUsedAt: "desc" as const };
 return { updatedAt: "desc" as const };
}

export function sanitizeName(name: string) {
 return name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ").replace(/\s+/g, " ").trim();
}

export function assertSafePath(path: string) {
 if (!path || path.length > 260 || path.includes("..") || path.startsWith("/") || /^[a-zA-Z]:/.test(path)) {
 throw new ValidationError("Path is not safe.", { path });
 }
}
