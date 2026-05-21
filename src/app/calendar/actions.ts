'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCalendarEvent(coupleId: string, title: string, dateIso: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase
    .from('calendar_events')
    .insert([{ 
      couple_id: coupleId, 
      title, 
      date: dateIso, 
      created_by: user.id 
    }])

  if (error) {
    console.error('Error addCalendarEvent:', error)
    throw new Error('No se pudo añadir el evento')
  }
  
  revalidatePath('/calendar')
}

export async function deleteCalendarEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleteCalendarEvent:', error)
    throw new Error('No se pudo borrar el evento')
  }
  
  revalidatePath('/calendar')
}
