import { requiereAdmin } from '@/lib/authz'
import { ModerarPublicaciones } from '@/components/admin/ModerarPublicaciones'

export const metadata = {
  title: 'Moderación de Publicaciones - Admin',
  description: 'Moderar publicaciones del sistema',
}

export default async function AdminPublicacionesPage() {
  await requiereAdmin()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moderación de Publicaciones
        </h1>
        <p className="text-gray-600">
          Revisa y modera las publicaciones de la comunidad
        </p>
      </div>

      <ModerarPublicaciones />
    </div>
  )
}
