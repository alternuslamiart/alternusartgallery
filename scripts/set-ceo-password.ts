/**
 * One-time script to set the CEO user's password hash in the database.
 *
 * Usage:
 *   npx tsx scripts/set-ceo-password.ts
 *
 * Make sure your .env file has:
 *   CEO_EMAIL=lamialiuart@gmail.com
 *   CEO_PASSWORD=YourNewSecurePassword
 */

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.CEO_EMAIL
  const password = process.env.CEO_PASSWORD

  if (!email || !password) {
    console.error('Error: CEO_EMAIL and CEO_PASSWORD must be set in .env')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'CEO' },
    create: {
      email,
      firstName: 'Lamiart',
      lastName: 'CEO',
      role: 'CEO',
      passwordHash,
      emailVerified: true,
    },
  })

  console.log(`CEO user updated successfully (ID: ${user.id})`)
  console.log('Password hash has been set. You can now login with your credentials.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
