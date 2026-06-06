'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCouple(formData: FormData) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  const name = formData.get('name') as string
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  let couple: any = null
  try {
    couple = await pb.collection('couples').create({ name, join_code: joinCode })
  } catch (coupleError: any) {
    redirect(`/setup-couple?message=${encodeURIComponent(coupleError.message)}`)
  }

  try {
    await pb.collection('users').update(user!.id, { couple_id: couple.id })
  } catch (profileError: any) {
    redirect(`/setup-couple?message=${encodeURIComponent(profileError.message)}`)
  }

  revalidatePath('/')
  redirect('/')
}

export async function joinCouple(formData: FormData) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  const joinCode = (formData.get('join_code') as string).trim().toUpperCase()

  if (!joinCode) {
    redirect(`/setup-couple?message=${encodeURIComponent('Introduce un código de invitación')}`)
  }

  let couple: any = null
  try {
    couple = await pb.collection('couples').getFirstListItem(`join_code="${joinCode}"`)
  } catch (coupleError: any) {
    console.error('Join code lookup failed:', coupleError?.message, coupleError?.response)
    redirect(`/setup-couple?message=${encodeURIComponent('Código no válido o no encontrado')}`)
  }

  if (!couple) {
    redirect(`/setup-couple?message=${encodeURIComponent('Código no válido')}`)
  }

  try {
    await pb.collection('users').update(user!.id, { couple_id: couple.id })
  } catch (profileError: any) {
    console.error('User update failed:', profileError?.message, profileError?.response)
    redirect(`/setup-couple?message=${encodeURIComponent('Error al unirse: ' + profileError.message)}`)
  }

  revalidatePath('/')
  redirect('/')
}

export async function leaveCouple() {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  try {
    await pb.collection('users').update(user!.id, { couple_id: null })
  } catch (profileError: any) {
    throw new Error(profileError.message)
  }

  revalidatePath('/')
  redirect('/')
}
