'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['USUARIO', 'ADMIN']),
})

type CrearUsuarioFormData = z.infer<typeof crearUsuarioSchema>

interface Usuario {
  id: string
  nombre: string | null
  email: string
  rol: string
  activo: boolean
  creadoEn: string
  _count: {
    publicaciones: number
    comentarios: number
  }
}

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CrearUsuarioFormData>({
    resolver: zodResolver(crearUsuarioSchema)
  })

  const cargarUsuarios = async () => {
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('busqueda', busqueda)

      const response = await fetch(`/api/usuarios?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsuarios(data.usuarios)
      }
    } catch (error) {
      toast.error('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [busqueda])

  const onSubmit = async (data: CrearUsuarioFormData) => {
    setLoadingAction('crear')
    try {
      const url = usuarioEditando ? `/api/usuarios/${usuarioEditando.id}` : '/api/usuarios'
      const method = usuarioEditando ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(usuarioEditando ? 'Usuario actualizado' : 'Usuario creado')
        reset()
        setMostrarFormulario(false)
        setUsuarioEditando(null)
        cargarUsuarios()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar usuario')
      }
    } catch (error) {
      toast.error('Error al guardar usuario')
    } finally {
      setLoadingAction(null)
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    setLoadingAction(id)
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !activo }),
      })

      if (response.ok) {
        toast.success(`Usuario ${!activo ? 'activado' : 'desactivado'}`)
        cargarUsuarios()
      } else {
        toast.error('Error al cambiar estado del usuario')
      }
    } catch (error) {
      toast.error('Error al cambiar estado del usuario')
    } finally {
      setLoadingAction(null)
    }
  }

  const eliminarUsuario = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return
    }

    setLoadingAction(id)
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Usuario eliminado')
        cargarUsuarios()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar usuario')
    } finally {
      setLoadingAction(null)
    }
  }

  const editarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario)
    setValue('nombre', usuario.nombre || '')
    setValue('email', usuario.email)
    setValue('rol', usuario.rol as 'USUARIO' | 'ADMIN')
    setMostrarFormulario(true)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header con gradiente y estadísticas */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">👥 Gestión de Usuarios</h1>
            <p className="text-blue-100 text-lg">Administra los usuarios de tu plataforma</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{usuarios.length}</div>
            <div className="text-blue-100">Usuarios totales</div>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{usuarios.filter(u => u.activo).length}</div>
            <div className="text-blue-100">Usuarios activos</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{usuarios.filter(u => u.rol === 'ADMIN').length}</div>
            <div className="text-blue-100">Administradores</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl font-bold">{usuarios.reduce((acc, u) => acc + u._count.publicaciones, 0)}</div>
            <div className="text-blue-100">Publicaciones totales</div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y botón crear mejorada */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder="🔍 Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
        <Button 
          onClick={() => {
            setMostrarFormulario(true)
            setUsuarioEditando(null)
            reset()
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 px-6 py-3 font-semibold"
        >
          ✨ Crear Usuario
        </Button>
      </div>

      {/* Formulario crear/editar mejorado */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {usuarioEditando ? '✏️ Editar Usuario' : '🆕 Crear Usuario'}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {usuarioEditando ? 'Modifica la información del usuario' : 'Agrega un nuevo usuario al sistema'}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setUsuarioEditando(null)
                    reset()
                  }}
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                >
                  ✕ Cerrar
                </Button>
              </div>
            </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  {...register('nombre')}
                  error={errors.nombre?.message}
                  disabled={loadingAction === 'crear'}
                />

                <Input
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={loadingAction === 'crear' || !!usuarioEditando}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!usuarioEditando && (
                  <Input
                    label="Contraseña"
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                    disabled={loadingAction === 'crear'}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    {...register('rol')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={loadingAction === 'crear'}
                  >
                    <option value="USUARIO">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  {errors.rol && (
                    <p className="text-sm text-red-600 mt-1">{errors.rol.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMostrarFormulario(false)
                    setUsuarioEditando(null)
                    reset()
                  }}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={loadingAction === 'crear'}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-3 font-semibold shadow-lg"
                >
                  {usuarioEditando ? '💾 Actualizar' : '🚀 Crear'} Usuario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Lista de usuarios mejorada */}
      <div className="space-y-4">
        {usuarios.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500 mb-6">Comienza creando tu primer usuario</p>
              <Button
                onClick={() => {
                  setMostrarFormulario(true)
                  setUsuarioEditando(null)
                  reset()
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                ✨ Crear Usuario
              </Button>
            </CardContent>
          </Card>
        ) : (
          usuarios.map((usuario, index) => (
            <Card key={usuario.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-r from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {usuario.nombre || 'Sin nombre'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={usuario.rol === 'ADMIN' ? 'danger' : 'primary'}
                            className={`${usuario.rol === 'ADMIN' ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white shadow-md`}
                          >
                            {usuario.rol === 'ADMIN' ? '👑 ADMIN' : '👤 USUARIO'}
                          </Badge>
                          <Badge 
                            variant={usuario.activo ? 'success' : 'secondary'}
                            className={`${usuario.activo ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gray-300 text-gray-600'} shadow-md`}
                          >
                            {usuario.activo ? '✅ Activo' : '⏸️ Inactivo'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <span className="font-medium">{usuario.email}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-7-3h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Miembro desde: {formatearFecha(usuario.creadoEn)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{usuario._count.publicaciones}</div>
                        <div className="text-sm text-blue-700 font-medium">📝 Publicaciones</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{usuario._count.comentarios}</div>
                        <div className="text-sm text-green-700 font-medium">💬 Comentarios</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    <Button
                      size="sm"
                      onClick={() => editarUsuario(usuario)}
                      disabled={loadingAction === usuario.id}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      ✏️ Editar
                    </Button>

                    <Button
                      size="sm"
                      variant={usuario.activo ? 'secondary' : 'primary'}
                      onClick={() => toggleActivo(usuario.id, usuario.activo)}
                      loading={loadingAction === usuario.id}
                      className={`${usuario.activo 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      } text-white shadow-md transform hover:scale-105 transition-all duration-200`}
                    >
                      {usuario.activo ? '⏸️ Desactivar' : '▶️ Activar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => eliminarUsuario(usuario.id)}
                      loading={loadingAction === usuario.id}
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
