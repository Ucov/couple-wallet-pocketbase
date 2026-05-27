'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function settleMonth(coupleId: string, month: number, year: number, amount: number, debtorId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('expenses')
    .insert({
      amount: amount,
      concept: 'Liquidación (Bizum)',
      date: new Date().toISOString(),
      paid_by: debtorId,
      couple_id: coupleId,
      is_transfer: true,
      category_id: null
    })

  if (error) {
    console.error('Error creating settlement transfer:', error)
    throw new Error(error.message)
  }

  revalidatePath('/')
}
