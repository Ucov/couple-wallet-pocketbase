'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import webpush from '@/lib/webpush'

const expenseSchema = z.object({
  amount: z.number().positive('La cantidad debe ser mayor a 0'),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  category_id: z.string().uuid('Categoría no válida').optional().nullable(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  paid_by_me: z.enum(['true', 'false']),
  is_refundable: z.boolean().optional().default(false),
})

export async function addExpense(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Validar con Zod
  const rawData = {
    amount: parseFloat(formData.get('amount') as string),
    concept: formData.get('concept') as string,
    category_id: formData.get('category_id') as string || null,
    date: formData.get('date') as string,
    paid_by_me: formData.get('paid_by_me') as 'true' | 'false',
    is_refundable: formData.get('is_refundable') === 'on',
  }

  const validatedFields = expenseSchema.safeParse(rawData)

  if (!validatedFields.success) {
    const errorMsg = validatedFields.error.issues[0].message
    redirect(`/add?message=${encodeURIComponent(errorMsg)}`)
  }

  const { amount, concept, category_id, date, paid_by_me, is_refundable } = validatedFields.data

  // Validar que la fecha no sea futura
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (selectedDate > today) {
    redirect('/add?message=La fecha no puede ser futura')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  let finalPaidBy = user.id
  let partnerId = null

  if (profile?.couple_id) {
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('couple_id', profile.couple_id)
      .neq('id', user.id)
      .maybeSingle()
      
    if (partnerProfile) {
      partnerId = partnerProfile.id
    }
  }

  // Si pagó la pareja, buscar su ID
  if (paid_by_me === 'false') {
    if (partnerId) {
      finalPaidBy = partnerId
    } else {
      redirect(`/add?message=${encodeURIComponent('No se encontró a tu pareja')}`)
    }
  }

  const { error } = await supabase.from('expenses').insert({
    amount,
    concept,
    category_id: category_id || null,
    paid_by: finalPaidBy,
    couple_id: profile?.couple_id || null,
    date: new Date(date).toISOString(),
    is_refundable,
  })

  if (error) {
    redirect(`/add?message=${encodeURIComponent(error.message)}`)
  }

  // Send push notification to partner
  if (partnerId && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription_json')
      .eq('user_id', partnerId)

    if (subscriptions && subscriptions.length > 0) {
      const payload = JSON.stringify({
        title: 'Nuevo gasto añadido 💰',
        body: `${concept} - €${amount.toFixed(2)}`,
        url: '/'
      })

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub.subscription_json, payload)
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase.from('push_subscriptions').delete().eq('user_id', partnerId).contains('subscription_json', { endpoint: sub.subscription_json.endpoint })
          } else {
            console.error('Error sending push notification:', err)
          }
        }
      }
    }
  }

  revalidatePath('/')
  redirect('/')
}
