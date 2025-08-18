'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublicacionCard } from './PublicacionCard'
import { Button } from '@/components/ui/Button'

interface Publicacion {
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

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export function PublicacionesFeed() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const searchParams = useSearchParams()
  const busqueda = searchParams.get('busqueda') || ''
  const etiqueta = searchParams.get('etiqueta') || ''

  const fetchPublicaciones = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(busqueda && { busqueda }),
        ...(etiqueta && { etiqueta }),
      })

      const response = await fetch(`/api/publicaciones?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (append) {
          setPublicaciones(prev => [...prev, ...data.publicaciones])
        } else {
          setPublicaciones(data.publicaciones)
        }
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error cargando publicaciones:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPublicaciones(1, false)
  }, [busqueda, etiqueta])

  const loadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchPublicaciones(pagination.page + 1, true)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (publicaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron publicaciones
        </h3>
        <p className="text-gray-500">
          {busqueda || etiqueta 
            ? 'Intenta con otros términos de búsqueda'
            : 'Sé el primero en crear una publicación'
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {publicaciones.map((publicacion) => (
          <PublicacionCard key={publicacion.id} publicacion={publicacion} />
        ))}
      </div>

      {pagination && pagination.page < pagination.pages && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            loading={loadingMore}
            variant="secondary"
          >
            Cargar más publicaciones
          </Button>
        </div>
      )}

      {pagination && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {publicaciones.length} de {pagination.total} publicaciones
        </div>
      )}
    </div>
  )
}
