import { RegistroForm } from '@/components/forms/RegistroForm'

export const metadata = {
  title: 'Crear Cuenta - Foro App',
  description: 'Crea tu cuenta en el foro',
}

export default function RegistroPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <RegistroForm />
    </div>
  )
}
