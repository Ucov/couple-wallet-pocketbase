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

export async function finishShopping(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) throw new Error('No couple found')

  const amount = parseFloat(formData.get('amount') as string)
  if (isNaN(amount) || amount <= 0) throw new Error('Importe inválido')
  
  const conceptForm = formData.get('concept') as string || 'Compra supermercado'

  const { data: boughtItems } = await supabase
    .from('shopping_items')
    .select('name')
    .eq('couple_id', profile.couple_id)
    .eq('status', 'bought')

  if (!boughtItems || boughtItems.length === 0) {
    throw new Error('No hay artículos comprados')
  }

  let categoryId = null;
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', 'Comida')
    .maybeSingle()
  
  if (category) categoryId = category.id

  const itemsText = boughtItems.map(item => item.name).join(', ')
  const concept = `${conceptForm}: ${itemsText.length > 30 ? itemsText.substring(0, 27) + '...' : itemsText}`

  const { error: expenseError } = await supabase
    .from('expenses')
    .insert({
      amount,
      concept,
      category_id: categoryId,
      paid_by: user.id,
      couple_id: profile.couple_id
    })

  if (expenseError) throw new Error(expenseError.message)

  await supabase
    .from('shopping_items')
    .delete()
    .eq('couple_id', profile.couple_id)
    .eq('status', 'bought')

  revalidatePath('/shopping')
  revalidatePath('/')
  return { success: true }
}
