import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // CEO direct login - no verification needed
        const CEO_EMAIL = "lamialiuart@gmail.com"
        const CEO_PASSWORD = "Alternus333#"

        const email = (credentials?.email as string)?.trim()?.toLowerCase()
        const password = credentials?.password as string

        console.log("Login attempt for email:", email)

        // Case-insensitive email comparison for CEO
        if (email === CEO_EMAIL.toLowerCase() && password === CEO_PASSWORD) {
          console.log("CEO login successful")

          // Find or create CEO user in database
          let ceoUser = await prisma.user.findFirst({
            where: { email: CEO_EMAIL },
          })

          if (!ceoUser) {
            ceoUser = await prisma.user.create({
              data: {
                email: CEO_EMAIL,
                firstName: "Lamiart",
                lastName: "CEO",
                role: "CEO",
                emailVerified: true,
              },
            })
            console.log("Created CEO user in database:", ceoUser.id)
          }

          return {
            id: ceoUser.id,
            email: CEO_EMAIL,
            name: "Lamiart CEO",
            role: "CEO",
          }
        }

        // Check for regular users in database
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        })

        if (user && user.passwordHash) {
          const isValidPassword = await bcrypt.compare(password, user.passwordHash)

          if (isValidPassword) {
            console.log("User login successful:", email)
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            }
          }
        }

        console.log("Login failed - invalid credentials")
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // Check if CEO login
        if ((user as { role?: string }).role === "CEO") {
          token.role = "CEO"
        } else {
          token.role = "CUSTOMER"
        }
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  trustHost: true,
})

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      image?: string
    }
  }
}
