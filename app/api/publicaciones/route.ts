import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const crearPublicacionSchema = z.object({
  titulo: z.string().min(1).max(200),
  contenido: z.string().min(1),
  estado: z.enum(['BORRADOR', 'PUBLICADO']).optional(),
  etiquetas: z.array(z.string()).optional(),
})

// GET /api/publicaciones - Listar publicaciones
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const busqueda = searchParams.get('busqueda') || ''
  const etiqueta = searchParams.get('etiqueta') || ''

  const skip = (page - 1) * limit

  try {
    const where = {
      estado: 'PUBLICADO' as const,
      visible: true,
      ...(busqueda && {
        OR: [
          { titulo: { contains: busqueda, mode: 'insensitive' as const } },
          { contenido: { contains: busqueda, mode: 'insensitive' as const } },
        ]
      }),
      ...(etiqueta && {
        etiquetas: {
          some: {
            etiqueta: {
              nombre: { equals: etiqueta, mode: 'insensitive' as const }
            }
          }
        }
      })
    }

    const [publicaciones, total] = await Promise.all([
      prisma.publicacion.findMany({
        where,
        include: {
          autor: {
            select: { id: true, nombre: true, email: true }
          },
          _count: {
            select: { comentarios: true, meGustas: true }
          },
          etiquetas: {
            include: { etiqueta: true }
          }
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
      }),
      prisma.publicacion.count({ where })
    ])

    return NextResponse.json({
      publicaciones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo publicaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/publicaciones - Crear publicación
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { titulo, contenido, estado = 'BORRADOR', etiquetas = [] } = crearPublicacionSchema.parse(body)

    // Generar slug único
    const baseSlug = titulo.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1
    
    while (await prisma.publicacion.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Sanitizar contenido
    const tituloLimpio = sanitizeText(titulo)
    const contenidoLimpio = sanitizeHtml(contenido)

    const publicacion = await prisma.publicacion.create({
      data: {
        titulo: tituloLimpio,
        slug,
        contenido: contenidoLimpio,
        estado,
        autorId: session.user.id,
      },
      include: {
        autor: {
          select: { id: true, nombre: true, email: true }
        }
      }
    })

    // Crear etiquetas si se proporcionaron
    if (etiquetas.length > 0) {
      for (const nombreEtiqueta of etiquetas) {
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
            publicacionId: publicacion.id,
            etiquetaId: etiqueta.id
          }
        })
      }
    }

    await registrarAuditoria(session.user.id, 'crear', 'publicacion', publicacion.id)

    return NextResponse.json(publicacion, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando publicación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
