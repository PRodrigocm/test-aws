'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface Publicacion {
  id: string
  titulo: string
  slug: string
  contenido: string
  estado: string
  visible: boolean
  creadoEn: string
  autor: {
    id: string
    nombre: string | null
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

export function ModerarPublicaciones() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroVisible, setFiltroVisible] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const cargarPublicaciones = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda)

      const response = await fetch(`/api/publicaciones?${params}&admin=true`)
      const data = await response.json()

      if (response.ok) {
        let publicacionesFiltradas = data.publicaciones

        if (filtroEstado) {
          publicacionesFiltradas = publicacionesFiltradas.filter((p: Publicacion) => p.estado === filtroEstado)
        }

        if (filtroVisible !== '') {
          const visible = filtroVisible === 'true'
          publicacionesFiltradas = publicacionesFiltradas.filter((p: Publicacion) => p.visible === visible)
        }

        setPublicaciones(publicacionesFiltradas)
      }
    } catch (error) {
      toast.error('Error cargando publicaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [busqueda, filtroEstado, filtroVisible])

  const toggleVisible = async (id: string, visible: boolean) => {
    setLoadingAction(id)
    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !visible }),
      })

      if (response.ok) {
        toast.success(`Publicación ${!visible ? 'mostrada' : 'ocultada'}`)
        cargarPublicaciones()
      } else {
        toast.error('Error al cambiar visibilidad')
      }
    } catch (error) {
      toast.error('Error al cambiar visibilidad')
    } finally {
      setLoadingAction(null)
    }
  }

  const cambiarEstado = async (id: string, nuevoEstado: 'BORRADOR' | 'PUBLICADO') => {
    setLoadingAction(id)
    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      if (response.ok) {
        toast.success(`Publicación ${nuevoEstado.toLowerCase()}`)
        cargarPublicaciones()
      } else {
        toast.error('Error al cambiar estado')
      }
    } catch (error) {
      toast.error('Error al cambiar estado')
    } finally {
      setLoadingAction(null)
    }
  }

  const eliminarPublicacion = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return
    }

    setLoadingAction(id)
    try {
      const response = await fetch(`/api/publicaciones/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Publicación eliminada')
        cargarPublicaciones()
      } else {
        toast.error('Error al eliminar publicación')
      }
    } catch (error) {
      toast.error('Error al eliminar publicación')
    } finally {
      setLoadingAction(null)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const truncarContenido = (contenido: string, limite: number = 150) => {
    if (contenido.length <= limite) return contenido
    return contenido.substring(0, limite) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-600 font-medium">Cargando publicaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">📝 Moderación de Publicaciones</h1>
            <p className="text-green-100 text-lg">Gestiona el contenido de la comunidad</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{publicaciones.length}</div>
            <div className="text-green-100">Publicaciones</div>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{publicaciones.filter(p => p.estado === 'PUBLICADO').length}</div>
            <div className="text-green-100">Publicadas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{publicaciones.filter(p => p.visible).length}</div>
            <div className="text-green-100">Visibles</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{publicaciones.reduce((acc, p) => acc + p._count.meGustas, 0)}</div>
            <div className="text-green-100">Me gustas totales</div>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filtros de búsqueda</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder="🔍 Buscar publicaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              title="Filtrar por estado"
            >
              <option value="">📄 Todos los estados</option>
              <option value="BORRADOR">✏️ Borrador</option>
              <option value="PUBLICADO">✅ Publicado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidad</label>
            <select
              value={filtroVisible}
              onChange={(e) => setFiltroVisible(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 bg-gray-50 focus:bg-white transition-colors"
              title="Filtrar por visibilidad"
            >
              <option value="">👁️ Todas las visibilidades</option>
              <option value="true">✅ Visible</option>
              <option value="false">❌ Oculto</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setBusqueda('')
                setFiltroEstado('')
                setFiltroVisible('')
              }}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
            >
              🗑️ Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de publicaciones mejorada */}
      <div className="space-y-4">
        {publicaciones.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron publicaciones</h3>
              <p className="text-gray-500">Ajusta los filtros para ver más contenido</p>
            </CardContent>
          </Card>
        ) : (
          publicaciones.map((publicacion) => (
            <Card key={publicacion.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-green-500 bg-gradient-to-r from-white to-green-50/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        📝
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                          {publicacion.titulo}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={publicacion.estado === 'PUBLICADO' ? 'success' : 'warning'}
                            className={`${publicacion.estado === 'PUBLICADO' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-yellow-500 to-orange-600'} text-white shadow-md`}
                          >
                            {publicacion.estado === 'PUBLICADO' ? '✅ PUBLICADO' : '✏️ BORRADOR'}
                          </Badge>
                          <Badge 
                            variant={publicacion.visible ? 'success' : 'danger'}
                            className={`${publicacion.visible ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-red-500 to-pink-600'} text-white shadow-md`}
                          >
                            {publicacion.visible ? '👁️ VISIBLE' : '🚫 OCULTO'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Por {publicacion.autor.nombre || publicacion.autor.email}</span>
                        <span className="mx-2">•</span>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formatearFecha(publicacion.creadoEn)}</span>
                      </div>
                      
                      <div className="text-gray-700 text-sm leading-relaxed">
                        <div dangerouslySetInnerHTML={{ 
                          __html: truncarContenido(publicacion.contenido) 
                        }} />
                      </div>
                    </div>

                    {publicacion.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {publicacion.etiquetas.map((etiqueta, index) => (
                          <Badge key={index} variant="primary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                            🏷️ {etiqueta.etiqueta.nombre}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">{publicacion._count.meGustas}</div>
                        <div className="text-sm text-red-700 font-medium">❤️ Me gustas</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{publicacion._count.comentarios}</div>
                        <div className="text-sm text-blue-700 font-medium">💬 Comentarios</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    {publicacion.estado === 'PUBLICADO' && publicacion.visible && (
                      <Link href={`/publicacion/${publicacion.slug}`}>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                          👁️ Ver
                        </Button>
                      </Link>
                    )}

                    <Button
                      size="sm"
                      variant={publicacion.visible ? 'secondary' : 'primary'}
                      onClick={() => toggleVisible(publicacion.id, publicacion.visible)}
                      loading={loadingAction === publicacion.id}
                      className={`${publicacion.visible 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                      } text-white shadow-md transform hover:scale-105 transition-all duration-200`}
                    >
                      {publicacion.visible ? '🚫 Ocultar' : '👁️ Mostrar'}
                    </Button>

                    {publicacion.estado === 'BORRADOR' ? (
                      <Button
                        size="sm"
                        onClick={() => cambiarEstado(publicacion.id, 'PUBLICADO')}
                        loading={loadingAction === publicacion.id}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        ✅ Publicar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => cambiarEstado(publicacion.id, 'BORRADOR')}
                        loading={loadingAction === publicacion.id}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        ✏️ Despublicar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => eliminarPublicacion(publicacion.id)}
                      loading={loadingAction === publicacion.id}
                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
