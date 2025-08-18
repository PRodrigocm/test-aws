import { requiereAdmin } from '@/lib/authz'
import { ModerarComentarios } from '@/components/admin/ModerarComentarios'

export const metadata = {
  title: 'Moderación de Comentarios - Admin',
  description: 'Moderar comentarios del sistema',
}

export default async function AdminComentariosPage() {
  await requiereAdmin()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Moderación de Comentarios
        </h1>
        <p className="text-gray-600">
          Revisa y modera los comentarios de la comunidad
        </p>
      </div>

      <ModerarComentarios />
    </div>
  )
}
