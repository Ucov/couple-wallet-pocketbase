'use server'

import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadDraftExpense(formData: FormData) {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  const file = formData.get('receipt') as File
  if (!file || file.size === 0) {
    redirect('/add?message=No se subió ninguna imagen')
  }

  try {
    const draftData = new FormData()
    draftData.append('amount', '0.01')
    draftData.append('concept', 'Procesando IA...')
    draftData.append('status', 'PENDING_AI')
    draftData.append('paid_by', user!.id)
    draftData.append('type', 'EXPENSE')
    draftData.append('is_refundable', 'false')
    draftData.append('date', new Date().toISOString())
    
    if (user?.couple_id) {
      draftData.append('couple_id', user.couple_id)
    }
    
    draftData.append('receipt', file)

    await pb.collection('expenses').create(draftData)
  } catch (error: any) {
    console.error('Error creating draft:', error)
    redirect(`/add?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  redirect('/')
}
