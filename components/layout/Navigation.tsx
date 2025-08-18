'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function Navigation() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary-600">
            Foro App
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-primary-600">
              Inicio
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard/publicaciones" className="text-gray-700 hover:text-primary-600">
                  Mis Publicaciones
                </Link>
                <Link href="/perfil" className="text-gray-700 hover:text-primary-600">
                  Perfil
                </Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-primary-600">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Hola, {session.user.name || session.user.email}
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleSignOut}>
                    Cerrar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="secondary" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/registro">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-primary-600 py-2">
                Inicio
              </Link>

              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard/publicaciones" className="text-gray-700 hover:text-primary-600 py-2">
                    Mis Publicaciones
                  </Link>
                  <Link href="/perfil" className="text-gray-700 hover:text-primary-600 py-2">
                    Perfil
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-700 hover:text-primary-600 py-2">
                      Admin
                    </Link>
                  )}
                  <div className="py-2">
                    <span className="text-sm text-gray-600 block mb-2">
                      {session.user.name || session.user.email}
                    </span>
                    <Button variant="secondary" size="sm" onClick={handleSignOut}>
                      Cerrar Sesión
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 py-2">
                  <Link href="/auth/login">
                    <Button variant="secondary" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/auth/registro">
                    <Button size="sm" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
