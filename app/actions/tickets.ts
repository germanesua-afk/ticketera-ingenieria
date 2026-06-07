'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateTicketSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().optional(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']),
  area_obra: z.string().optional(),
  fecha_fin_estimada: z.string().optional(),
})

export async function createTicket(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const parsed = CreateTicketSchema.safeParse({
    titulo: formData.get('titulo'),
    descripcion: formData.get('descripcion'),
    prioridad: formData.get('prioridad'),
    area_obra: formData.get('area_obra'),
    fecha_fin_estimada: formData.get('fecha_fin_estimada'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('usuarios')
    .select('id, rol, area_obra')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Perfil no encontrado' }

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      prioridad: parsed.data.prioridad,
      area_obra: parsed.data.area_obra || profile.area_obra,
      solicitante_id: profile.id,
      estado: 'NUEVO',
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return { error: 'Error al crear el ticket' }
  }

  revalidatePath('/')
  return { success: true, ticket: data }
}

export async function assignOwner(ticketId: string, duenoId: string) {
  const supabase = await createClient()

  // TODO: Validar que el usuario actual sea JEFEING o ADMIN según RLS + Server Action

  const { error } = await supabase
    .from('tickets')
    .update({ dueno_id: duenoId, estado: 'ASIGNADO' })
    .eq('id', ticketId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}
