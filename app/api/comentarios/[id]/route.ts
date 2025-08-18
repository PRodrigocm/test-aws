import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sanitizeHtml } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const actualizarComentarioSchema = z.object({
  contenido: z.string().min(1).max(1000).optional(),
  visible: z.boolean().optional(),
})

// PATCH /api/comentarios/[id] - Actualizar comentario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const comentario = await prisma.comentario.findUnique({
      where: { id: params.id }
    })

    if (!comentario) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const esAutorOAdmin = session.user.id === comentario.autorId || session.user.role === 'ADMIN'
    if (!esAutorOAdmin) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const datos = actualizarComentarioSchema.parse(body)

    const datosActualizacion: any = {}

    if (datos.contenido) {
      datosActualizacion.contenido = sanitizeHtml(datos.contenido)
    }

    if (typeof datos.visible === 'boolean' && session.user.role === 'ADMIN') {
      datosActualizacion.visible = datos.visible
    }

    const comentarioActualizado = await prisma.comentario.update({
      where: { id: params.id },
      data: datosActualizacion,
      include: {
        autor: {
          select: { id: true, nombre: true }
        }
      }
    })

    await registrarAuditoria(session.user.id, 'actualizar', 'comentario', params.id)

    return NextResponse.json(comentarioActualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/comentarios/[id] - Eliminar comentario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const comentario = await prisma.comentario.findUnique({
      where: { id: params.id }
    })

    if (!comentario) {
      return NextResponse.json(
        { error: 'Comentario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const esAutorOAdmin = session.user.id === comentario.autorId || session.user.role === 'ADMIN'
    if (!esAutorOAdmin) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    await prisma.comentario.delete({
      where: { id: params.id }
    })

    await registrarAuditoria(session.user.id, 'eliminar', 'comentario', params.id)

    return NextResponse.json({ message: 'Comentario eliminado' })
  } catch (error) {
    console.error('Error eliminando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
