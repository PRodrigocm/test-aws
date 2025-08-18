import { Suspense } from 'react'
import { PublicacionesFeed } from '@/components/publicaciones/PublicacionesFeed'
import { BusquedaPublicaciones } from '@/components/publicaciones/BusquedaPublicaciones'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenido al Foro
        </h1>
        <p className="text-gray-600">
          Descubre las últimas publicaciones de la comunidad
        </p>
      </div>

      <div className="mb-6">
        <BusquedaPublicaciones />
      </div>

      <Suspense fallback={
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
      }>
        <PublicacionesFeed />
      </Suspense>
    </div>
  )
}
