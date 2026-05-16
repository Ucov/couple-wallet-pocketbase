'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function settleMonth(coupleId: string, month: number, year: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('settlements')
    .insert({
      couple_id: coupleId,
      month,
      year,
      settled_by: user.id
    })

  if (error) {
    console.error('Error settling month:', error)
    // If it fails because column doesn't exist, we can fallback to just couple_id, month, year
    // let's try without settled_by if it fails, or just throw
    if (error.code === 'PGRST204' || error.message.includes('settled_by')) {
        const { error: fallbackError } = await supabase
          .from('settlements')
          .insert({
            couple_id: coupleId,
            month,
            year
          })
        if (fallbackError) throw new Error(fallbackError.message)
    } else {
        throw new Error(error.message)
    }
  }

  revalidatePath('/')
}
