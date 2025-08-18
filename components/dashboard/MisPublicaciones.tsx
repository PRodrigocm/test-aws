'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { PublicacionForm } from '@/components/forms/PublicacionForm'
import toast from 'react-hot-toast'

interface MisPublicacionesProps {
  publicaciones: {
    id: string
    titulo: string
    slug: string
    contenido: string
    estado: 'BORRADOR' | 'PUBLICADO'
    visible: boolean
    creadoEn: string
    actualizadoEn: string
    _count: {
      comentarios: number
      meGustas: number
    }
    etiquetas: {
      etiqueta: {
        nombre: string
      }
    }[]
  }[]
}

export function MisPublicaciones({ publicaciones: publicacionesIniciales }: MisPublicacionesProps) {
  const [publicaciones, setPublicaciones] = useState(publicacionesIniciales)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [publicacionEditando, setPublicacionEditando] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const cambiarEstado = async (id: string, nuevoEstado: 'BORRADOR' | 'PUBLICADO') => {
    setLoading(id)
    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        setPublicaciones(prev => prev.map(p => 
          p.id === id ? { ...p, estado: nuevoEstado } : p
        ))
        toast.success(`Publicación ${nuevoEstado.toLowerCase()}`)
      } else {
        toast.error('Error al cambiar estado')
      }
    } catch (error) {
      toast.error('Error al cambiar estado')
    } finally {
      setLoading(null)
    }
  }

  const eliminarPublicacion = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPublicaciones(prev => prev.filter(p => p.id !== id))
        toast.success('Publicación eliminada')
      } else {
        toast.error('Error al eliminar publicación')
      }
    } catch (error) {
      toast.error('Error al eliminar publicación')
    } finally {
      setLoading(null)
    }
  }

  const onFormularioExito = () => {
    setMostrarFormulario(false)
    setPublicacionEditando(null)
    // Recargar la página para obtener datos actualizados
    window.location.reload()
  }

  if (mostrarFormulario || publicacionEditando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {publicacionEditando ? 'Editar Publicación' : 'Nueva Publicación'}
          </h2>
          <Button 
            variant="secondary" 
            onClick={() => {
              setMostrarFormulario(false)
              setPublicacionEditando(null)
            }}
          >
            Cancelar
          </Button>
        </div>
        <PublicacionForm 
          publicacion={publicacionEditando}
          onSuccess={onFormularioExito}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">
            {publicaciones.length} publicaciones en total
          </p>
        </div>
        <Button onClick={() => setMostrarFormulario(true)}>
          Nueva Publicación
        </Button>
      </div>

      {publicaciones.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes publicaciones aún
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primera publicación para comenzar a compartir con la comunidad
            </p>
            <Button onClick={() => setMostrarFormulario(true)}>
              Crear Primera Publicación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {publicaciones.map((publicacion) => (
            <Card key={publicacion.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {publicacion.titulo}
                      </h3>
                      <Badge 
                        variant={publicacion.estado === 'PUBLICADO' ? 'success' : 'warning'}
                      >
                        {publicacion.estado}
                      </Badge>
                      {!publicacion.visible && (
                        <Badge variant="danger">Oculto</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 mb-3">
                      Creado: {formatearFecha(publicacion.creadoEn)} • 
                      Actualizado: {formatearFecha(publicacion.actualizadoEn)}
                    </div>

                    <div className="text-gray-700 mb-4">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: publicacion.contenido.substring(0, 200) + '...' 
                        }} 
                      />
                    </div>

                    {publicacion.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {publicacion.etiquetas.map((etiqueta, index) => (
                          <Badge key={index} variant="primary" className="text-xs">
                            {etiqueta.etiqueta.nombre}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{publicacion._count.meGustas} me gusta</span>
                      <span>{publicacion._count.comentarios} comentarios</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {publicacion.estado === 'PUBLICADO' && (
                      <Link href={`/publicacion/${publicacion.slug}`}>
                        <Button variant="secondary" size="sm">
                          Ver
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      size="sm" 
                      onClick={() => setPublicacionEditando(publicacion)}
                      disabled={loading === publicacion.id}
                    >
                      Editar
                    </Button>

                    {publicacion.estado === 'BORRADOR' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cambiarEstado(publicacion.id, 'PUBLICADO')}
                        loading={loading === publicacion.id}
                      >
                        Publicar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cambiarEstado(publicacion.id, 'BORRADOR')}
                        loading={loading === publicacion.id}
                      >
                        Despublicar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => eliminarPublicacion(publicacion.id)}
                      loading={loading === publicacion.id}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
