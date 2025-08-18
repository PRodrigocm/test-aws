'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const publicacionSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(200, 'Título muy largo'),
  contenido: z.string().min(1, 'El contenido es requerido'),
  estado: z.enum(['BORRADOR', 'PUBLICADO']),
  etiquetas: z.string().optional(),
})

type PublicacionFormData = z.infer<typeof publicacionSchema>

interface PublicacionFormProps {
  publicacion?: {
    id: string
    titulo: string
    contenido: string
    estado: 'BORRADOR' | 'PUBLICADO'
    etiquetas: { etiqueta: { nombre: string } }[]
  }
  onSuccess?: () => void
}

export function PublicacionForm({ publicacion, onSuccess }: PublicacionFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isEditing = !!publicacion

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PublicacionFormData>({
    resolver: zodResolver(publicacionSchema),
    defaultValues: {
      titulo: publicacion?.titulo || '',
      contenido: publicacion?.contenido || '',
      estado: publicacion?.estado || 'BORRADOR',
      etiquetas: publicacion?.etiquetas.map(e => e.etiqueta.nombre).join(', ') || '',
    }
  })

  const estado = watch('estado')

  const onSubmit = async (data: PublicacionFormData) => {
    setLoading(true)

    try {
      const etiquetasArray = data.etiquetas 
        ? data.etiquetas.split(',').map(e => e.trim()).filter(e => e.length > 0)
        : []

      const payload = {
        titulo: data.titulo,
        contenido: data.contenido,
        estado: data.estado,
        etiquetas: etiquetasArray,
      }

      const url = isEditing ? `/api/publicaciones/${publicacion.id}` : '/api/publicaciones'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(isEditing ? 'Publicación actualizada' : 'Publicación creada')
        onSuccess?.()
        if (!isEditing) {
          router.push('/dashboard/publicaciones')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar la publicación')
      }
    } catch (error) {
      toast.error('Error al guardar la publicación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Editar Publicación' : 'Nueva Publicación'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título"
            {...register('titulo')}
            error={errors.titulo?.message}
            disabled={loading}
          />

          <Textarea
            label="Contenido"
            rows={10}
            {...register('contenido')}
            error={errors.contenido?.message}
            disabled={loading}
            helperText="Puedes usar HTML básico para formato"
          />

          <Input
            label="Etiquetas"
            {...register('etiquetas')}
            error={errors.etiquetas?.message}
            disabled={loading}
            helperText="Separa las etiquetas con comas"
            placeholder="tecnología, programación, web"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BORRADOR"
                  {...register('estado')}
                  className="mr-2"
                  disabled={loading}
                />
                Borrador
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="PUBLICADO"
                  {...register('estado')}
                  className="mr-2"
                  disabled={loading}
                />
                Publicado
              </label>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="submit"
              loading={loading}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Publicación
            </Button>
            
            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setValue('estado', estado === 'BORRADOR' ? 'PUBLICADO' : 'BORRADOR')}
                disabled={loading}
              >
                {estado === 'BORRADOR' ? 'Crear y Publicar' : 'Crear como Borrador'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
