'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ComentarioForm } from '@/components/forms/ComentarioForm'
import toast from 'react-hot-toast'

interface PublicacionDetalleProps {
  publicacion: {
    id: string
    titulo: string
    slug: string
    contenido: string
    estado: string
    creadoEn: string
    autor: {
      id: string
      nombre: string
      email: string
    }
    comentarios: {
      id: string
      contenido: string
      creadoEn: string
      autor: {
        id: string
        nombre: string
      }
    }[]
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
  usuarioActual: {
    id: string
    email: string
    name?: string
    role: string
  } | null
}

export function PublicacionDetalle({ publicacion, usuarioActual }: PublicacionDetalleProps) {
  const [meGusta, setMeGusta] = useState(false)
  const [totalMeGustas, setTotalMeGustas] = useState(publicacion._count.meGustas)
  const [loadingLike, setLoadingLike] = useState(false)
  const [comentarios, setComentarios] = useState(publicacion.comentarios)

  const toggleMeGusta = async () => {
    if (!usuarioActual) {
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
    const url = window.location.href
    
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const onComentarioAgregado = () => {
    // Recargar comentarios
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <nav className="text-sm">
        <Link href="/" className="text-primary-600 hover:text-primary-500">
          ← Volver al inicio
        </Link>
      </nav>

      {/* Publicación principal */}
      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {publicacion.titulo}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>Por {publicacion.autor.nombre || publicacion.autor.email}</span>
                <span>•</span>
                <span>{formatearFecha(publicacion.creadoEn)}</span>
                {publicacion.estado === 'BORRADOR' && (
                  <>
                    <span>•</span>
                    <Badge variant="warning">Borrador</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="prose max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: publicacion.contenido }} />
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
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center space-x-6">
                <button
                  onClick={toggleMeGusta}
                  disabled={loadingLike}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    meGusta 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <svg className="w-6 h-6" fill={meGusta ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{totalMeGustas} me gusta</span>
                </button>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{comentarios.length} comentarios</span>
                </div>

                <button
                  onClick={compartir}
                  className="flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de comentarios */}
      <div id="comentarios" className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comentarios ({comentarios.length})
        </h2>

        {/* Formulario para agregar comentario */}
        {usuarioActual ? (
          <Card>
            <CardContent className="p-6">
              <ComentarioForm 
                publicacionId={publicacion.id}
                onSuccess={onComentarioAgregado}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Debes iniciar sesión para comentar
              </p>
              <Link href="/auth/login">
                <Button>Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Lista de comentarios */}
        <div className="space-y-4">
          {comentarios.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              </CardContent>
            </Card>
          ) : (
            comentarios.map((comentario) => (
              <Card key={comentario.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-900">
                          {comentario.autor.nombre}
                        </span>
                        <span>•</span>
                        <span>{formatearFecha(comentario.creadoEn)}</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: comentario.contenido }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
