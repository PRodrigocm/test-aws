import { requiereAdmin } from '@/lib/authz'
import { GestionUsuarios } from '@/components/admin/GestionUsuarios'

export const metadata = {
  title: 'Gestión de Usuarios - Admin',
  description: 'Administrar usuarios del sistema',
}

export default async function AdminUsuariosPage() {
  await requiereAdmin()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600">
          Administra los usuarios del sistema
        </p>
      </div>

      <GestionUsuarios />
    </div>
  )
}
