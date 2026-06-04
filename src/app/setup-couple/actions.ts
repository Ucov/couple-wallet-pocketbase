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

  const joinCode = (formData.get('join_code') as string).toUpperCase()

  let couple: any = null
  try {
    couple = await pb.collection('couples').getFirstListItem(`join_code="${joinCode}"`)
  } catch (coupleError) {
    redirect(`/setup-couple?message=Código no válido`)
  }

  try {
    await pb.collection('users').update(user!.id, { couple_id: couple.id })
  } catch (profileError: any) {
    redirect(`/setup-couple?message=${encodeURIComponent(profileError.message)}`)
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
