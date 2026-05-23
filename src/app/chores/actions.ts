'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToPartner } from '@/utils/webPush'

export async function addChore(coupleId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  try {
    const { error } = await supabase
      .from('chores')
      .insert([{ couple_id: coupleId, title }])

    if (error) {
      console.error(error)
      throw new Error('No se pudo añadir la tarea')
    }

    // Enviar notificación a la pareja (sin bloquear la ejecución de la UI)
    sendPushToPartner(coupleId, user.id, '🧹 Nueva tarea', `${user.user_metadata?.name || 'Tu pareja'} ha añadido la tarea: ${title}`, '/chores')
  } catch (error) {
    throw error
  }
}

export async function toggleChoreStatus(id: string, isDone: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error } = await supabase
    .from('chores')
    .update({ 
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function assignChore(id: string, assignedTo: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error } = await supabase
    .from('chores')
    .update({ assigned_to: assignedTo })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteChore(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No auth')

  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
