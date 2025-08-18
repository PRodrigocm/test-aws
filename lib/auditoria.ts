import { prisma } from '@/lib/db'

export async function registrarAuditoria(
  actorId: string,
  accion: string,
  entidad: string,
  entidadId: string
) {
  try {
    await prisma.auditoria.create({
      data: {
        actorId,
        accion,
        entidad,
        entidadId,
      }
    })
  } catch (error) {
    console.error('Error registrando auditoría:', error)
  }
}
