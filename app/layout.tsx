import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/layout/Navigation'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Foro App - Comunidad de Discusión',
  description: 'Una plataforma de foro moderna para compartir ideas y discutir temas de interés',
  keywords: ['foro', 'comunidad', 'discusión', 'publicaciones'],
  authors: [{ name: 'Foro App' }],
  openGraph: {
    title: 'Foro App - Comunidad de Discusión',
    description: 'Una plataforma de foro moderna para compartir ideas y discutir temas de interés',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
