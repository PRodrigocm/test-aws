import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { sanitizeText } from '@/lib/sanitize'
import { registrarAuditoria } from '@/lib/auditoria'

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['USUARIO', 'ADMIN']).optional(),
  activo: z.boolean().optional(),
})

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Solo admin o el mismo usuario pueden ver los datos
  if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/usuarios/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const datos = actualizarUsuarioSchema.parse(body)

    // Solo admin o el mismo usuario pueden actualizar
    const esAdminOPropietario = session.user.role === 'ADMIN' || session.user.id === params.id
    if (!esAdminOPropietario) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const datosActualizacion: any = {}

    if (datos.nombre !== undefined) {
      datosActualizacion.nombre = datos.nombre ? sanitizeText(datos.nombre) : null
    }

    if (datos.email && session.user.role === 'ADMIN') {
      // Verificar que el email no esté en uso
      const emailExistente = await prisma.usuario.findFirst({
        where: { 
          email: datos.email,
          id: { not: params.id }
        }
      })

      if (emailExistente) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 400 }
        )
      }

      datosActualizacion.email = datos.email
    }

    if (datos.password) {
      datosActualizacion.hashContrasena = await bcrypt.hash(datos.password, 12)
    }

    // Solo admin puede cambiar rol y estado activo
    if (session.user.role === 'ADMIN') {
      if (datos.rol) {
        datosActualizacion.rol = datos.rol
      }
      if (typeof datos.activo === 'boolean') {
        datosActualizacion.activo = datos.activo
      }
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: params.id },
      data: datosActualizacion,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
      }
    })

    await registrarAuditoria(session.user.id, 'actualizar', 'usuario', params.id)

    return NextResponse.json(usuarioActualizado)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // No permitir eliminar el propio usuario admin
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    await prisma.usuario.delete({
      where: { id: params.id }
    })

    await registrarAuditoria(session.user.id, 'eliminar', 'usuario', params.id)

    return NextResponse.json({ message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
