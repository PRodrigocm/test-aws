import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function requiereUsuario() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }
  
  return session.user
}

export async function requiereAdmin() {
  const usuario = await requiereUsuario()
  
  if (usuario.role !== 'ADMIN') {
    redirect('/')
  }
  
  return usuario
}

export async function esPropietarioOAdmin(recursoAutorId: string) {
  const usuario = await requiereUsuario()
  
  return usuario.id === recursoAutorId || usuario.role === 'ADMIN'
}

export async function verificarUsuarioActivo(usuarioId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { activo: true }
  })
  
  return usuario?.activo ?? false
}
