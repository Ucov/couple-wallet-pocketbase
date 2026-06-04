'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToPartner } from '@/utils/webPush'

export async function addCalendarEvent(coupleId: string, title: string, dateIso: string) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No autorizado' }
    const user = pb.authStore.model

    try {
      await pb.collection('calendar_events').create({
        couple_id: coupleId, 
        title, 
        date: dateIso, 
        created_by: user!.id 
      })
    } catch (error: any) {
      console.error('Error addCalendarEvent:', error)
      return { error: 'No se pudo añadir el evento' }
    }
    
    sendPushToPartner(coupleId, user!.id, '📅 Nuevo evento en agenda', `${user!.name || 'Tu pareja'} ha añadido: ${title}`, '/calendar')

    revalidatePath('/calendar')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No autorizado' }

    try {
      await pb.collection('calendar_events').delete(id)
    } catch (error: any) {
      console.error('Error deleteCalendarEvent:', error)
      return { error: 'No se pudo borrar el evento' }
    }
    
    revalidatePath('/calendar')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}
