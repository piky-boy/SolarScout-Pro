import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          })
          if (!user?.password) return null
          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  cookies: {
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id && session?.user) {
        ;(session.user as any).id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {}
      return baseUrl
    },
  },
}
