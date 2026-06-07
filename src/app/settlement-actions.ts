'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function settleMonth(coupleId: string, month: number, year: number, amount: number, debtorId: string) {
  const pb = await createClient()

  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  try {
    let settleDate = new Date()
    const currentMonth = settleDate.getMonth()
    const currentYear = settleDate.getFullYear()

    // Si se está saldando un mes anterior, usar el último día de ese mes a las 23:59:59
    if (month !== currentMonth || year !== currentYear) {
      settleDate = new Date(year, month + 1, 0, 23, 59, 59)
    }

    await pb.collection('expenses').create({
      amount: amount,
      concept: 'Liquidación (Bizum)',
      date: settleDate.toISOString(),
      paid_by: debtorId,
      couple_id: coupleId,
      is_transfer: true,
      category_id: null
    })
  } catch (error: any) {
    console.error('Error creating settlement transfer:', error)
    throw new Error(error.message)
  }

  revalidatePath('/')
}
