import { requiereAdmin } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'

async function getEstadisticas() {
  const [usuarios, publicaciones, comentarios, auditorias] = await Promise.all([
    prisma.usuario.count(),
    prisma.publicacion.count(),
    prisma.comentario.count(),
    prisma.auditoria.count()
  ])

  const usuariosActivos = await prisma.usuario.count({
    where: { activo: true }
  })

  const publicacionesPublicadas = await prisma.publicacion.count({
    where: { estado: 'PUBLICADO', visible: true }
  })

  return {
    usuarios,
    usuariosActivos,
    publicaciones,
    publicacionesPublicadas,
    comentarios,
    auditorias
  }
}

export const metadata = {
  title: 'Panel de Administración - Foro App',
  description: 'Panel de control para administradores',
}

export default async function AdminPage() {
  await requiereAdmin()
  const stats = await getEstadisticas()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              🛡️ Panel de Administración
            </h1>
            <p className="text-indigo-100 text-lg">
              Gestiona usuarios, contenido y modera la comunidad
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.usuarios}</div>
            <div className="text-indigo-100">Usuarios totales</div>
          </div>
        </div>
      </div>

      {/* Estadísticas mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.usuarios}
              </div>
              <div className="text-sm font-semibold text-blue-700">
                Usuarios Totales
              </div>
              <div className="text-xs text-blue-600 mt-1 bg-blue-200 rounded-full px-2 py-1">
                {stats.usuariosActivos} activos
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">📝</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.publicaciones}
              </div>
              <div className="text-sm font-semibold text-green-700">
                Publicaciones Totales
              </div>
              <div className="text-xs text-green-600 mt-1 bg-green-200 rounded-full px-2 py-1">
                {stats.publicacionesPublicadas} publicadas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">💬</span>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.comentarios}
              </div>
              <div className="text-sm font-semibold text-purple-700">
                Comentarios
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.auditorias}
              </div>
              <div className="text-sm font-semibold text-orange-700">
                Registros de Auditoría
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enlaces de navegación mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/usuarios">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30 transform hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">👥</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Gestión de Usuarios</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                ✨ Crear, editar, desactivar usuarios y gestionar roles
              </p>
              <div className="mt-3 text-xs text-blue-600 font-medium">
                → Ver interfaz mejorada
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/publicaciones">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-green-500 bg-gradient-to-r from-white to-green-50/30 transform hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📝</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">Moderación de Publicaciones</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                🔍 Revisar, ocultar y gestionar publicaciones de la comunidad
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/comentarios">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500 bg-gradient-to-r from-white to-purple-50/30 transform hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Moderación de Comentarios</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                🛡️ Revisar y moderar comentarios inapropiados
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/auditoria">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500 bg-gradient-to-r from-white to-orange-50/30 transform hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">Auditoría</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                📋 Ver registro de todas las acciones del sistema
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="group border-dashed border-2 border-gray-300 bg-gray-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">⚙️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-500">Configuración</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              🔧 Configuración general del sistema
            </p>
            <div className="mt-2 text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-1 inline-block">
              Próximamente
            </div>
          </CardContent>
        </Card>

        <Card className="group border-dashed border-2 border-gray-300 bg-gray-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📈</span>
              </div>
              <h3 className="text-lg font-bold text-gray-500">Reportes</h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">
              📊 Reportes y analytics detallados
            </p>
            <div className="mt-2 text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-1 inline-block">
              Próximamente
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
