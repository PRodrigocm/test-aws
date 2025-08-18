'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import toast from 'react-hot-toast'

const comentarioSchema = z.object({
  contenido: z.string().min(1, 'El comentario es requerido').max(1000, 'Comentario muy largo'),
})

type ComentarioFormData = z.infer<typeof comentarioSchema>

interface ComentarioFormProps {
  publicacionId: string
  onSuccess?: () => void
}

export function ComentarioForm({ publicacionId, onSuccess }: ComentarioFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ComentarioFormData>({
    resolver: zodResolver(comentarioSchema)
  })

  const onSubmit = async (data: ComentarioFormData) => {
    setLoading(true)

    try {
      const response = await fetch('/api/comentarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contenido: data.contenido,
          publicacionId,
        }),
      })

      if (response.ok) {
        toast.success('Comentario agregado')
        reset()
        onSuccess?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al agregar comentario')
      }
    } catch (error) {
      toast.error('Error al agregar comentario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textarea
        label="Agregar comentario"
        rows={3}
        {...register('contenido')}
        error={errors.contenido?.message}
        disabled={loading}
        placeholder="Escribe tu comentario..."
      />

      <Button
        type="submit"
        loading={loading}
        size="sm"
      >
        Comentar
      </Button>
    </form>
  )
}
