import { LoginForm } from '@/components/forms/LoginForm'

export const metadata = {
  title: 'Iniciar Sesión - Foro App',
  description: 'Inicia sesión en tu cuenta del foro',
}

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoginForm />
    </div>
  )
}
