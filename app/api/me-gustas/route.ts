import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const toggleMeGustaSchema = z.object({
  publicacionId: z.string().cuid(),
})

// POST /api/me-gustas - Toggle like/unlike
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { publicacionId } = toggleMeGustaSchema.parse(body)

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

    // Verificar si ya existe un "me gusta"
    const meGustaExistente = await prisma.meGusta.findUnique({
      where: {
        usuarioId_publicacionId: {
          usuarioId: session.user.id,
          publicacionId,
        }
      }
    })

    let accion: 'like' | 'unlike'

    if (meGustaExistente) {
      // Quitar "me gusta"
      await prisma.meGusta.delete({
        where: { id: meGustaExistente.id }
      })
      accion = 'unlike'
    } else {
      // Agregar "me gusta"
      await prisma.meGusta.create({
        data: {
          usuarioId: session.user.id,
          publicacionId,
        }
      })
      accion = 'like'
    }

    // Contar total de "me gusta"
    const totalMeGustas = await prisma.meGusta.count({
      where: { publicacionId }
    })

    return NextResponse.json({
      accion,
      totalMeGustas,
      meGusta: accion === 'like'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error en toggle me gusta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
