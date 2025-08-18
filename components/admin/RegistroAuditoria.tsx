'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'

interface RegistroAuditoria {
  id: string
  accion: string
  entidad: string
  entidadId: string
  creadoEn: string
  actor: {
    id: string
    nombre: string | null
    email: string
  }
}

export function RegistroAuditoria() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroAccion, setFiltroAccion] = useState('')
  const [filtroEntidad, setFiltroEntidad] = useState('')

  const cargarRegistros = async () => {
    try {
      // Para esta demo, usamos datos de ejemplo
      const registrosEjemplo: RegistroAuditoria[] = [
        {
          id: '1',
          accion: 'crear',
          entidad: 'usuario',
          entidadId: 'user123',
          creadoEn: new Date().toISOString(),
          actor: { id: 'admin1', nombre: 'Admin', email: 'admin@demo.com' }
        },
        {
          id: '2',
          accion: 'actualizar',
          entidad: 'publicacion',
          entidadId: 'post456',
          creadoEn: new Date(Date.now() - 3600000).toISOString(),
          actor: { id: 'user1', nombre: 'Usuario Demo', email: 'user@demo.com' }
        },
        {
          id: '3',
          accion: 'eliminar',
          entidad: 'comentario',
          entidadId: 'comment789',
          creadoEn: new Date(Date.now() - 7200000).toISOString(),
          actor: { id: 'admin1', nombre: 'Admin', email: 'admin@demo.com' }
        }
      ]

      let registrosFiltrados = registrosEjemplo

      if (busqueda) {
        registrosFiltrados = registrosFiltrados.filter(r =>
          r.actor.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.actor.email.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.entidadId.toLowerCase().includes(busqueda.toLowerCase())
        )
      }

      if (filtroAccion) {
        registrosFiltrados = registrosFiltrados.filter(r => r.accion === filtroAccion)
      }

      if (filtroEntidad) {
        registrosFiltrados = registrosFiltrados.filter(r => r.entidad === filtroEntidad)
      }

      setRegistros(registrosFiltrados)
    } catch (error) {
      console.error('Error cargando registros de auditoría:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRegistros()
  }, [busqueda, filtroAccion, filtroEntidad])

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'crear': return 'success'
      case 'actualizar': return 'warning'
      case 'eliminar': return 'danger'
      default: return 'secondary'
    }
  }

  const getEntidadColor = (entidad: string) => {
    switch (entidad) {
      case 'usuario': return 'primary'
      case 'publicacion': return 'success'
      case 'comentario': return 'warning'
      default: return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Cargando registros de auditoría...</p>
        </div>
      </div>
    )
  }

  const totalRegistros = registros.length
  const accionesPorTipo = {
    crear: registros.filter(r => r.accion === 'crear').length,
    actualizar: registros.filter(r => r.accion === 'actualizar').length,
    eliminar: registros.filter(r => r.accion === 'eliminar').length
  }

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              🔍 Registro de Auditoría
            </h1>
            <p className="text-blue-100 text-lg">
              Monitorea todas las actividades del sistema
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold">{totalRegistros}</div>
              <div className="text-sm text-blue-200">Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-green-300">{accionesPorTipo.crear}</div>
              <div className="text-sm text-blue-200">Crear</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-300">{accionesPorTipo.actualizar}</div>
              <div className="text-sm text-blue-200">Actualizar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-red-300">{accionesPorTipo.eliminar}</div>
              <div className="text-sm text-blue-200">Eliminar</div>
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
              placeholder="Buscar por usuario o ID..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              title="Filtrar por acción"
            >
              <option value="">Todas las acciones</option>
              <option value="crear">✅ Crear</option>
              <option value="actualizar">✏️ Actualizar</option>
              <option value="eliminar">🗑️ Eliminar</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
              </svg>
            </div>
            <select
              value={filtroEntidad}
              onChange={(e) => setFiltroEntidad(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              title="Filtrar por entidad"
            >
              <option value="">Todas las entidades</option>
              <option value="usuario">👤 Usuario</option>
              <option value="publicacion">📝 Publicación</option>
              <option value="comentario">💬 Comentario</option>
            </select>
          </div>

          <button
            onClick={() => {
              setBusqueda('')
              setFiltroAccion('')
              setFiltroEntidad('')
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="space-y-4">
        {registros.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay registros</h3>
            <p className="text-gray-500">No se encontraron registros de auditoría que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          registros.map((registro) => (
            <div 
              key={registro.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        registro.accion === 'crear' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                          : registro.accion === 'actualizar'
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                          : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
                      }`}>
                        <span className="mr-1">
                          {registro.accion === 'crear' ? '✅' : registro.accion === 'actualizar' ? '✏️' : '🗑️'}
                        </span>
                        {registro.accion.toUpperCase()}
                      </div>
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        registro.entidad === 'usuario' 
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' 
                          : registro.entidad === 'publicacion'
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
                          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200'
                      }`}>
                        <span className="mr-1">
                          {registro.entidad === 'usuario' ? '👤' : registro.entidad === 'publicacion' ? '📝' : '💬'}
                        </span>
                        {registro.entidad.toUpperCase()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {registro.actor.nombre?.charAt(0)?.toUpperCase() || registro.actor.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {registro.actor.nombre || registro.actor.email}
                        </div>
                        <div className="text-gray-500 flex items-center space-x-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          <span>ID: {registro.entidadId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatearFecha(registro.creadoEn)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {registros.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">Mostrando {registros.length} registros de auditoría</span>
          </div>
        </div>
      )}
    </div>
  )
}
