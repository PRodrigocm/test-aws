'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface Comentario {
  id: string
  contenido: string
  visible: boolean
  creadoEn: string
  autor: {
    id: string
    nombre: string | null
  }
  publicacion: {
    id: string
    titulo: string
    slug: string
  }
}

export function ModerarComentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroVisible, setFiltroVisible] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const cargarComentarios = async () => {
    try {
      // Simulamos la carga de comentarios desde la API
      // En una implementación real, necesitarías crear este endpoint
      const response = await fetch('/api/comentarios?admin=true')
      
      if (response.ok) {
        const data = await response.json()
        let comentariosFiltrados = data.comentarios || []

        if (busqueda) {
          comentariosFiltrados = comentariosFiltrados.filter((c: Comentario) =>
            c.contenido.toLowerCase().includes(busqueda.toLowerCase()) ||
            c.autor.nombre?.toLowerCase().includes(busqueda.toLowerCase())
          )
        }

        if (filtroVisible !== '') {
          const visible = filtroVisible === 'true'
          comentariosFiltrados = comentariosFiltrados.filter((c: Comentario) => c.visible === visible)
        }

        setComentarios(comentariosFiltrados)
      }
    } catch (error) {
      // Para esta demo, usamos datos de ejemplo
      const comentariosEjemplo: Comentario[] = [
        {
          id: '1',
          contenido: 'Este es un comentario de ejemplo que podría necesitar moderación.',
          visible: true,
          creadoEn: new Date().toISOString(),
          autor: { id: '1', nombre: 'Usuario Ejemplo' },
          publicacion: { id: '1', titulo: 'Publicación de Ejemplo', slug: 'publicacion-ejemplo' }
        }
      ]
      setComentarios(comentariosEjemplo)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarComentarios()
  }, [busqueda, filtroVisible])

  const toggleVisible = async (id: string, visible: boolean) => {
    setLoadingAction(id)
    try {
      const response = await fetch(`/api/comentarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visible: !visible }),
      })

      if (response.ok) {
        toast.success(`Comentario ${!visible ? 'mostrado' : 'ocultado'}`)
        cargarComentarios()
      } else {
        toast.error('Error al cambiar visibilidad')
      }
    } catch (error) {
      toast.error('Error al cambiar visibilidad')
    } finally {
      setLoadingAction(null)
    }
  }

  const eliminarComentario = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return
    }

    setLoadingAction(id)
    try {
      const response = await fetch(`/api/comentarios/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Comentario eliminado')
        cargarComentarios()
      } else {
        toast.error('Error al eliminar comentario')
      }
    } catch (error) {
      toast.error('Error al eliminar comentario')
    } finally {
      setLoadingAction(null)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const truncarContenido = (contenido: string, limite: number = 200) => {
    if (contenido.length <= limite) return contenido
    return contenido.substring(0, limite) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 font-medium">Cargando comentarios...</p>
        </div>
      </div>
    )
  }

  const totalComentarios = comentarios.length
  const comentariosVisibles = comentarios.filter(c => c.visible).length
  const comentariosOcultos = comentarios.filter(c => !c.visible).length

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              💬 Moderación de Comentarios
            </h1>
            <p className="text-purple-100 text-lg">
              Gestiona y modera los comentarios de la comunidad
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{totalComentarios}</div>
              <div className="text-sm text-purple-200">Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-green-300">{comentariosVisibles}</div>
              <div className="text-sm text-purple-200">Visibles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-red-300">{comentariosOcultos}</div>
              <div className="text-sm text-purple-200">Ocultos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder="Buscar comentarios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <select
              value={filtroVisible}
              onChange={(e) => setFiltroVisible(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Todas las visibilidades</option>
              <option value="true">✅ Visible</option>
              <option value="false">❌ Oculto</option>
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setBusqueda('')
              setFiltroVisible('')
            }}
            className="flex items-center space-x-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpiar</span>
          </Button>

          <Button
            onClick={cargarComentarios}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comentarios.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay comentarios</h3>
            <p className="text-gray-500">No se encontraron comentarios que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          comentarios.map((comentario) => (
            <div 
              key={comentario.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        comentario.visible 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                      }`}>
                        <span className="mr-1">
                          {comentario.visible ? '✅' : '❌'}
                        </span>
                        {comentario.visible ? 'Visible' : 'Oculto'}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {comentario.autor.nombre?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <span className="font-medium">
                          {comentario.autor.nombre || 'Usuario anónimo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatearFecha(comentario.creadoEn)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-gray-700 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ 
                          __html: truncarContenido(comentario.contenido) 
                        }} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>En publicación:</span>
                      <Link 
                        href={`/publicacion/${comentario.publicacion.slug}`}
                        className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors duration-200"
                      >
                        {comentario.publicacion.titulo}
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    <Button
                      size="sm"
                      onClick={() => toggleVisible(comentario.id, comentario.visible)}
                      loading={loadingAction === comentario.id}
                      className={`flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 ${
                        comentario.visible 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }`}
                    >
                      <span>{comentario.visible ? '👁️‍🗨️' : '👁️'}</span>
                      <span>{comentario.visible ? 'Ocultar' : 'Mostrar'}</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => eliminarComentario(comentario.id)}
                      loading={loadingAction === comentario.id}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
                    >
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
