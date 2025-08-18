'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegistroFormData = z.infer<typeof registroSchema>

export function RegistroForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema)
  })

  const onSubmit = async (data: RegistroFormData) => {
    setLoading(true)

    try {
      const response = await fetch('/api/usuarios?registro=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
        }),
      })

      if (response.ok) {
        toast.success('Cuenta creada correctamente')
        router.push('/auth/login')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la cuenta')
      }
    } catch (error) {
      toast.error('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">Crear Cuenta</h1>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            {...register('nombre')}
            error={errors.nombre?.message}
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={loading}
          />

          <Input
            label="Contraseña"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            disabled={loading}
          />

          <Input
            label="Confirmar Contraseña"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            disabled={loading}
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Crear Cuenta
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <a href="/auth/login" className="text-primary-600 hover:text-primary-500">
              Inicia sesión
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
