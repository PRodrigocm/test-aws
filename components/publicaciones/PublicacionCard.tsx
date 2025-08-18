'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface PublicacionCardProps {
  publicacion: {
    id: string
    titulo: string
    slug: string
    contenido: string
    creadoEn: string
    autor: {
      id: string
      nombre: string
      email: string
    }
    _count: {
      comentarios: number
      meGustas: number
    }
    etiquetas: {
      etiqueta: {
        nombre: string
      }
    }[]
  }
}

export function PublicacionCard({ publicacion }: PublicacionCardProps) {
  const { data: session } = useSession()
  const [meGusta, setMeGusta] = useState(false)
  const [totalMeGustas, setTotalMeGustas] = useState(publicacion._count.meGustas)
  const [loadingLike, setLoadingLike] = useState(false)

  const toggleMeGusta = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión para dar me gusta')
      return
    }

    setLoadingLike(true)
    try {
      const response = await fetch('/api/me-gustas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicacionId: publicacion.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMeGusta(data.meGusta)
        setTotalMeGustas(data.totalMeGustas)
      } else {
        toast.error('Error al procesar me gusta')
      }
    } catch (error) {
      toast.error('Error al procesar me gusta')
    } finally {
      setLoadingLike(false)
    }
  }

  const compartir = async () => {
    const url = `${window.location.origin}/publicacion/${publicacion.slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: publicacion.titulo,
          text: publicacion.contenido.substring(0, 100) + '...',
          url,
        })
      } catch (error) {
        // Usuario canceló o error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Enlace copiado al portapapeles')
      } catch (error) {
        toast.error('Error al copiar enlace')
      }
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const truncarContenido = (contenido: string, limite: number = 200) => {
    if (contenido.length <= limite) return contenido
    return contenido.substring(0, limite) + '...'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link 
                href={`/publicacion/${publicacion.slug}`}
                className="block hover:text-primary-600"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {publicacion.titulo}
                </h2>
              </Link>
              
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>Por {publicacion.autor.nombre || publicacion.autor.email}</span>
                <span>•</span>
                <span>{formatearFecha(publicacion.creadoEn)}</span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="text-gray-700">
            <div dangerouslySetInnerHTML={{ 
              __html: truncarContenido(publicacion.contenido) 
            }} />
          </div>

          {/* Etiquetas */}
          {publicacion.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {publicacion.etiquetas.map((etiqueta, index) => (
                <Link
                  key={index}
                  href={`/?etiqueta=${encodeURIComponent(etiqueta.etiqueta.nombre)}`}
                >
                  <Badge variant="primary" className="cursor-pointer hover:bg-primary-200">
                    {etiqueta.etiqueta.nombre}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMeGusta}
                disabled={loadingLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  meGusta 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <svg className="w-5 h-5" fill={meGusta ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{totalMeGustas}</span>
              </button>

              <Link 
                href={`/publicacion/${publicacion.slug}#comentarios`}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{publicacion._count.comentarios}</span>
              </Link>

              <button
                onClick={compartir}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Compartir</span>
              </button>
            </div>

            <Link href={`/publicacion/${publicacion.slug}`}>
              <Button variant="secondary" size="sm">
                Leer más
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
