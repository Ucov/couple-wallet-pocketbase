'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToPartner } from '@/utils/webPush'

export async function addCalendarEvent(coupleId: string, title: string, dateIso: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

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
      return { error: 'No se pudo añadir el evento' }
    }
    
    sendPushToPartner(coupleId, user.id, '📅 Nuevo evento en agenda', `${user.user_metadata?.name || 'Tu pareja'} ha añadido: ${title}`, '/calendar')

    revalidatePath('/calendar')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleteCalendarEvent:', error)
      return { error: 'No se pudo borrar el evento' }
    }
    
    revalidatePath('/calendar')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}
