import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          const { email, password } = loginSchema.parse(credentials)

          const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              nombre: true,
              hashContrasena: true,
              rol: true,
              activo: true,
            }
          })

          if (!usuario || !usuario.activo) {
            return null
          }

          const passwordMatch = await bcrypt.compare(password, usuario.hashContrasena)
          
          if (!passwordMatch) {
            return null
          }

          return {
            id: usuario.id,
            email: usuario.email,
            name: usuario.nombre,
            role: usuario.rol,
          }
        } catch (error) {
          console.error('Error en autorización:', error)
          return null
        }
      }
    }),
    // Base para Google OAuth (para implementar después)
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
