'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

const perfilSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type PerfilFormData = z.infer<typeof perfilSchema>

interface PerfilFormProps {
  usuario: {
    id: string
    nombre: string | null
    email: string
    rol: string
    creadoEn: string
    _count: {
      publicaciones: number
      comentarios: number
    }
  }
}

export function PerfilForm({ usuario }: PerfilFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: usuario.nombre || '',
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data: PerfilFormData) => {
    setLoading(true)

    try {
      const payload: any = {
        nombre: data.nombre,
      }

      if (data.password && data.password.trim()) {
        payload.password = data.password
      }

      const response = await fetch(`/api/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success('Perfil actualizado correctamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar perfil')
      }
    } catch (error) {
      toast.error('Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información de la Cuenta</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{usuario.email}</p>
              <p className="text-sm text-gray-500">
                El email no se puede cambiar
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <Badge variant={usuario.rol === 'ADMIN' ? 'danger' : 'primary'}>
                {usuario.rol}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miembro desde
              </label>
              <p className="text-gray-900">{formatearFecha(usuario.creadoEn)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publicaciones
                </label>
                <p className="text-2xl font-bold text-primary-600">
                  {usuario._count.publicaciones}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios
                </label>
                <p className="text-2xl font-bold text-primary-600">
                  {usuario._count.comentarios}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Editar Perfil</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre"
              {...register('nombre')}
              error={errors.nombre?.message}
              disabled={loading}
              helperText="Tu nombre será visible en tus publicaciones y comentarios"
            />

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cambiar Contraseña
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Deja estos campos vacíos si no quieres cambiar tu contraseña
              </p>

              <div className="space-y-4">
                <Input
                  label="Nueva Contraseña"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={loading}
                />

                <Input
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
