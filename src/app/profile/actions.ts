'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('No estás autenticado')
  const user = pb.authStore.model

  const name = formData.get('name') as string
  if (name) {
    try {
      await pb.collection('users').update(user!.id, { name })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const password = formData.get('password') as string
  if (password && password.length >= 6) {
    try {
      await pb.collection('users').update(user!.id, {
        password: password,
        passwordConfirm: password
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  revalidatePath('/')
  revalidatePath('/profile')
  return { success: true }
}

export async function saveSubscription(subscriptionJson: any) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('No user')
  const user = pb.authStore.model

  try {
    await pb.collection('push_subscriptions').create({
      user_id: user!.id,
      subscription_json: subscriptionJson
    })
  } catch(e) {}
}

export async function deleteSubscription(endpoint: string) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('No user')
  const user = pb.authStore.model

  try {
    const subs = await pb.collection('push_subscriptions').getFullList({ filter: `user_id="${user!.id}"` })
    for (const sub of subs) {
      if (sub.subscription_json?.endpoint === endpoint) {
        await pb.collection('push_subscriptions').delete(sub.id)
      }
    }
  } catch(e) {}
}

export async function generateJoinCode(coupleId: string) {
  const pb = await createClient()
  if (!pb.authStore.isValid) return { error: 'No user' }

  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  try {
    const couple = await pb.collection('couples').getOne(coupleId)
    const coupleName = (couple.name && couple.name.trim() !== '') ? couple.name : 'Pareja de prueba'
    
    console.log(">> ACTUALIZANDO PAREJA", coupleId)
    console.log(">> CON DATOS:", { join_code: newCode, name: coupleName })

    await pb.collection('couples').update(coupleId, { 
      join_code: newCode,
      name: coupleName
    })
  } catch (error: any) {
    console.error(">> ERROR DE POCKETBASE:", error.data || error)
    return { error: `Error PB: ${JSON.stringify(error.data || error.message)}` }
  }

  revalidatePath('/profile')
  return { success: true, code: newCode }
}
