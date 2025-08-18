import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PublicacionDetalle } from '@/components/publicaciones/PublicacionDetalle'

interface PublicacionPageProps {
  params: { slug: string }
}

async function getPublicacion(slug: string) {
  const publicacion = await prisma.publicacion.findUnique({
    where: { slug },
    include: {
      autor: {
        select: { id: true, nombre: true, email: true }
      },
      comentarios: {
        where: { visible: true },
        include: {
          autor: {
            select: { id: true, nombre: true }
          }
        },
        orderBy: { creadoEn: 'desc' }
      },
      _count: {
        select: { comentarios: true, meGustas: true }
      },
      etiquetas: {
        include: { etiqueta: true }
      }
    }
  })

  return publicacion
}

export async function generateMetadata({ params }: PublicacionPageProps) {
  const publicacion = await getPublicacion(params.slug)

  if (!publicacion) {
    return {
      title: 'Publicación no encontrada',
    }
  }

  return {
    title: publicacion.titulo,
    description: publicacion.contenido.substring(0, 160),
    openGraph: {
      title: publicacion.titulo,
      description: publicacion.contenido.substring(0, 160),
      type: 'article',
      authors: [publicacion.autor.nombre || publicacion.autor.email],
    },
  }
}

export default async function PublicacionPage({ params }: PublicacionPageProps) {
  const session = await getServerSession(authOptions)
  const publicacionRaw = await getPublicacion(params.slug)

  if (!publicacionRaw) {
    notFound()
  }

  // Verificar si la publicación es visible
  const esAutorOAdmin = session?.user && (
    session.user.id === publicacionRaw.autorId || 
    session.user.role === 'ADMIN'
  )

  if (publicacionRaw.estado !== 'PUBLICADO' && !esAutorOAdmin) {
    notFound()
  }

  if (!publicacionRaw.visible && !esAutorOAdmin) {
    notFound()
  }

  // Convertir fechas a strings para evitar errores de serialización
  const publicacion = {
    ...publicacionRaw,
    creadoEn: publicacionRaw.creadoEn.toISOString(),
    actualizadoEn: publicacionRaw.actualizadoEn.toISOString(),
    estado: publicacionRaw.estado as string,
    autor: {
      ...publicacionRaw.autor,
      nombre: publicacionRaw.autor.nombre || publicacionRaw.autor.email
    },
    comentarios: publicacionRaw.comentarios.map(comentario => ({
      ...comentario,
      creadoEn: comentario.creadoEn.toISOString(),
      actualizadoEn: comentario.actualizadoEn.toISOString(),
      autor: {
        ...comentario.autor,
        nombre: comentario.autor.nombre || 'Usuario'
      }
    })),
    etiquetas: publicacionRaw.etiquetas.map(et => ({
      ...et,
      etiqueta: {
        ...et.etiqueta,
        creadoEn: et.etiqueta.creadoEn.toISOString()
      }
    }))
  }

  // Convertir usuario actual para evitar problemas de tipos
  const usuarioActual = session?.user ? {
    ...session.user,
    name: session.user.name || undefined
  } : null

  return (
    <div className="max-w-4xl mx-auto">
      <PublicacionDetalle 
        publicacion={publicacion} 
        usuarioActual={usuarioActual}
      />
    </div>
  )
}
