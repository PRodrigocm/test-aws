import { requiereUsuario } from '@/lib/authz'
import { prisma } from '@/lib/db'
import { MisPublicaciones } from '@/components/dashboard/MisPublicaciones'

async function getMisPublicaciones(usuarioId: string) {
  return await prisma.publicacion.findMany({
    where: { autorId: usuarioId },
    include: {
      _count: {
        select: { comentarios: true, meGustas: true }
      },
      etiquetas: {
        include: { etiqueta: true }
      }
    },
    orderBy: { actualizadoEn: 'desc' }
  })
}

export const metadata = {
  title: 'Mis Publicaciones - Foro App',
  description: 'Gestiona tus publicaciones',
}

export default async function MisPublicacionesPage() {
  const usuario = await requiereUsuario()
  const publicacionesRaw = await getMisPublicaciones(usuario.id)
  
  // Convertir fechas a strings para evitar errores de serialización
  const publicaciones = publicacionesRaw.map(pub => ({
    ...pub,
    creadoEn: pub.creadoEn.toISOString(),
    actualizadoEn: pub.actualizadoEn.toISOString(),
    etiquetas: pub.etiquetas.map(et => ({
      ...et,
      etiqueta: {
        ...et.etiqueta,
        creadoEn: et.etiqueta.creadoEn.toISOString()
      }
    }))
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Mis Publicaciones
        </h1>
        <p className="text-gray-600">
          Gestiona y edita tus publicaciones
        </p>
      </div>

      <MisPublicaciones publicaciones={publicaciones} />
    </div>
  )
}
