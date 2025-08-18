import { requiereUsuario } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { PerfilForm } from '@/components/perfil/PerfilForm'

async function getUsuario(id: string) {
  return await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      creadoEn: true,
      _count: {
        select: { publicaciones: true, comentarios: true }
      }
    }
  })
}

export const metadata = {
  title: 'Mi Perfil - Foro App',
  description: 'Gestiona tu perfil de usuario',
}

export default async function PerfilPage() {
  const usuarioActual = await requiereUsuario()
  const usuarioRaw = await getUsuario(usuarioActual.id)

  if (!usuarioRaw) {
    throw new Error('Usuario no encontrado')
  }

  // Convertir fechas a strings para evitar errores de serialización
  const usuario = {
    ...usuarioRaw,
    creadoEn: usuarioRaw.creadoEn.toISOString(),
    rol: usuarioRaw.rol as string
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-600">
          Gestiona tu información personal
        </p>
      </div>

      <PerfilForm usuario={usuario} />
    </div>
  )
}
