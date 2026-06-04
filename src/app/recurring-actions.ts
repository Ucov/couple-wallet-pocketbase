'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function addRecurringExpense(formData: FormData) {
  const pb = await createClient()
  if (!pb.authStore.isValid) return
  const user = pb.authStore.model

  if (!user || !user.couple_id) {
    return
  }

  const amount = parseFloat(formData.get('amount') as string)
  const concept = formData.get('concept') as string
  const category_id = formData.get('category_id') as string
  const day_of_month = parseInt(formData.get('day_of_month') as string, 10)

  if (!amount || !concept || !day_of_month) {
    return
  }

  try {
    await pb.collection('recurring_expenses').create({
      amount,
      concept,
      category_id: category_id || null,
      paid_by: user.id,
      couple_id: user.couple_id,
      day_of_month
    })
  } catch (error: any) {
    console.error('Error adding recurring expense:', error)
    return
  }

  revalidatePath('/recurring')
}

export async function deleteRecurringExpense(id: string) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  
  try {
    await pb.collection('recurring_expenses').delete(id)
  } catch (error: any) {
    console.error('Error deleting recurring expense:', error)
    throw new Error(error.message)
  }

  revalidatePath('/recurring')
}

export async function applyRecurringExpenses(coupleId: string, month: number, year: number, shouldRevalidate = true) {
  const pb = await createClient()

  // 1. Check if already applied
  let application: any = null
  try {
    application = await pb.collection('recurring_applications').getFirstListItem(`couple_id="${coupleId}" && month=${month} && year=${year}`)
  } catch(e) {}

  if (application) {
    // Already applied for this month
    return { success: true, appliedCount: 0 }
  }

  // 2. Fetch recurring expenses for this couple
  let recurring: any[] = []
  try {
    recurring = await pb.collection('recurring_expenses').getFullList({
      filter: `couple_id="${coupleId}"`
    })
  } catch(e) {}

  if (!recurring || recurring.length === 0) {
    // No expenses to apply, just mark as applied to avoid checking again
    try {
      await pb.collection('recurring_applications').create({
        couple_id: coupleId,
        month,
        year
      })
    } catch(e) {}
    return { success: true, appliedCount: 0 }
  }

  // 3. Insert expenses for this month
  for (const exp of recurring) {
    const date = new Date(year, month, exp.day_of_month)
    if (date.getMonth() !== month) {
        date.setDate(0)
    }
    try {
      await pb.collection('expenses').create({
        amount: exp.amount,
        concept: exp.concept,
        category_id: exp.category_id,
        paid_by: exp.paid_by,
        couple_id: exp.couple_id,
        date: date.toISOString(),
      })
    } catch (insertError: any) {
      console.error('Error applying recurring expenses:', insertError)
      throw new Error(insertError.message)
    }
  }

  // 4. Mark as applied
  try {
    await pb.collection('recurring_applications').create({
      couple_id: coupleId,
      month,
      year
    })
  } catch (markError: any) {
    console.error('Error marking recurring as applied:', markError)
  }

  if (shouldRevalidate) {
    revalidatePath('/')
  }
  return { success: true, appliedCount: recurring.length }
}
