import { requiereAdmin } from '@/lib/authz'
import { RegistroAuditoria } from '@/components/admin/RegistroAuditoria'

export const metadata = {
  title: 'Registro de Auditoría - Admin',
  description: 'Ver registro de auditoría del sistema',
}

export default async function AdminAuditoriaPage() {
  await requiereAdmin()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registro de Auditoría
        </h1>
        <p className="text-gray-600">
          Historial de todas las acciones realizadas en el sistema
        </p>
      </div>

      <RegistroAuditoria />
    </div>
  )
}
