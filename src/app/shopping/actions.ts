'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShoppingItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) throw new Error('No couple found')

  const name = formData.get('name') as string
  if (!name || !name.trim()) return

  // Comprobar si ya existe uno igual en el historial para reutilizarlo
  const { data: existing } = await supabase
    .from('shopping_items')
    .select('id, status')
    .eq('couple_id', profile.couple_id)
    .ilike('name', name.trim())
    .maybeSingle()

  if (existing) {
    if (existing.status === 'bought') {
      await supabase.from('shopping_items').update({ status: 'pending' }).eq('id', existing.id)
    }
  } else {
    await supabase.from('shopping_items').insert({
      name: name.trim(),
      couple_id: profile.couple_id,
      created_by: user.id,
      status: 'pending'
    })
  }

  revalidatePath('/shopping')
}

export async function toggleShoppingItem(id: string, currentStatus: string) {
  const supabase = await createClient()
  const newStatus = currentStatus === 'pending' ? 'bought' : 'pending'
  
  await supabase
    .from('shopping_items')
    .update({ status: newStatus })
    .eq('id', id)

  revalidatePath('/shopping')
}

export async function deleteShoppingItem(id: string) {
  const supabase = await createClient()
  await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)

  revalidatePath('/shopping')
}
