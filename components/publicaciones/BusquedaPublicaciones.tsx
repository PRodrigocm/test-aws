'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function BusquedaPublicaciones() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') || '')
  const etiquetaActual = searchParams.get('etiqueta') || ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (busqueda.trim()) {
      params.set('busqueda', busqueda.trim())
    }
    
    if (etiquetaActual) {
      params.set('etiqueta', etiquetaActual)
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    router.push('/')
  }

  const quitarEtiqueta = () => {
    const params = new URLSearchParams()
    if (busqueda.trim()) {
      params.set('busqueda', busqueda.trim())
    }
    
    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar publicaciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Button type="submit">
          Buscar
        </Button>
        {(busqueda || etiquetaActual) && (
          <Button type="button" variant="secondary" onClick={limpiarFiltros}>
            Limpiar
          </Button>
        )}
      </form>

      {/* Filtros activos */}
      {(busqueda || etiquetaActual) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          
          {busqueda && (
            <Badge variant="primary">
              Búsqueda: "{busqueda}"
            </Badge>
          )}
          
          {etiquetaActual && (
            <Badge variant="secondary" className="cursor-pointer" onClick={quitarEtiqueta}>
              Etiqueta: {etiquetaActual} ✕
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
