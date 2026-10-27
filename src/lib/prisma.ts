import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
 prisma: PrismaClient | undefined
}

function normalizeDatabaseUrl(raw?: string): string | undefined {
 if (!raw) return undefined
 const trimmed = raw.trim().replace(/^["']|["']$/g, '')
 let candidate = trimmed
 try {
  new URL(candidate)
 } catch {
  const schemeEnd = candidate.indexOf('://')
  const lastAt = candidate.lastIndexOf('@')
  if (schemeEnd > 0 && lastAt > schemeEnd + 3) {
   const userPass = candidate.slice(schemeEnd + 3, lastAt)
   const colon = userPass.indexOf(':')
   if (colon > 0) {
    const user = userPass.slice(0, colon)
    const pass = userPass.slice(colon + 1)
    let encodedPass = pass
    try { encodedPass = encodeURIComponent(decodeURIComponent(pass)) } catch { encodedPass = encodeURIComponent(pass) }
    candidate = `${candidate.slice(0, schemeEnd + 3)}${user}:${encodedPass}@${candidate.slice(lastAt + 1)}`
   }
  }
 }
 try {
  const parsed = new URL(candidate)
  if (parsed.port === '6543' || parsed.hostname.includes('.pooler.')) {
   if (!parsed.searchParams.has('pgbouncer')) parsed.searchParams.set('pgbouncer', 'true')
   const limit = Number(parsed.searchParams.get('connection_limit') || '0')
   if (!limit || limit < 10) parsed.searchParams.set('connection_limit', '10')
   if (!parsed.searchParams.has('pool_timeout')) parsed.searchParams.set('pool_timeout', '20')
   if (!parsed.searchParams.has('connect_timeout')) parsed.searchParams.set('connect_timeout', '15')
   return parsed.toString()
  }
  return candidate
 } catch {
  return trimmed
 }
}

const datasourceUrl = normalizeDatabaseUrl(process.env.DATABASE_URL)

export const prisma =
 globalForPrisma.prisma ??
 new PrismaClient({
 ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
 log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
 })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
