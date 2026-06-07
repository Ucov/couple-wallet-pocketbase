'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToPartner } from '@/utils/webPush'

export async function addChore(title: string) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No auth' }
    const user = pb.authStore.model
    if (!user?.couple_id) return { error: 'No couple' }

    try {
      await pb.collection('chores').create({
        couple_id: user.couple_id,
        title
      })
    } catch (error: any) {
      console.error(error)
      return { error: 'No se pudo añadir la tarea' }
    }

    sendPushToPartner(user.couple_id, user.id, '📌 Nueva tarea', `${user.name || 'Tu pareja'} ha añadido la tarea: ${title}`, '/chores')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function toggleChoreStatus(id: string, isDone: boolean) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No auth' }

    try {
      await pb.collection('chores').update(id, { 
        is_done: isDone
      })
    } catch (error: any) {
      return { error: error.message }
    }
    
    revalidatePath('/chores')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function assignChore(id: string, assignedTo: string | null) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No auth' }

    try {
      await pb.collection('chores').update(id, { assigned_to: assignedTo })
    } catch (error: any) {
      return { error: error.message }
    }

    revalidatePath('/chores')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function deleteChore(id: string) {
  try {
    const pb = await createClient()
    if (!pb.authStore.isValid) return { error: 'No auth' }

    try {
      await pb.collection('chores').delete(id)
    } catch (error: any) {
      return { error: error.message }
    }
    
    revalidatePath('/chores')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}
