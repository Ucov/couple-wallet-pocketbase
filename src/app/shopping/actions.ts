'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendPushToPartner } from '@/utils/webPush'

export async function addShoppingItem(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('couple_id')
      .eq('id', user.id)
      .single()

    if (!profile?.couple_id) return { error: 'No couple found' }

    const name = formData.get('name') as string
    if (!name || !name.trim()) return { error: 'Name is empty' }

    const { data: existing } = await supabase
      .from('shopping_items')
      .select('id, status')
      .eq('couple_id', profile.couple_id)
      .ilike('name', name.trim())
      .maybeSingle()

    if (existing) {
      if (existing.status === 'bought') {
        const { error: updateError } = await supabase.from('shopping_items').update({ status: 'pending' }).eq('id', existing.id)
        if (updateError) return { error: updateError.message }
      }
    } else {
      const { error: insertError } = await supabase.from('shopping_items').insert({
        name: name.trim(),
        couple_id: profile.couple_id,
        created_by: user.id,
        status: 'pending'
      })
      if (insertError) return { error: insertError.message }
    }

    revalidatePath('/shopping')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function toggleShoppingItem(id: string, currentStatus: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const newStatus = currentStatus === 'pending' ? 'bought' : 'pending'
    
    const { error } = await supabase
      .from('shopping_items')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/shopping')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function deleteShoppingItem(id: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/shopping')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

export async function finishShopping(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('couple_id')
      .eq('id', user.id)
      .single()

    if (!profile?.couple_id) return { error: 'No couple found' }

    const amount = parseFloat(formData.get('amount') as string)
    if (isNaN(amount) || amount <= 0) return { error: 'Importe inválido' }
    
    const conceptForm = formData.get('concept') as string || 'Compra supermercado'

    const { data: boughtItems } = await supabase
      .from('shopping_items')
      .select('name')
      .eq('couple_id', profile.couple_id)
      .eq('status', 'bought')

    if (!boughtItems || boughtItems.length === 0) {
      return { error: 'No hay artículos comprados' }
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

    if (expenseError) return { error: expenseError.message }

    sendPushToPartner(profile.couple_id, user.id, '💰 Nueva compra registrada', `${user.user_metadata?.name || 'Tu pareja'} ha pagado ${amount}€ en el supermercado`, '/')

    await supabase
      .from('shopping_items')
      .delete()
      .eq('couple_id', profile.couple_id)
      .eq('status', 'bought')

    revalidatePath('/shopping')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || String(err) }
  }
}

