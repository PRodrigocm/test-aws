import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sanitizeText } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const crearUsuarioSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  rol: z.enum(['USUARIO', 'ADMIN']).optional(),
})

const registroSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(6),
})

// GET /api/usuarios - Listar usuarios (solo admin)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const busqueda = searchParams.get('busqueda') || ''

  const skip = (page - 1) * limit

  try {
    const where = busqueda ? {
      OR: [
        { nombre: { contains: busqueda, mode: 'insensitive' as const } },
        { email: { contains: busqueda, mode: 'insensitive' as const } },
      ]
    } : {}

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          creadoEn: true,
          _count: {
            select: { publicaciones: true, comentarios: true }
          }
        },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
      }),
      prisma.usuario.count({ where })
    ])

    return NextResponse.json({
      usuarios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/usuarios - Crear usuario o registro público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const esRegistro = searchParams.get('registro') === 'true'

    if (esRegistro) {
      // Registro público
      const { nombre, email, password } = registroSchema.parse(body)

      // Verificar si el email ya existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      })

      if (usuarioExistente) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        )
      }

      const hashContrasena = await bcrypt.hash(password, 12)
      const nombreLimpio = nombre ? sanitizeText(nombre) : null

      const usuario = await prisma.usuario.create({
        data: {
          nombre: nombreLimpio,
          email,
          hashContrasena,
          rol: 'USUARIO',
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
        }
      })

      return NextResponse.json(usuario, { status: 201 })
    } else {
      // Creación por admin
      const session = await getServerSession(authOptions)
      
      if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }

      const { nombre, email, password, rol = 'USUARIO' } = crearUsuarioSchema.parse(body)

      // Verificar si el email ya existe
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      })

      if (usuarioExistente) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        )
      }

      const hashContrasena = await bcrypt.hash(password, 12)
      const nombreLimpio = nombre ? sanitizeText(nombre) : null

      const usuario = await prisma.usuario.create({
        data: {
          nombre: nombreLimpio,
          email,
          hashContrasena,
          rol,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          creadoEn: true,
        }
      })

      await registrarAuditoria(session.user.id, 'crear', 'usuario', usuario.id)

      return NextResponse.json(usuario, { status: 201 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
