import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sanitizeHtml } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const crearComentarioSchema = z.object({
  contenido: z.string().min(1).max(1000),
  publicacionId: z.string().cuid(),
})

// POST /api/comentarios - Crear comentario
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { contenido, publicacionId } = crearComentarioSchema.parse(body)

    // Verificar que la publicación existe y está publicada
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: publicacionId }
    })

    if (!publicacion || publicacion.estado !== 'PUBLICADO' || !publicacion.visible) {
      return NextResponse.json(
        { error: 'Publicación no encontrada' },
        { status: 404 }
      )
    }

    const contenidoLimpio = sanitizeHtml(contenido)

    const comentario = await prisma.comentario.create({
      data: {
        contenido: contenidoLimpio,
        autorId: session.user.id,
        publicacionId,
      },
      include: {
        autor: {
          select: { id: true, nombre: true }
        }
      }
    })

    await registrarAuditoria(session.user.id, 'crear', 'comentario', comentario.id)

    return NextResponse.json(comentario, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
