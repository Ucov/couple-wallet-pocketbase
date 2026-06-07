'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function settleMonth(coupleId: string, month: number, year: number, amount: number, debtorId: string) {
  const pb = await createClient()

  if (!pb.authStore.isValid) throw new Error('Not authenticated')

  try {
    let settleDateStr = new Date().toISOString()
    const settleDateObj = new Date()
    const currentMonth = settleDateObj.getMonth()
    const currentYear = settleDateObj.getFullYear()

    // Si se está saldando un mes anterior, usar el último día de ese mes a las 12:00 UTC
    // para evitar que por diferencias horarias caiga en el mes siguiente.
    if (month !== currentMonth || year !== currentYear) {
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
      const mStr = String(month + 1).padStart(2, '0')
      const dStr = String(lastDay).padStart(2, '0')
      settleDateStr = `${year}-${mStr}-${dStr}T12:00:00.000Z`
    }

    await pb.collection('expenses').create({
      amount: amount,
      concept: 'Liquidación (Bizum)',
      date: settleDateStr,
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
