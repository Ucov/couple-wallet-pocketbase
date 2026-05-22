'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  const name = formData.get('name') as string
  if (name) {
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', user.id)
    if (error) throw new Error(error.message)
  }

  const password = formData.get('password') as string
  if (password && password.length >= 6) {
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/profile')
  return { success: true }
}

export async function saveSubscription(subscriptionJson: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user')

  await supabase
    .from('push_subscriptions')
    .insert({
      user_id: user.id,
      subscription_json: subscriptionJson
    })
}

export async function deleteSubscription(endpoint: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user')

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .contains('subscription_json', { endpoint })
}
