import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const actualizarPublicacionSchema = z.object({
  titulo: z.string().min(1).max(200).optional(),
  contenido: z.string().min(1).optional(),
  estado: z.enum(['BORRADOR', 'PUBLICADO']).optional(),
  visible: z.boolean().optional(),
  etiquetas: z.array(z.string()).optional(),
})

// GET /api/publicaciones/[id] - Obtener publicación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: params.id },
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

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Solo mostrar publicaciones públicas o si es el autor/admin
    const session = await getServerSession(authOptions)
    const esAutorOAdmin = session?.user && (
      session.user.id === publicacion.autorId || 
      session.user.role === 'ADMIN'
    )

    if (publicacion.estado !== 'PUBLICADO' && !esAutorOAdmin) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    if (!publicacion.visible && !esAutorOAdmin) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(publicacion)
  } catch (error) {
    console.error('Error obteniendo publicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/publicaciones/[id] - Actualizar publicación
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: params.id }
    })

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const esAutorOAdmin = session.user.id === publicacion.autorId || session.user.role === 'ADMIN'
    if (!esAutorOAdmin) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const datos = actualizarPublicacionSchema.parse(body)

    const datosActualizacion: any = {}

    if (datos.titulo) {
      datosActualizacion.titulo = sanitizeText(datos.titulo)
    }

    if (datos.contenido) {
      datosActualizacion.contenido = sanitizeHtml(datos.contenido)
    }

    if (datos.estado) {
      datosActualizacion.estado = datos.estado
    }

    if (typeof datos.visible === 'boolean' && session.user.role === 'ADMIN') {
      datosActualizacion.visible = datos.visible
    }

    const publicacionActualizada = await prisma.publicacion.update({
      where: { id: params.id },
      data: datosActualizacion,
      include: {
        autor: {
          select: { id: true, nombre: true, email: true }
        },
        etiquetas: {
          include: { etiqueta: true }
        }
      }
    })

    // Actualizar etiquetas si se proporcionaron
    if (datos.etiquetas) {
      // Eliminar etiquetas existentes
      await prisma.publicacionEtiqueta.deleteMany({
        where: { publicacionId: params.id }
      })

      // Crear nuevas etiquetas
      for (const nombreEtiqueta of datos.etiquetas) {
        const etiquetaLimpia = sanitizeText(nombreEtiqueta)
        
        let etiqueta = await prisma.etiqueta.findUnique({
          where: { nombre: etiquetaLimpia }
        })

        if (!etiqueta) {
          etiqueta = await prisma.etiqueta.create({
            data: { nombre: etiquetaLimpia }
          })
        }

        await prisma.publicacionEtiqueta.create({
          data: {
            publicacionId: params.id,
            etiquetaId: etiqueta.id
          }
        })
      }
    }

    await registrarAuditoria(session.user.id, 'actualizar', 'publicacion', params.id)

    return NextResponse.json(publicacionActualizada)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando publicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/publicaciones/[id] - Eliminar publicación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: params.id }
    })

    if (!publicacion) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const esAutorOAdmin = session.user.id === publicacion.autorId || session.user.role === 'ADMIN'
    if (!esAutorOAdmin) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    await prisma.publicacion.delete({
      where: { id: params.id }
    })

    await registrarAuditoria(session.user.id, 'eliminar', 'publicacion', params.id)

    return NextResponse.json({ message: 'Publicación eliminada' })
  } catch (error) {
    console.error('Error eliminando publicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
